// src/pages/CreateCampaign.jsx
import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import formBackground from "../assets/homeBackground.png"; // Ensure this file exists

const steps = [
  "Campaign Details",
  "Deploying Campaign",
  "Campaign Launched",
];

const CreateCampaign = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    fundingGoal: "",
    deadline: "",
    imageURL: "",
  });

  // Update form data state when an input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission and advance the stepper
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Campaign data submitted:", formData);
    // TODO: Integrate your web3.js logic here to interact with your smart contract.
    // For demonstration, we advance the stepper.
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      // Final step reached; reset or show success message as needed.
      setActiveStep(0);
      setFormData({
        title: "",
        description: "",
        fundingGoal: "",
        deadline: "",
        imageURL: "",
      });
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

        <Typography variant="h4" gutterBottom sx={{ mt: 1 }}>
          Create Campaign
        </Typography>
        <Typography variant="body1" gutterBottom>
          Fill in the details below to set up your new campaign.
        </Typography>

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
              {activeStep === steps.length - 1 ? "Finish" : "Next"}
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default CreateCampaign;
