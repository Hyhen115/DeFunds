import React, { useRef, useState, useEffect } from "react";
import { Box, Typography, Grid, Button, CircularProgress } from "@mui/material";
import CampaignCard from "../components/CampaignCard";
import { initializeCrowdfundContract } from "../utils/crowdfundContract.js";
import homeBackground from "../assets/homeBackground.png";

// Gradient Circular Progress component
function GradientCircularProgress() {
  return (
    <React.Fragment>
      <svg width={0} height={0}>
        <defs>
          <linearGradient id="my_gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e01cd5" />
            <stop offset="100%" stopColor="#1CB5E0" />
          </linearGradient>
        </defs>
      </svg>
      <CircularProgress
        sx={{ "svg circle": { stroke: "url(#my_gradient)" } }}
      />
    </React.Fragment>
  );
}

const Home = ({ account, web3, factoryContract }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const campaignsRef = useRef(null);

  useEffect(() => {
    const fetchAllCampaigns = async () => {
      if (!web3 || !factoryContract || !account) return;

      setIsLoading(true);
      try {
        const campaignsFromFactory = await factoryContract.methods
          .getAllCampaigns()
          .call();
        const campaignPromises = campaignsFromFactory.map(async (campaign) => {
          const campaignContract = initializeCrowdfundContract(
            web3,
            campaign.campaignAddress
          );
          if (!campaignContract) return null;

          const title = await campaignContract.methods.campaignName().call();
          const imageUrl = await campaignContract.methods.image().call();
          const ownerAddress = await campaignContract.methods.owner().call();
          const deadline = await campaignContract.methods.deadline().call();
          const raised = await campaignContract.methods
            .getContractBalance()
            .call();
          const goal = await campaignContract.methods.target().call();

          return {
            campaignAddress: campaign.campaignAddress,
            title,
            imageUrl,
            ownerAddress,
            deadline: Number(deadline),
            raised: parseFloat(web3.utils.fromWei(raised, "ether")),
            goal: parseFloat(web3.utils.fromWei(goal, "ether")),
          };
        });

        const campaignsData = await Promise.all(campaignPromises);
        setCampaigns(campaignsData.filter((campaign) => campaign !== null));
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllCampaigns();
  }, [web3, factoryContract, account]);

  const handleScrollToCampaigns = () => {
    if (campaignsRef.current) {
      campaignsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Hero Section */}
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          p: 4,
          backgroundImage: `url(${homeBackground})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Typography
          variant="h2"
          component="h1"
          sx={{ fontWeight: "bold", mb: 2, color: "#000" }}
        >
          Welcome to Crowdfunding Dapp
        </Typography>
        <Typography
          variant="h6"
          sx={{ maxWidth: "600px", mb: 4, color: "#000" }}
        >
          Join our community of creators and supporters. Explore exciting
          projects and help bring innovative ideas to life.
        </Typography>
        <Button
          variant="outlined"
          sx={{
            color: "#000000",
            borderColor: "#000000",
            textTransform: "none",
            mt: 2,
          }}
          onClick={handleScrollToCampaigns}
        >
          Discover Campaigns
        </Button>
      </Box>

      {/* Campaigns Section */}
      <Box ref={campaignsRef} sx={{ p: 4 }}>
        <Typography
          variant="h4"
          component="h2"
          sx={{ mb: 3, textAlign: "center", fontWeight: "bold" }}
        >
          Campaigns
        </Typography>
        {!account ? (
          <Typography
            variant="h6"
            sx={{ textAlign: "center", color: "#A0A0A0" }}
          >
            Please connect to a wallet to load the campaigns.
          </Typography>
        ) : isLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "200px",
            }}
          >
            <GradientCircularProgress />
          </Box>
        ) : campaigns.length === 0 ? (
          <Typography variant="h6" sx={{ textAlign: "center" }}>
            No campaigns found
          </Typography>
        ) : (
          <Grid container spacing={4} sx={{ justifyContent: "center" }}>
            {campaigns.map((campaign) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                key={campaign.campaignAddress}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Box sx={{ width: "100%", maxWidth: "300px" }}>
                  <CampaignCard
                    title={campaign.title}
                    imageUrl={campaign.imageUrl}
                    ownerAddress={campaign.ownerAddress}
                    deadline={campaign.deadline}
                    raised={campaign.raised}
                    goal={campaign.goal}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </>
  );
};

export default Home;
