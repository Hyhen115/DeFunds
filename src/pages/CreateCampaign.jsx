import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Link,
} from "@mui/material";
import formBackground from "../assets/homeBackground.png"; // Ensure this file exists

const steps = [
  "Campaign Details",
  "Deploying Campaign",
  "Campaign Launched",
];

const CreateCampaign = ({ web3, account, factoryContract }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    fundingGoal: "",
    deadline: "",
    imageURL: "",
  });
  const [newCampaignAddress, setNewCampaignAddress] = useState(""); // Store the new campaign address
  const [error, setError] = useState(""); // Store any errors

  // Update form data state when an input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission and advance the stepper
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset error state
    setError("");

    if (activeStep === 0) {
      // Step 1: Validate and deploy the campaign
      try {
        if (!web3 || !account || !factoryContract) {
          throw new Error("Web3, account, or factory contract not available");
        }

        // Convert funding goal from ETH to Wei
        const fundingGoalInWei = web3.utils.toWei(formData.fundingGoal, "ether");

        // Convert deadline (date string) to a Unix timestamp in seconds
        const deadlineDate = new Date(formData.deadline);
        const deadlineTimestamp = Math.floor(deadlineDate.getTime() / 1000); // Deadline in seconds

        // Validate that the deadline is in the future
        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
        if (deadlineTimestamp <= currentTime) {
          throw new Error("Deadline must be in the future");
        }

        // Prepare the parameters for createCampaign
        const { title, description, imageURL } = formData;

        // Call createCampaign on the factory contract
        const tx = await factoryContract.methods
          .createCampaign(
            title,
            description,
            fundingGoalInWei,
            deadlineTimestamp, // Pass the timestamp directly
            imageURL || "" // Use empty string if no image URL
          )
          .send({ from: account });

        // Listen for the CampaignCreated event to get the new campaign address
        const event = tx.events.CampaignCreated;
        if (!event) {
          throw new Error("CampaignCreated event not found in transaction receipt");
        }
        const campaignAddress = event.returnValues.campaignAddress;
        setNewCampaignAddress(campaignAddress);

        // Advance to the next step (Deploying Campaign)
        setActiveStep(activeStep + 1);
      } catch (err) {
        console.error("Error creating campaign:", err);
        setError(err.message || "Failed to create campaign");
      }
    } else if (activeStep === 1) {
      // Step 2: Simulate deployment (already deployed in step 1)
      setActiveStep(activeStep + 1);
    } else {
      // Step 3: Reset the form and stepper
      setActiveStep(0);
      setFormData({
        title: "",
        description: "",
        fundingGoal: "",
        deadline: "",
        imageURL: "",
      });
      setNewCampaignAddress("");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: `url(${formBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        p: 2,
      }}
    >
      <Box
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          p: 4,
          borderRadius: 2,
          boxShadow: 3,
          width: "100%",
          maxWidth: "600px",
        }}
      >
        {/* Horizontal Stepper */}
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <>
            <Typography variant="h4" gutterBottom sx={{ mt: 1 }}>
              Create Campaign
            </Typography>
            <Typography variant="body1" gutterBottom>
              Fill in the details below to set up your new campaign.
            </Typography>
          </>
        )}

        {activeStep === 1 && (
          <Typography variant="h5" gutterBottom sx={{ mt: 1 }}>
            Deploying your campaign...
          </Typography>
        )}

        {activeStep === 2 && (
          <>
            <Typography variant="h5" gutterBottom sx={{ mt: 1 }}>
              Campaign Launched Successfully!
            </Typography>
            {newCampaignAddress && (
              <Typography variant="body1" gutterBottom>
                View your campaign on Sepolia Etherscan:{" "}
                <Link
                  href={`https://sepolia.etherscan.io/address/${newCampaignAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: "#4F90FF" }}
                >
                  {newCampaignAddress}
                </Link>
              </Typography>
            )}
          </>
        )}

        {error && (
          <Typography variant="body2" color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {activeStep === 0 ? (
          <form onSubmit={handleSubmit}>
            <TextField
              label="Campaign Title"
              variant="outlined"
              fullWidth
              margin="normal"
              required
              name="title"
              value={formData.title}
              onChange={handleInputChange}
            />
            <TextField
              label="Description"
              variant="outlined"
              fullWidth
              margin="normal"
              multiline
              rows={4}
              required
              name="description"
              value={formData.description}
              onChange={handleInputChange}
            />
            <TextField
              label="Funding Goal (in ETH)"
              variant="outlined"
              fullWidth
              margin="normal"
              type="number"
              required
              name="fundingGoal"
              value={formData.fundingGoal}
              onChange={handleInputChange}
            />
            <TextField
              label="Deadline"
              variant="outlined"
              fullWidth
              margin="normal"
              type="date"
              required
              InputLabelProps={{ shrink: true }}
              name="deadline"
              value={formData.deadline}
              onChange={handleInputChange}
            />
            <TextField
              label="Image URL (optional)"
              variant="outlined"
              fullWidth
              margin="normal"
              name="imageURL"
              value={formData.imageURL}
              onChange={handleInputChange}
            />

            {/* Next Button aligned right */}
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                type="submit"
                variant="outlined"
                sx={{
                  mt: 2,
                  color: "#4F90FF",
                  borderColor: "#4F90FF",
                  textTransform: "none",
                }}
              >
                Next
              </Button>
            </Box>
          </form>
        ) : (
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="outlined"
              sx={{
                mt: 2,
                color: "#4F90FF",
                borderColor: "#4F90FF",
                textTransform: "none",
              }}
              onClick={handleSubmit}
            >
              {activeStep === steps.length - 1 ? "Finish" : "Next"}
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default CreateCampaign;