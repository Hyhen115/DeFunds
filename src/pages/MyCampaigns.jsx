import React, { useState, useEffect } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import CampaignTable from "../components/CampaignTable";
import { initializeCrowdfundContract } from "../utils/crowdfundContract";
import homeBackground from "../assets/homeBackground.png";

const MyCampaigns = ({ account, web3, factoryContract }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchMyCampaigns = async () => {
      if (!web3 || !factoryContract || !account) {
        setCampaigns([]);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch campaigns owned by the connected account
        const userCampaigns = await factoryContract.methods.getUserCampaigns(account).call();
        const campaignPromises = userCampaigns.map(async (campaign) => {
          const campaignContract = initializeCrowdfundContract(web3, campaign.campaignAddress);
          if (!campaignContract) {
            console.error("Failed to initialize campaign contract for address:", campaign.campaignAddress);
            return null;
          }

          try {
            const name = await campaignContract.methods.campaignName().call();
            const state = await campaignContract.methods.getState().call();
            const deadline = await campaignContract.methods.deadline().call();
            const raised = await campaignContract.methods.getContractBalance().call();
            const target = await campaignContract.methods.target().call();
            const curProposal = await campaignContract.methods.curProposal().call();
            const voteEndTime = await campaignContract.methods.voteEndTime().call();

            // Convert state to string
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

            // Format deadline as ISO date string (YYYY-MM-DD)
            const deadlineDate = new Date(Number(deadline) * 1000).toISOString().split("T")[0];

            return {
              address: campaign.campaignAddress,
              name,
              status,
              deadline: deadlineDate,
              raised: parseFloat(web3.utils.fromWei(raised, "ether")),
              target: parseFloat(web3.utils.fromWei(target, "ether")),
              proposalActive: curProposal.active && Number(voteEndTime) > Math.floor(Date.now() / 1000),
              proposalVotesFor: parseFloat(web3.utils.fromWei(curProposal.votesFor, "ether")),
              proposalVotesAgainst: parseFloat(web3.utils.fromWei(curProposal.votesAgainst, "ether")),
            };
          } catch (err) {
            console.error("Error fetching data for campaign:", campaign.campaignAddress, err);
            return null;
          }
        });

        const campaignsData = await Promise.all(campaignPromises);
        // Filter out null entries (failed fetches)
        setCampaigns(campaignsData.filter((campaign) => campaign !== null));
      } catch (error) {
        console.error("Error fetching user campaigns:", error);
        setCampaigns([]);
      } finally {
        setIsLoading(false);
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
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Typography variant="h4" gutterBottom sx={{ color: "#000", mb: 3 }}>
        My Campaigns
      </Typography>
      {isLoading ? (
        <CircularProgress sx={{ color: "#4caf50", mt: 4 }} />
      ) : !account ? (
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