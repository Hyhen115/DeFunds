import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Box, Collapse } from "@mui/material";
import { connectWallet } from "../utils/wallet";
import makeBlockie from "ethereum-blockies-base64";

const Navbar = ({ account, setAccount, setWeb3 }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleConnect = async () => {
    try {
      console.log("Connecting to wallet...");
      const { web3, account: newAccount } = await connectWallet();
      console.log("Connected:", { web3, account: newAccount });
      setWeb3(web3);
      setAccount(newAccount);
    } catch (error) {
      console.error("Wallet connection error:", error);
      alert(error.message);
    }
  };

  const handleLogout = () => {
    setAccount(null);
    setWeb3(null);
    setDropdownOpen(false);
    console.log("Logged out");
    navigate("/"); // Redirect to home page after logout
  };

  const handleRestrictedClick = (path) => {
    if (!account) {
      alert("Please connect your wallet to access this feature.");
      return;
    }
    navigate(path);
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  console.log("Rendering Navbar, account:", account, "isMounted:", isMounted);

  if (!setAccount || !setWeb3) {
    console.error("setAccount or setWeb3 is undefined");
    return <div>Error: Missing required props</div>;
  }

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #E0E0E0" }}
    >
      <Toolbar sx={{ minHeight: 64 }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <img
            src="src/assets/logo.png"
            alt="De Funds Und Freedom Logo"
            style={{ height: "50px", width: "auto", marginRight: "8px" }}
          />
          <Typography
            variant="h6"
            sx={{
              color: "#000000",
              flexGrow: 0,
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            De Funds
          </Typography>
        </Link>
        <Button
          onClick={() => handleRestrictedClick("/mycampaign")}
          sx={{
            color: account ? "#000000" : "#A0A0A0",
            mx: 1,
            textTransform: "none",
            pointerEvents: account ? "auto" : "none",
          }}
        >
          My Campaigns
        </Button>
        <Box sx={{ display: "flex", alignItems: "center", ml: "auto" }}>
          <Button
            onClick={() => handleRestrictedClick("/create")}
            sx={{
              mx: 1,
              textTransform: "none",
              ...(account
                ? {
                    variant: "outlined",
                    color: "#000000",
                    borderColor: "#000000",
                    border: "1px solid #000000",
                  }
                : {
                    color: "none",
                    pointerEvents: "none",
                    border: "none",
                  }),
            }}
          >
            Start a Campaign
          </Button>
          {account && isMounted ? (
            <Box sx={{ position: "relative", mx: 1 }}>
              <Box
                sx={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <img
                  src={makeBlockie(account)}
                  alt="Account Icon"
                  style={{
                    height: "24px",
                    width: "24px",
                    borderRadius: "50%",
                  }}
                />
              </Box>
              <Collapse in={dropdownOpen}>
                <Box
                  sx={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E0E0E0",
                    borderRadius: "4px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    zIndex: 1,
                    p: 1,
                    minWidth: "200px",
                  }}
                >
                  <Typography sx={{ color: "#000000", mb: 1 }}>
                    {`${account.slice(0, 6)}...${account.slice(-4)}`}
                  </Typography>
                  <Button
                    variant="outlined"
                    sx={{
                      color: "#CF142B",
                      borderColor: "#CF142B",
                      textTransform: "none",
                      width: "100%",
                    }}
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </Box>
              </Collapse>
            </Box>
          ) : (
            <Button
              variant="outlined"
              sx={{
                color: "#4F90FF",
                borderColor: "#4F90FF",
                mx: 1,
                textTransform: "none",
              }}
              onClick={handleConnect}
            >
              Connect Wallet
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;