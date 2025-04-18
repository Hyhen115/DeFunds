import React, { useState } from "react";
import { Card, CardContent, Typography, Box, LinearProgress } from "@mui/material";
import makeBlockie from "ethereum-blockies-base64";
import defaultImage from "../assets/defualt.jpg";
import StateBubble from "./StateBubble";

const CampaignCard = ({ title, imageUrl, campaignAddress, deadline, raised, goal, state }) => {
  const [imgSrc, setImgSrc] = useState(imageUrl || defaultImage);
  const truncatedAddress = `${campaignAddress.slice(0, 6)}...${campaignAddress.slice(-4)}`;
  const currentTime = Math.floor(Date.now() / 1000);
  const remainingSeconds = deadline - currentTime;
  const remainingDays = remainingSeconds > 0 ? Math.ceil(remainingSeconds / (60 * 60 * 24)) : 0;
  const percentage = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;
  const blockie = makeBlockie(campaignAddress);

  // Fallback to a placeholder if both imageUrl and defaultImage fail
  const handleImageError = () => {
    setImgSrc("https://via.placeholder.com/150?text=No+Image");
  };

  return (
    <Card
      sx={{
        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
        borderRadius: "5px",
        "&:hover": {
          transform: "translateY(-4px)",
          transition: "transform 0.3s ease",
          cursor: "pointer",
        },
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ mb: 2, display: "flex", justifyContent: "center", alignItems: "center", height: "150px", overflow: "hidden" }}>
          <img
            src={imgSrc}
            alt={title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={handleImageError}
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Box sx={{ mr: 1 }}>
              <img src={blockie} alt="Campaign Blockie" style={{ width: 32, height: 32, borderRadius: "50%" }} />
            </Box>
            <Box>
              <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }}>
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {truncatedAddress}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "state-between", mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {state === "Active" && remainingDays > 0 ? `Days Left: ${remainingDays}` : state}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {percentage.toFixed(2)}% Funded
            </Typography>
          </Box>
          <StateBubble state={state} sx={{ mt: 1 }} />
        </Box>
      </CardContent>
      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{
          height: 6,
          borderRadius: "0 0 8px 8px",
          backgroundColor: "#e0e0e0",
          "& .MuiLinearProgress-bar": { backgroundColor: "#4caf50" },
        }}
      />
    </Card>
  );
};

export default CampaignCard;