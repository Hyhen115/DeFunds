import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { connectWallet } from "../utils/wallet";
import makeBlockie from "ethereum-blockies-base64";

const Navbar = ({ account, setAccount, setWeb3 }) => {
  const [isMounted, setIsMounted] = useState(false);

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
        <Typography
          variant="h6"
          component="div"
          sx={{ color: "#000000", flexGrow: 0, mr: 2 }}
        >
          Crowdfunding dApp
        </Typography>
        <Button
          component={Link}
          to="/campaigns"
          sx={{ color: "#000000", mx: 1, textTransform: "none" }}
        >
          My Campaigns
        </Button>
        <Box sx={{ display: "flex", ml: "auto" }}>
          <Button
            component={Link}
            to="/create"
            sx={{ color: "#000000", mx: 1, textTransform: "none" }}
          >
            Start a Campaign
          </Button>
          {account && isMounted ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mx: 1,
                pointerEvents: "none",
              }}
            >
              <img
                src={makeBlockie(account)}
                alt="Account Icon"
                style={{
                  height: "24px",
                  width: "24px",
                  marginRight: "4px",
                  borderRadius: "50%",
                }}
              />
              <Typography sx={{ color: "#000000" }}>
                {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "Loading..."}
              </Typography>
            </Box>
          ) : (
            <Button
              variant="outlined"
              sx={{
                color: "#000000",
                borderColor: "#000000",
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