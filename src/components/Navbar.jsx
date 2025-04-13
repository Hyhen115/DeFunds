// src/components/Navbar.jsx
import React from "react";
import { Link } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";

const Navbar = () => {
  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #E0E0E0" }}
    >
      <Toolbar sx={{ minHeight: 64 }}>
        {/* dApp Name */}
        <Typography
          variant="h6"
          component="div"
          sx={{ color: "#000000", flexGrow: 0, mr: 2 }}
        >
          Crowdfunding dApp
        </Typography>
        {/* My Campaigns */}
        <Button
          component={Link}
          to="/campaigns"
          sx={{ color: "#000000", mx: 1, textTransform: "none" }}
        >
          My Campaigns
        </Button>
        {/* Right Side: Start a Campaign, Connect Wallet */}
        <Box sx={{ display: "flex", ml: "auto" }}>
          <Button
            component={Link}
            to="/create"
            sx={{ color: "#000000", mx: 1, textTransform: "none" }}
          >
            Start a Campaign
          </Button>
          <Button
            variant="outlined"
            sx={{
              color: "#000000",
              borderColor: "#000000",
              mx: 1,
              textTransform: "none",
            }}
            onClick={() => alert("Wallet connection coming soon!")}
          >
            Connect Wallet
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;