import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Box, Typography, Button, TextField, CircularProgress, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { initializeCrowdfundContract } from "../utils/crowdfundContract.js";

const CampaignDetails = ({ web3, account }) => {
  const { address } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [proposal, setProposal] = useState(null);
  const [donationAmount, setDonationAmount] = useState("");
  const [voteChoice, setVoteChoice] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDonating, setIsDonating] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!web3 || !address || !account) {
        setError("Please connect your wallet to view campaign details");
        setLoading(false);
        return;
      }

      try {
        const campaignContract = initializeCrowdfundContract(web3, address);
        if (!campaignContract) throw new Error("Failed to initialize contract");

        // Fetch campaign details
        const title = await campaignContract.methods.campaignName().call();
        const description = await campaignContract.methods.description().call();
        const image = await campaignContract.methods.image().call();
        const target = await campaignContract.methods.target().call();
        const deadline = await campaignContract.methods.deadline().call();
        const raised = await campaignContract.methods.getContractBalance().call();
        const state = await campaignContract.methods.getState().call();
        const hasDonated = await campaignContract.methods.hasDonated(account).call();

        // Fetch proposal details individually
        const proposalData = await campaignContract.methods.curProposal().call();
        const proposedDays = proposalData.proposedDays;
        const votesFor = proposalData.votesFor;
        const votesAgainst = proposalData.votesAgainst;
        const active = proposalData.active;
        const voteEndTime = await campaignContract.methods.voteEndTime().call();
        const hasVoted = active ? await campaignContract.methods.hasVoted(account).call() : false;

        setCampaign({
          title,
          description,
          image,
          target: parseFloat(web3.utils.fromWei(target, "ether")),
          deadline: Number(deadline),
          raised: parseFloat(web3.utils.fromWei(raised, "ether")),
          state: ["Active", "Success", "Fail"][state],
          hasDonated,
        });

        if (active && voteEndTime > Math.floor(Date.now() / 1000)) {
          setProposal({
            proposedDays: Number(proposedDays),
            votesFor: parseFloat(web3.utils.fromWei(votesFor, "ether")),
            votesAgainst: parseFloat(web3.utils.fromWei(votesAgainst, "ether")),
            voteEndTime: Number(voteEndTime),
            hasVoted,
          });
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching campaign:", err);
        setError("Failed to load campaign details");
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [web3, account, address]);

  const handleDonate = async () => {
    if (!web3 || !account || !donationAmount) return;
    try {
      setIsDonating(true);
      const campaignContract = initializeCrowdfundContract(web3, address);
      const amountInWei = web3.utils.toWei(donationAmount, "ether");
      await campaignContract.methods.donate().send({ from: account, value: amountInWei });
      const raised = await campaignContract.methods.getContractBalance().call();
      const state = await campaignContract.methods.getState().call();
      setCampaign((prev) => ({
        ...prev,
        raised: parseFloat(web3.utils.fromWei(raised, "ether")),
        state: ["Active", "Success", "Fail"][state],
        hasDonated: true,
      }));
      setDonationAmount("");
    } catch (err) {
      console.error("Donation error:", err);
      setError(err.message.includes("Campaign not open") ? "Campaign is not active" : "Failed to donate");
    } finally {
      setIsDonating(false);
    }
  };

  const handleVote = async () => {
    if (!web3 || !account || !voteChoice) return;
    try {
      setIsVoting(true);
      const campaignContract = initializeCrowdfundContract(web3, address);
      const voteFor = voteChoice === "for";
      await campaignContract.methods.voteOnDeadlineExtension(voteFor).send({ from: account });
      const proposalData = await campaignContract.methods.curProposal().call();
      setProposal((prev) => ({
        ...prev,
        votesFor: parseFloat(web3.utils.fromWei(proposalData.votesFor, "ether")),
        votesAgainst: parseFloat(web3.utils.fromWei(proposalData.votesAgainst, "ether")),
        hasVoted: true,
      }));
      setVoteChoice("");
    } catch (err) {
      console.error("Voting error:", err);
      setError(
        err.message.includes("no proposal") ? "No active proposal" :
        err.message.includes("vote period ended") ? "Voting period has ended" :
        err.message.includes("non donator") ? "Only donators can vote" :
        err.message.includes("already voted") ? "You have already voted" :
        "Failed to vote"
      );
    } finally {
      setIsVoting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading campaign...</Typography>
      </Box>
    );
  }

  if (error || !campaign) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h6" color="error">{error || "Campaign not found"}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: "800px", mx: "auto" }}>
      <Typography variant="h4" gutterBottom>{campaign.title}</Typography>
      {campaign.image && (
        <Box component="img" src={campaign.image} alt={campaign.title} sx={{ width: "100%", maxHeight: "300px", objectFit: "cover", mb: 2 }} />
      )}
      <Typography variant="body1" paragraph>{campaign.description}</Typography>
      <Typography variant="h6">Raised: {campaign.raised} ETH of {campaign.target} ETH</Typography>
      <Typography variant="h6">Deadline: {new Date(campaign.deadline * 1000).toLocaleDateString()}</Typography>
      <Typography variant="h6">Status: {campaign.state}</Typography>
      {campaign.state === "Active" && account && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>Donate to this Campaign</Typography>
          <TextField label="Amount (ETH)" variant="outlined" type="number" value={donationAmount} onChange={(e) => setDonationAmount(e.target.value)} sx={{ mr: 2, width: "200px" }} inputProps={{ min: "0.0001", step: "0.0001" }} />
          <Button variant="contained" onClick={handleDonate} disabled={isDonating || !donationAmount || parseFloat(donationAmount) <= 0} sx={{ mt: 1 }}>
            {isDonating ? "Donating..." : "Donate"}
          </Button>
        </Box>
      )}
      {proposal && !proposal.hasVoted && campaign.hasDonated && campaign.state === "Active" && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>Deadline Extension Proposal</Typography>
          <Typography variant="body1">Proposed extension: {proposal.proposedDays} days</Typography>
          <Typography variant="body1">Voting ends: {new Date(proposal.voteEndTime * 1000).toLocaleString()}</Typography>
          <Typography variant="body1">Votes For: {proposal.votesFor} ETH | Votes Against: {proposal.votesAgainst} ETH</Typography>
          <RadioGroup row value={voteChoice} onChange={(e) => setVoteChoice(e.target.value)} sx={{ mt: 2 }}>
            <FormControlLabel value="for" control={<Radio />} label="Vote For" />
            <FormControlLabel value="against" control={<Radio />} label="Vote Against" />
          </RadioGroup>
          <Button variant="contained" onClick={handleVote} disabled={isVoting || !voteChoice} sx={{ mt: 1 }}>
            {isVoting ? "Voting..." : "Submit Vote"}
          </Button>
        </Box>
      )}
      {error && (
        <Typography variant="body2" color="error" sx={{ mt: 2 }}>{error}</Typography>
      )}
    </Box>
  );
};

export default CampaignDetails;