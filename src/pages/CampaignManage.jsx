import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Alert,
  Button,
  TextField,
  LinearProgress,
  Paper,
  CardMedia,
} from "@mui/material";
import { initializeCrowdfundContract } from "../utils/crowdfundContract";
import homeBackground from "../assets/homeBackground.png";
import campaignImage from "../assets/defualt.jpg";
import GradientCircularProgress from "../components/GradientCircularProgress";
import StateBubble from "../components/StateBubble";

const CampaignManage = ({ account, web3 }) => {
  const { address } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "error" });
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [proposalDays, setProposalDays] = useState("");
  const [isProposing, setIsProposing] = useState(false);

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!web3 || !account || !address) {
        setAlert({ open: true, message: "Please connect your wallet and provide a valid campaign address.", severity: "error" });
        setIsLoading(false);
        return;
      }

      const campaignContract = initializeCrowdfundContract(web3, address);
      if (!campaignContract) {
        setAlert({ open: true, message: "Failed to initialize campaign contract.", severity: "error" });
        setIsLoading(false);
        return;
      }

      try {
        const name = await campaignContract.methods.campaignName().call();
        const state = await campaignContract.methods.getState().call();
        const deadline = await campaignContract.methods.deadline().call();
        const balance = await campaignContract.methods.getContractBalance().call();
        const totalDonations = await campaignContract.methods.totalDonations().call();
        const target = await campaignContract.methods.target().call();
        const curProposal = await campaignContract.methods.curProposal().call();
        const voteEndTime = await campaignContract.methods.voteEndTime().call();
        const owner = await campaignContract.methods.owner().call();
        const image = await campaignContract.methods.image().call() || campaignImage;

        let status;
        switch (Number(state)) {
          case 0:
            status = "Active";
            break;
          case 1:
            status = "Success";
            break;
          case 2:
            status = "Fail";
            break;
          default:
            console.warn("Unknown campaign state:", state);
            status = "Unknown";
        }

        const deadlineDate = new Date(Number(deadline) * 1000).toISOString().split("T")[0];

        setCampaign({
          address,
          name,
          status,
          deadline: deadlineDate,
          balance: parseFloat(web3.utils.fromWei(balance, "ether")),
          totalDonations: parseFloat(web3.utils.fromWei(totalDonations, "ether")),
          target: parseFloat(web3.utils.fromWei(target, "ether")),
          proposalActive: curProposal.active && Number(voteEndTime) > Math.floor(Date.now() / 1000),
          proposalVotesFor: parseFloat(web3.utils.fromWei(curProposal.votesFor, "ether")),
          proposalVotesAgainst: parseFloat(web3.utils.fromWei(curProposal.votesAgainst, "ether")),
          proposedDays: Number(curProposal.proposedDays),
          owner,
          image,
        });
      } catch (error) {
        console.error("Error fetching campaign data:", error);
        setAlert({ open: true, message: "Failed to fetch campaign data.", severity: "error" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaign();
  }, [web3, account, address]);

  const handleWithdraw = async () => {
    if (!web3 || !account || !campaign) {
      setAlert({ open: true, message: "Please connect your wallet.", severity: "error" });
      return;
    }

    if (campaign.status !== "Success") {
      setAlert({ open: true, message: "Campaign must be in Success state to withdraw funds.", severity: "error" });
      return;
    }

    if (campaign.owner.toLowerCase() !== account.toLowerCase()) {
      setAlert({ open: true, message: "Only the campaign owner can withdraw funds.", severity: "error" });
      return;
    }

    const campaignContract = initializeCrowdfundContract(web3, address);
    if (!campaignContract) {
      setAlert({ open: true, message: "Failed to initialize campaign contract.", severity: "error" });
      return;
    }

    setIsWithdrawing(true);
    try {
      await campaignContract.methods.withdraw().send({ from: account });
      setAlert({ open: true, message: "Funds withdrawn successfully.", severity: "success" });
      setCampaign((prev) => ({ ...prev, balance: 0 }));
    } catch (error) {
      console.error("Error withdrawing funds:", error);
      setAlert({ open: true, message: error.message || "Failed to withdraw funds.", severity: "error" });
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleProposeExtension = async (e) => {
    e.preventDefault();
    if (!web3 || !account || !campaign) {
      setAlert({ open: true, message: "Please connect your wallet.", severity: "error" });
      return;
    }

    if (campaign.owner.toLowerCase() !== account.toLowerCase()) {
      setAlert({ open: true, message: "Only the campaign owner can propose a deadline extension.", severity: "error" });
      return;
    }

    if (campaign.proposalActive) {
      setAlert({ open: true, message: "Another proposal is currently active.", severity: "error" });
      return;
    }

    if (campaign.totalDonations * 2 < campaign.target) {
      setAlert({ open: true, message: "Total donations must be at least 50% of the target.", severity: "error" });
      return;
    }

    const days = Number(proposalDays);
    if (!days || days <= 0) {
      setAlert({ open: true, message: "Please enter a valid number of days.", severity: "error" });
      return;
    }

    const campaignContract = initializeCrowdfundContract(web3, address);
    if (!campaignContract) {
      setAlert({ open: true, message: "Failed to initialize campaign contract.", severity: "error" });
      return;
    }

    setIsProposing(true);
    try {
      await campaignContract.methods.proposeDeadlineExtension(days).send({ from: account });
      setAlert({ open: true, message: `Deadline extension of ${days} days proposed successfully.`, severity: "success" });
      setProposalDays("");
      setCampaign((prev) => ({
        ...prev,
        proposalActive: true,
        proposedDays: days,
        proposalVotesFor: 0,
        proposalVotesAgainst: 0,
      }));
    } catch (error) {
      console.error("Error proposing deadline extension:", error);
      let errorMessage = "Failed to propose deadline extension.";
      if (error.message.includes("Need >= 50% target")) {
        errorMessage = "Total donations must be at least 50% of the target.";
      }
      setAlert({ open: true, message: errorMessage, severity: "error" });
    } finally {
      setIsProposing(false);
    }
  };

  const getProposalStatusMessage = () => {
    if (!campaign || !account) return "Please connect your wallet.";
    if (campaign.owner.toLowerCase() !== account.toLowerCase()) {
      return "Only the campaign owner can propose an extension.";
    }
    if (campaign.proposalActive) {
      return "Another proposal is active.";
    }
    if (campaign.totalDonations * 2 < campaign.target) {
      return `Insufficient funding: Need at least ${campaign.target / 2} ETH (50% of target).`;
    }
    return "Propose a new deadline extension.";
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          padding: "20px",
          minHeight: "100vh",
          backgroundImage: `url(${homeBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <GradientCircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        padding: "20px",
        minHeight: "100vh",
        backgroundImage: `url(${homeBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: "1200px" }}>
        <Typography variant="h4" gutterBottom sx={{ color: "#000", mb: 3, textAlign: "center" }}>
          Manage Campaign
        </Typography>
        {alert.open && (
          <Alert
            severity={alert.severity}
            onClose={handleCloseAlert}
            sx={{ mb: 2, width: "100%", maxWidth: "600px", mx: "auto" }}
          >
            {alert.message}
          </Alert>
        )}
        {!campaign ? (
          <Typography variant="h6" sx={{ textAlign: "center", color: "#000" }}>
            Campaign not found.
          </Typography>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 3,
              alignItems: { xs: "center", md: "flex-start" },
            }}
          >
            {/* Campaign Details */}
            <Paper
              sx={{
                p: 3,
                boxShadow: 3,
                width: { xs: "100%", md: "60%" },
                maxWidth: "700px",
              }}
            >
              <CardMedia
                component="img"
                image={campaign.image}
                alt="Campaign Image"
                sx={{ maxWidth: "100%", height: "auto", borderRadius: 2, mb: 2 }}
              />
              <Typography variant="h5" sx={{ color: "#000", mb: 2 }}>
                {campaign.name}
              </Typography>
              <Typography variant="body1" sx={{ color: "#000", mb: 1 }}>
                <strong>Address:</strong> {`${campaign.address.slice(0, 6)}...${campaign.address.slice(-4)}`}
              </Typography>
              <Typography variant="body1" sx={{ color: "#000", mb: 1 }}>
                <strong>Status:</strong> <StateBubble state={campaign.status} sx={{ ml: 1, verticalAlign: "middle" }} />
              </Typography>
              <Typography variant="body1" sx={{ color: "#000", mb: 1 }}>
                <strong>Deadline:</strong> {new Date(campaign.deadline).toLocaleDateString()}
              </Typography>
              <Typography variant="body1" sx={{ color: "#000", mb: 2 }}>
                <strong>Funding Target:</strong> {campaign.target} ETH
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: "#000", mb: 1 }}>
                  <strong>Current Balance:</strong> {campaign.balance} ETH
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={campaign.target > 0 ? (campaign.balance / campaign.target) * 100 : 0}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "#e0e0e0",
                    "& .MuiLinearProgress-bar": { backgroundColor: "#2196f3" }, // Blue for balance
                  }}
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: "#000", mb: 1 }}>
                  <strong>Total Donations:</strong> {campaign.totalDonations} ETH
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={campaign.target > 0 ? (campaign.totalDonations / campaign.target) * 100 : 0}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "#e0e0e0",
                    "& .MuiLinearProgress-bar": { backgroundColor: "#4caf50" }, // Green for donations
                  }}
                />
              </Box>
            </Paper>
            {/* Withdraw and Proposal Boxes */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
                width: { xs: "100%", md: "40%" },
                maxWidth: "400px",
              }}
            >
              {/* Withdraw Box */}
              <Paper sx={{ p: 3, boxShadow: 3 }}>
                <Typography variant="h6" sx={{ color: "#000", mb: 2 }}>
                  Withdraw Funds
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  disabled={isWithdrawing || !account || campaign.status !== "Success" || campaign.owner.toLowerCase() !== account?.toLowerCase() || campaign.balance <= 0}
                  onClick={handleWithdraw}
                  sx={{
                    backgroundColor: "#4caf50",
                    "&:hover": { backgroundColor: "#388e3c" },
                    textTransform: "none",
                  }}
                >
                  {isWithdrawing ? "Withdrawing..." : "Withdraw"}
                </Button>
                <Typography variant="body2" sx={{ color: "#000", mt: 1 }}>
                  {campaign.status !== "Success"
                    ? "Campaign must be in Success state to withdraw."
                    : campaign.owner.toLowerCase() !== account?.toLowerCase()
                    ? "Only the campaign owner can withdraw."
                    : campaign.balance <= 0
                    ? "No funds available to withdraw."
                    : "Withdraw funds to the owner’s wallet."}
                </Typography>
              </Paper>
              {/* Vote/Proposal Box */}
              <Paper sx={{ p: 3, boxShadow: 3 }}>
                <Typography variant="h6" sx={{ color: "#000", mb: 2 }}>
                  Deadline Extension Proposal
                </Typography>
                {campaign.proposalActive ? (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body1" sx={{ color: "#000", mb: 1 }}>
                      <strong>Proposed Extension:</strong> {campaign.proposedDays} days
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#000", mb: 1 }}>
                      <strong>Votes For:</strong> {campaign.proposalVotesFor} ETH
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#000", mb: 1 }}>
                      <strong>Votes Against:</strong> {campaign.proposalVotesAgainst} ETH
                    </Typography>
                    <Box sx={{ width: "100%" }}>
                      <LinearProgress
                        variant="determinate"
                        value={
                          campaign.proposalVotesFor + campaign.proposalVotesAgainst > 0
                            ? (campaign.proposalVotesFor / (campaign.proposalVotesFor + campaign.proposalVotesAgainst)) * 100
                            : 0
                        }
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: "#ffcccc",
                          "& .MuiLinearProgress-bar": { backgroundColor: "#4caf50" },
                        }}
                      />
                    </Box>
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ color: "#000", mb: 2 }}>
                    No active proposal.
                  </Typography>
                )}
                <form onSubmit={handleProposeExtension}>
                  <TextField
                    label="Extension Days"
                    type="number"
                    value={proposalDays}
                    onChange={(e) => setProposalDays(e.target.value)}
                    fullWidth
                    disabled={
                      isProposing ||
                      !account ||
                      campaign.owner.toLowerCase() !== account?.toLowerCase() ||
                      campaign.proposalActive ||
                      (campaign.totalDonations * 2 < campaign.target)
                    }
                    sx={{ mb: 2 }}
                  />
                  <Button
                    variant="contained"
                    type="submit"
                    fullWidth
                    disabled={
                      isProposing ||
                      !account ||
                      campaign.owner.toLowerCase() !== account?.toLowerCase() ||
                      campaign.proposalActive ||
                      (campaign.totalDonations * 2 < campaign.target)
                    }
                    sx={{
                      backgroundColor: "#4caf50",
                      "&:hover": { backgroundColor: "#388e3c" },
                      textTransform: "none",
                    }}
                  >
                    {isProposing ? "Proposing..." : "Propose Extension"}
                  </Button>
                </form>
                <Typography variant="body2" sx={{ color: "#000", mt: 1 }}>
                  {getProposalStatusMessage()}
                </Typography>
              </Paper>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default CampaignManage;