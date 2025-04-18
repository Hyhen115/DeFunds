import React from "react";
import { Box, Typography } from "@mui/material";

const VotingBubble = ({ isVoting, sx }) => {
  if (!isVoting) return null; // Don't render if no voting is ongoing

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid #7b1fa2", // Purple border
        borderRadius: "12px",
        backgroundColor: "#ffffff",
        px: 1.5,
        py: 0.5,
        ...sx, // Allow custom styles
      }}
      aria-label="Voting proposal active"
    >
      <Typography
        variant="body2"
        sx={{
          color: "#7b1fa2", // Purple text
          fontWeight: "bold",
          fontSize: "0.75rem",
        }}
      >
        Voting
      </Typography>
    </Box>
  );
};

export default VotingBubble;