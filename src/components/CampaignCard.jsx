import React from "react";
import { Card, CardContent, Typography, Box, LinearProgress } from "@mui/material";

const CampaignCard = ({ title, imageUrl, ownerAddress, deadline, raised, goal }) => {
  // Default image if no imageUrl is provided
  const defaultImage = "https://via.placeholder.com/150?text=No+Image";
  const displayImage = imageUrl || defaultImage;

  // Truncate the owner address for readability (e.g., 0x123456...abcd)
  const truncatedAddress = `${ownerAddress.slice(0, 6)}...${ownerAddress.slice(-4)}`;

  // Calculate remaining days from the deadline (assuming deadline is a Unix timestamp in seconds)
  const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
  const remainingSeconds = deadline - currentTime;
  const remainingDays = remainingSeconds > 0 ? Math.ceil(remainingSeconds / (60 * 60 * 24)) : 0;

  // Calculate the percentage of funds raised (cap at 100% if overfunded)
  const percentage = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;

  return (
    <Card
      sx={{
        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
        borderRadius: "8px",
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
        {/* Campaign Title */}
        <Typography variant="h5" component="div" sx={{ mb: 1 }}>
          {title}
        </Typography>

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
          <Typography variant="body2" color="text.secondary">
            Owner: {truncatedAddress}
          </Typography>
          {/* Status and Percentage on the Same Row */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {remainingDays > 0 ? `Days Left: ${remainingDays}` : "Campaign Ended"}
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