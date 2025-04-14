import React from "react";
import { Card, CardContent, Typography, Box, LinearProgress } from "@mui/material";
import makeBlockie from "ethereum-blockies-base64"; // Import the blockie generator

const CampaignCard = ({ title, imageUrl, ownerAddress, deadline, raised, goal }) => {
  // Default image if no imageUrl is provided
  const defaultImage = "../assets/defualt.jpg";
  const displayImage = imageUrl || defaultImage;

  // Truncate the owner address for readability (e.g., 0x123456...abcd)
  const truncatedAddress = `${ownerAddress.slice(0, 6)}...${ownerAddress.slice(-4)}`;

  // Calculate remaining days and campaign state
  const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
  const remainingSeconds = deadline - currentTime;
  const remainingDays = remainingSeconds > 0 ? Math.ceil(remainingSeconds / (60 * 60 * 24)) : 0;
  // Check if the campaign has ended and failed (didn't meet goal)
  const hasEnded = remainingSeconds <= 0;
  const hasFailed = hasEnded && raised < goal;
  const statusText = remainingDays > 0 ? `Days Left: ${remainingDays}` : hasFailed ? "Failed" : "Ended";

  // Calculate the percentage of funds raised (cap at 100% if overfunded)
  const percentage = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;

  // Generate blockie for the owner address
  const blockie = makeBlockie(ownerAddress);

  return (
    <Card
      sx={{
        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
        borderRadius: "5px",
        "&:hover": {
          transform: "translateY(-4px)",
          transition: "transform 0.3s ease",
        },
        display: "flex",
        flexDirection: "column",
        height: "100%", // Ensures the card takes full height
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Campaign Image */}
        <Box
          sx={{
            mb: 2,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "150px", // Fixed height for consistency
            overflow: "hidden",
          }}
        >
          <img
            src={displayImage}
            alt={title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover", // Ensures image fits nicely
            }}
          />
        </Box>

        {/* Campaign Details */}
        <Box sx={{ mb: 2 }}>
          {/* First Row: Blockie on Left, Campaign Title and Address on Right */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            {/* Left: Blockie */}
            <Box sx={{ mr: 1 }}>
              <img
                src={blockie}
                alt="Owner Blockie"
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%", // Optional: makes the blockie circular
                }}
              />
            </Box>
            {/* Right: Campaign Title (Bold, Larger) and Address in Two Rows */}
            <Box>
              <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }}>
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {truncatedAddress}
              </Typography>
            </Box>
          </Box>

          {/* Second Row: State and Percentage */}
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" color="text.secondary">
              {statusText}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {percentage.toFixed(2)}% Funded
            </Typography>
          </Box>
        </Box>
      </CardContent>

      {/* Progress Bar at Bottom Border (Green) */}
      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{
          height: 6,
          borderRadius: "0 0 8px 8px", // Matches card’s bottom corners
          backgroundColor: "#e0e0e0", // Background of the progress bar (unfilled part)
          "& .MuiLinearProgress-bar": {
            backgroundColor: "#4caf50", // Green color for the filled part
          },
        }}
      />
    </Card>
  );
};

export default CampaignCard;