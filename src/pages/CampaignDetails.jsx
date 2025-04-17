import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
  CircularProgress,
  FormControlLabel,
  Radio,
  RadioGroup,
  LinearProgress,
  Paper,
  CardMedia,
} from "@mui/material";
import { initializeCrowdfundContract } from "../utils/crowdfundContract.js";
import homeBackground from "../assets/homeBackground.png";
import defaultImage from "../assets/defualt.jpg"; // Fallback image

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
  const [isRefunding, setIsRefunding] = useState(false);
  const [donators, setDonators] = useState([]);
  const [imgSrc, setImgSrc] = useState("");
  const [hasRefunded, setHasRefunded] = useState(false);

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
        const image = await campaignContract.methods.image().call() || defaultImage;
        const target = await campaignContract.methods.target().call();
        const deadline = await campaignContract.methods.deadline().call();
        const raised = await campaignContract.methods.getContractBalance().call();
        const state = await campaignContract.methods.getState().call();
        const hasDonated = await campaignContract.methods.hasDonated(account).call();

        // Fetch hasRefunded
        let hasRefunded = false;
        if (hasDonated) {
          const donationAmount = await campaignContract.methods.donationAmounts(account).call();
          hasRefunded = donationAmount == 0;
        }

        // Fetch donators
        const donatorsList = [];
        let i = 0;
        while (true) {
          try {
            const donatorAddr = await campaignContract.methods.donators(i).call();
            const amount = await campaignContract.methods.donationAmounts(donatorAddr).call();
            donatorsList.push({
              address: donatorAddr,
              amount: parseFloat(web3.utils.fromWei(amount, "ether")),
            });
            i++;
          } catch {
            break;
          }
        }

        // Fetch proposal details
        const proposalData = await campaignContract.methods.curProposal().call();
        const proposedDays = proposalData.proposedDays;
        const votesFor = proposalData.votesFor;
        const votesAgainst = proposalData.votesAgainst;
        const active = proposalData.active;
        const voteEndTime = await campaignContract.methods.voteEndTime().call();

        // Check hasVoted
        let hasVoted = false;
        if (active && hasDonated) {
          try {
            await campaignContract.methods.voteOnDeadlineExtension(true).call({ from: account });
          } catch (err) {
            if (err.message.includes("already voted")) {
              hasVoted = true;
            }
          }
        }

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

        setImgSrc(image);
        setDonators(donatorsList);
        setHasRefunded(hasRefunded);

        if (active && voteEndTime > Math.floor(Date.now() / 1000)) {
          setProposal({
            proposedDays: Number(proposedDays),
            votesFor: parseFloat(web3.utils.fromWei(votesFor, "ether")),
            votesAgainst: parseFloat(web3.utils.fromWei(votesAgainst, "ether")),
            voteEndTime: Number(voteEndTime),
            active,
            hasVoted,
          });
        } else {
          setProposal(null);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching campaign:", err);
        setError("Failed to load campaign details. Please try again.");
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
      const amount = parseFloat(web3.utils.fromWei(amountInWei, "ether"));
      setCampaign((prev) => ({
        ...prev,
        raised: parseFloat(web3.utils.fromWei(raised, "ether")),
        state: ["Active", "Success", "Fail"][state],
        hasDonated: true,
      }));
      setDonators((prev) => {
        const existing = prev.find((d) => d.address === account);
        if (existing) {
          return prev.map((d) =>
            d.address === account ? { ...d, amount: d.amount + amount } : d
          );
        }
        return [...prev, { address: account, amount }];
      });
      setDonationAmount("");
      setHasRefunded(false); // Reset hasRefunded since user donated
    } catch (err) {
      console.error("Donation error:", err);
      setError(
        err.message.includes("Campaign not open")
          ? "Campaign is not active"
          : err.message.includes("voting period now")
          ? "Cannot donate during voting period"
          : "Failed to donate"
      );
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
        err.message.includes("no proposal")
          ? "No active proposal"
          : err.message.includes("vote period ended")
          ? "Voting period has ended"
          : err.message.includes("non donator")
          ? "Only donators can vote"
          : err.message.includes("already voted")
          ? "You have already voted"
          : "Failed to vote"
      );
    } finally {
      setIsVoting(false);
    }
  };

  const handleRefund = async () => {
    if (!web3 || !account) return;
    try {
      setIsRefunding(true);
      const campaignContract = initializeCrowdfundContract(web3, address);
      await campaignContract.methods.refund().send({ from: account });
      const raised = await campaignContract.methods.getContractBalance().call();
      setCampaign((prev) => ({
        ...prev,
        raised: parseFloat(web3.utils.fromWei(raised, "ether")),
      }));
      setDonators((prev) =>
        prev.map((d) =>
          d.address === account ? { ...d, amount: 0 } : d
        ).filter((d) => d.amount > 0)
      );
      setHasRefunded(true);
      setError("");
    } catch (err) {
      console.error("Refund error:", err);
      setError(
        err.message.includes("Campaign not failed")
          ? "Refunds are only available for failed campaigns"
          : err.message.includes("No donation found")
          ? "Only donators can request a refund"
          : err.message.includes("Already refunded")
          ? "You have already requested a refund"
          : "Failed to process refund"
      );
    } finally {
      setIsRefunding(false);
    }
  };

  const handleImageError = () => {
    setImgSrc("https://via.placeholder.com/300?text=No+Image");
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          backgroundImage: `url(${homeBackground})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress sx={{ color: "#4caf50" }} />
        <Typography variant="h6" sx={{ mt: 2, color: "#000" }}>
          Loading campaign...
        </Typography>
      </Box>
    );
  }

  if (error || !campaign) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          backgroundImage: `url(${homeBackground})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" color="error">
          {error || "Campaign not found"}
        </Typography>
      </Box>
    );
  }

  const progress = campaign.target > 0 ? (campaign.raised / campaign.target) * 100 : 0;
  const voteProgress =
    proposal && (proposal.votesFor + proposal.votesAgainst) > 0
      ? (proposal.votesFor / (proposal.votesFor + proposal.votesAgainst)) * 100
      : 0;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: `url(${homeBackground})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: 4,
      }}
    >
      <Box
        sx={{
          maxWidth: "1200px",
          width: "100%",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 4,
        }}
      >
        {/* Column 1: Campaign Details Card */}
        <Paper
          sx={{
            p: 3,
            boxShadow: 3,
            flex: 2,
            width: { xs: "100%", md: "auto" },
            backgroundColor: "#ffffff",
          }}
        >
          <Typography variant="h5" sx={{ textAlign: "center", mb: 2, color: "#000" }}>
            {campaign.title}
          </Typography>
          {campaign.image && (
            <CardMedia
              component="img"
              image={imgSrc}
              alt={campaign.title}
              sx={{
                maxWidth: "100%",
                height: "auto",
                maxHeight: "300px",
                objectFit: "cover",
                borderRadius: 2,
                mb: 2,
              }}
              onError={handleImageError}
            />
          )}
          <Typography variant="body1" paragraph sx={{ color: "#000" }}>
            {campaign.description}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: "#e0e0e0",
              "& .MuiLinearProgress-bar": { backgroundColor: "#4caf50" },
              mb: 2,
            }}
          />
          <Typography variant="body2" sx={{ textAlign: "center", color: "#000", mb: 2 }}>
            {campaign.raised} ETH of {campaign.target} ETH
          </Typography>
          <Typography variant="body1" sx={{ color: "#000", mb: 1 }}>
            <strong>Deadline:</strong> {new Date(campaign.deadline * 1000).toLocaleDateString()}
          </Typography>
          <Typography variant="body1" sx={{ color: "#000", mb: 2 }}>
            <strong>Status:</strong>{" "}
            <span
              style={{
                color:
                  campaign.state === "Success"
                    ? "#4caf50"
                    : campaign.state === "Fail"
                    ? "#f44336"
                    : "#1976d2",
              }}
            >
              {campaign.state}
            </span>
          </Typography>
          <Box>
            <Typography variant="h6" gutterBottom sx={{ color: "#000" }}>
              Donators
            </Typography>
            {donators.length > 0 ? (
              <Box
                sx={{
                  maxHeight: "200px",
                  overflowY: "auto",
                  border: "1px solid #e0e0e0",
                  borderRadius: 1,
                  p: 1,
                }}
              >
                {donators.map((donator, index) => (
                  <Typography key={index} variant="body2" sx={{ color: "#000" }}>
                    {`${donator.address.slice(0, 6)}...${donator.address.slice(-4)}: ${donator.amount} ETH`}
                  </Typography>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" sx={{ color: "#000" }}>
                No donators yet
              </Typography>
            )}
          </Box>
        </Paper>

        {/* Column 2: Donation, Voting, and Refund */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          {campaign.state === "Active" && account && (!proposal || !proposal.active) ? (
            <Box
              sx={{
                p: 2,
                border: "1px solid #e0e0e0",
                borderRadius: 2,
                backgroundColor: "#ffffff",
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ color: "#000" }}>
                Donate to this Campaign
              </Typography>
              <TextField
                label="Amount (ETH)"
                variant="outlined"
                type="number"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                sx={{ width: "100%", mb: 2 }}
                inputProps={{ min: "0.0001", step: "0.0001" }}
                InputLabelProps={{ style: { color: "#000" } }}
                InputProps={{
                  style: { color: "#000", borderColor: "#e0e0e0" },
                }}
              />
              <Button
                variant="outlined"
                onClick={handleDonate}
                disabled={isDonating || !donationAmount || parseFloat(donationAmount) <= 0}
                sx={{
                  width: "100%",
                  backgroundColor: "#ffffff",
                  borderColor: "#e0e0e0",
                  color: "#000",
                  "&:hover": {
                    borderColor: "#2196f3",
                    backgroundColor: "#ffffff",
                  },
                  "&:disabled": {
                    borderColor: "#e0e0e0",
                    color: "#a0a0a0",
                  },
                }}
              >
                {isDonating ? "Donating..." : "Donate"}
              </Button>
            </Box>
          ) : (
            <Box
              sx={{
                p: 2,
                border: "1px solid #e0e0e0",
                borderRadius: 2,
                backgroundColor: "#ffffff",
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ color: "#000" }}>
                Donation Unavailable
              </Typography>
              <Typography variant="body2" sx={{ color: "#000" }}>
                {campaign.state !== "Active"
                  ? "This campaign is not active."
                  : proposal && proposal.active
                  ? "Donations paused during active proposal."
                  : "Please connect your wallet to donate."}
              </Typography>
            </Box>
          )}
          <Box
            sx={{
              p: 2,
              border: "1px solid #e0e0e0",
              borderRadius: 2,
              backgroundColor: "#ffffff",
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ color: "#000" }}>
              Deadline Extension Proposal
            </Typography>
            {proposal && proposal.active && campaign.state === "Active" ? (
              <>
                <Typography variant="body1" sx={{ color: "#000" }}>
                  Proposed extension: {proposal.proposedDays} days
                </Typography>
                <Typography variant="body1" sx={{ color: "#000" }}>
                  Voting ends: {new Date(proposal.voteEndTime * 1000).toLocaleString()}
                </Typography>
                <Typography variant="body1" sx={{ color: "#000" }}>
                  Votes For: {proposal.votesFor} ETH | Votes Against: {proposal.votesAgainst} ETH
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={voteProgress}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    mt: 1,
                    backgroundColor: "#ffcccc",
                    "& .MuiLinearProgress-bar": { backgroundColor: "#4caf50" },
                  }}
                />
                <Typography variant="body2" sx={{ textAlign: "center", color: "#000", mt: 1 }}>
                  {proposal.votesFor} ETH For vs {proposal.votesAgainst} ETH Against
                </Typography>
                {campaign.hasDonated ? (
                  proposal.hasVoted ? (
                    <Typography variant="body2" sx={{ color: "#000", mt: 2 }}>
                      You have already voted.
                    </Typography>
                  ) : (
                    <>
                      <RadioGroup
                        row
                        value={voteChoice}
                        onChange={(e) => setVoteChoice(e.target.value)}
                        sx={{ mt: 2 }}
                      >
                        <FormControlLabel
                          value="for"
                          control={<Radio sx={{ color: "#000", "&.Mui-checked": { color: "#2196f3" } }} />}
                          label={<Typography sx={{ color: "#000" }}>Vote For</Typography>}
                        />
                        <FormControlLabel
                          value="against"
                          control={<Radio sx={{ color: "#000", "&.Mui-checked": { color: "#2196f3" } }} />}
                          label={<Typography sx={{ color: "#000" }}>Vote Against</Typography>}
                        />
                      </RadioGroup>
                      <Button
                        variant="outlined"
                        onClick={handleVote}
                        disabled={isVoting || !voteChoice}
                        sx={{
                          mt: 1,
                          width: "100%",
                          backgroundColor: "#ffffff",
                          borderColor: "#e0e0e0",
                          color: "#000",
                          "&:hover": {
                            borderColor: "#2196f3",
                            backgroundColor: "#ffffff",
                          },
                          "&:disabled": {
                            borderColor: "#e0e0e0",
                            color: "#a0a0a0",
                          },
                        }}
                      >
                        {isVoting ? "Voting..." : "Submit Vote"}
                      </Button>
                    </>
                  )
                ) : (
                  <Typography variant="body2" sx={{ color: "#000", mt: 2 }}>
                    Only donators can vote on proposals.
                  </Typography>
                )}
              </>
            ) : (
              <Typography variant="body2" sx={{ color: "#000" }}>
                No active proposal at this time.
              </Typography>
            )}
          </Box>
          {campaign.state === "Fail" && (
            <Box
              sx={{
                p: 2,
                border: "1px solid #e0e0e0",
                borderRadius: 2,
                backgroundColor: "#ffffff",
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ color: "#000" }}>
                Request Refund
              </Typography>
              {account && campaign.hasDonated ? (
                hasRefunded ? (
                  <Typography variant="body2" sx={{ color: "#000" }}>
                    You have already requested a refund.
                  </Typography>
                ) : (
                  <Button
                    variant="outlined"
                    onClick={handleRefund}
                    disabled={isRefunding}
                    sx={{
                      width: "100%",
                      backgroundColor: "#ffffff",
                      borderColor: "#e0e0e0",
                      color: "#000",
                      "&:hover": {
                        borderColor: "#2196f3",
                        backgroundColor: "#ffffff",
                      },
                      "&:disabled": {
                        borderColor: "#e0e0e0",
                        color: "#a0a0a0",
                      },
                    }}
                  >
                    {isRefunding ? "Refunding..." : "Request Refund"}
                  </Button>
                )
              ) : (
                <Typography variant="body2" sx={{ color: "#000" }}>
                  Only donators can request a refund.
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </Box>

      {error && (
        <Typography
          variant="body2"
          color="error"
          sx={{ mt: 2, textAlign: "center", width: "100%" }}
        >
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default CampaignDetails;