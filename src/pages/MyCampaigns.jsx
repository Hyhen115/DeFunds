import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import CampaignTable from "../components/CampaignTable";
import homeBackground from "../assets/homeBackground.png";

// Dummy data for campaigns, structured to match the new CampaignTable props
const dummyCampaigns = [
  {
    address: "0x1234567890abcdef1234567890abcdef12345678",
    name: "Eco-Friendly Housing Project",
    status: "Active",
    deadline: "2025-05-01",
    raised: 15,
    target: 50,
    proposalActive: true,
    proposalVotesFor: 10,
    proposalVotesAgainst: 5,
  },
  {
    address: "0xabcdef1234567890abcdef1234567890abcdef12",
    name: "Community Garden Initiative",
    status: "Success",
    deadline: "2025-03-15",
    raised: 30,
    target: 25,
    proposalActive: false,
    proposalVotesFor: 0,
    proposalVotesAgainst: 0,
  },
  {
    address: "0x7890abcdef1234567890abcdef1234567890abcd",
    name: "Local Library Renovation",
    status: "Fail",
    deadline: "2025-02-28",
    raised: 5,
    target: 20,
    proposalActive: true,
    proposalVotesFor: 3,
    proposalVotesAgainst: 7,
  },
  {
    address: "0x4567890abcdef1234567890abcdef1234567890",
    name: "Youth Sports Program",
    status: "Active",
    deadline: "2025-06-10",
    raised: 8,
    target: 40,
    proposalActive: false,
    proposalVotesFor: 0,
    proposalVotesAgainst: 0,
  },
];

const MyCampaigns = ({ account, web3, factoryContract }) => {
  const [campaigns, setCampaigns] = useState(dummyCampaigns);

  // Placeholder for fetching campaigns from the contract
  useEffect(() => {
    const fetchMyCampaigns = async () => {
      if (!web3 || !factoryContract || !account) {
        setCampaigns([]);
        return;
      }

      try {
        // TODO: Fetch campaigns from the factory contract and filter by owner
        setCampaigns(dummyCampaigns); // Using dummy data for now
      } catch (error) {
        console.error("Error fetching campaigns:", error);
        setCampaigns([]);
      }
    };

    fetchMyCampaigns();
  }, [web3, factoryContract, account]);

  return (
    <Box
      sx={{
        padding: "20px",
        minHeight: "100vh",
        backgroundImage: `url(${homeBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Typography variant="h4" gutterBottom sx={{ color: "#000", mb: 3 }}>
        My Campaigns
      </Typography>
      {!account ? (
        <Typography variant="h6" sx={{ textAlign: "center", color: "#000" }}>
          Please connect to a wallet to view your campaigns.
        </Typography>
      ) : campaigns.length === 0 ? (
        <Typography variant="h6" sx={{ textAlign: "center", color: "#000" }}>
          No campaigns found.
        </Typography>
      ) : (
        <CampaignTable campaigns={campaigns} />
      )}
    </Box>
  );
};

export default MyCampaigns;