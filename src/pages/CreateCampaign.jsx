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
  CircularProgress,
} from "@mui/material";
import formBackground from "../assets/homeBackground.png";

// Gradient Circular Progress component
function GradientCircularProgress() {
  return (
    <React.Fragment>
      <svg width={0} height={0}>
        <defs>
          <linearGradient id="my_gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e01cd5" />
            <stop offset="100%" stopColor="#1CB5E0" />
          </linearGradient>
        </defs>
      </svg>
      <CircularProgress sx={{ "svg circle": { stroke: "url(#my_gradient)" } }} />
    </React.Fragment>
  );
}

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
  const [newCampaignAddress, setNewCampaignAddress] = useState("");
  const [error, setError] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) return "Campaign title is required";
    if (!formData.description.trim()) return "Description is required";
    const fundingGoal = parseFloat(formData.fundingGoal);
    if (isNaN(fundingGoal) || fundingGoal <= 0) return "Funding goal must be a positive number";
    if (!formData.deadline) return "Deadline is required";
    if (formData.imageURL && !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(formData.imageURL)) {
      return "Image URL must be a valid URL (if provided)";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (activeStep === 0) {
      // Step 1: Validate and initiate campaign deployment
      const validationError = validateForm();
      if (validationError) {
        setError(validationError);
        return;
      }

      try {
        if (!web3 || !account || !factoryContract) {
          throw new Error("Please connect your wallet and ensure the app is initialized");
        }

        const fundingGoalInWei = web3.utils.toWei(formData.fundingGoal, "ether");
        const deadlineDate = new Date(formData.deadline);
        const deadlineTimestamp = Math.floor(deadlineDate.getTime() / 1000);
        const currentTime = Math.floor(Date.now() / 1000);
        if (deadlineTimestamp <= currentTime) {
          throw new Error("Deadline must be in the future");
        }

        setIsDeploying(true);
        setActiveStep(1); // Move to "Deploying Campaign"

        const { title, description, imageURL } = formData;
        const tx = await factoryContract.methods
          .createCampaign(
            title,
            description,
            fundingGoalInWei,
            deadlineTimestamp,
            imageURL || ""
          )
          .send({ from: account })
          .catch((err) => {
            if (err.code === 4001) {
              throw new Error("Transaction rejected by user");
            }
            throw err;
          });

        // Safely access the event
        if (!tx.events || !tx.events.CampaignCreated) {
          throw new Error("CampaignCreated event not found in transaction receipt");
        }
        const campaignAddress = tx.events.CampaignCreated.returnValues.campaignAddress;
        if (!web3.utils.isAddress(campaignAddress)) {
          throw new Error("Invalid campaign address received");
        }
        setNewCampaignAddress(campaignAddress);

        // Move to "Campaign Launched"
        setActiveStep(2);
        setIsDeploying(false);
      } catch (err) {
        console.error("Error creating campaign:", err);
        let errorMessage = "Failed to create campaign";
        if (err.message.includes("Transaction rejected")) {
          errorMessage = "You rejected the transaction in your wallet";
        } else if (err.message.includes("deadline must be in the future")) {
          errorMessage = "The deadline must be a future date";
        } else if (err.message.includes("name is empty")) {
          errorMessage = "Campaign title cannot be empty";
        } else if (err.message.includes("target must > 0")) {
          errorMessage = "Funding goal must be greater than 0";
        }
        setError(errorMessage);
        setActiveStep(0);
        setIsDeploying(false);
      }
    } else if (activeStep === 2) {
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
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ mt: 1 }}>
              Deploying your campaign...
            </Typography>
            <GradientCircularProgress />
          </Box>
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

        {error && activeStep === 0 && (
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
              error={!!error && error.includes("title")}
              helperText={error && error.includes("title") ? error : ""}
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
              error={!!error && error.includes("Description")}
              helperText={error && error.includes("Description") ? error : ""}
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
              error={!!error && error.includes("Funding goal")}
              helperText={error && error.includes("Funding goal") ? error : ""}
              inputProps={{ min: "0.0001", step: "0.0001" }}
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
              error={!!error && error.includes("deadline")}
              helperText={error && error.includes("deadline") ? error : ""}
            />
            <TextField
              label="Image URL (optional)"
              variant="outlined"
              fullWidth
              margin="normal"
              name="imageURL"
              value={formData.imageURL}
              onChange={handleInputChange}
              error={!!error && error.includes("Image URL")}
              helperText={error && error.includes("Image URL") ? error : ""}
            />
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
                disabled={isDeploying || !account}
              >
                Next
              </Button>
            </Box>
          </form>
        ) : (
          activeStep === 2 && (
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
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
                Create Another
              </Button>
            </Box>
          )
        )}
      </Box>
    </Box>
  );
};

export default CreateCampaign;