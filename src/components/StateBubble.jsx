import React from "react";
import { Box, Typography } from "@mui/material";

const StateBubble = ({ state, sx }) => {
  // Define colors for each state
  const stateStyles = {
    Active: { borderColor: "#1976d2", color: "#1976d2" }, // Blue
    Success: { borderColor: "#4caf50", color: "#4caf50" }, // Green
    Fail: { borderColor: "#f44336", color: "#f44336" }, // Red
    Unknown: { borderColor: "#000000", color: "#000000" }, // Black for invalid states
  };

  // Validate state
  const validState = ["Active", "Success", "Fail"].includes(state) ? state : "Unknown";

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        border: `1px solid ${stateStyles[validState].borderColor}`,
        borderRadius: "12px",
        backgroundColor: "#ffffff",
        px: 1.5,
        py: 0.5,
        ...sx, // Allow custom styles to be passed
      }}
      aria-label={`Campaign state: ${validState}`}
    >
      <Typography
        variant="body2"
        sx={{
          color: stateStyles[validState].color,
          fontWeight: "bold",
          fontSize: "0.75rem",
        }}
      >
        {validState}
      </Typography>
    </Box>
  );
};

export default StateBubble;