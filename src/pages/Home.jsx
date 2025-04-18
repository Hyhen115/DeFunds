import React, { useRef, useState, useEffect } from "react";
import { Box, Typography, Grid, Button } from "@mui/material";
import { Link } from "react-router-dom";
import CampaignCard from "../components/CampaignCard";
import { initializeCrowdfundContract } from "../utils/crowdfundContract.js";
import homeBackground from "../assets/homeBackground.png";
import GradientCircularProgress from "../components/GradientCircularProgress";

const Home = ({ account, web3, factoryContract }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const campaignsRef = useRef(null);

  useEffect(() => {
    const fetchAllCampaigns = async () => {
      if (!web3 || !factoryContract || !account) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const campaignsFromFactory = await factoryContract.methods.getAllCampaigns().call();
        const campaignPromises = campaignsFromFactory.map(async (campaign) => {
          const campaignContract = initializeCrowdfundContract(web3, campaign.campaignAddress);
          if (!campaignContract) {
            console.error(`Failed to initialize contract for campaign: ${campaign.campaignAddress}`);
            return null;
          }
          try {
            const title = await campaignContract.methods.campaignName().call();
            const imageUrl = await campaignContract.methods.image().call();
            const ownerAddress = await campaignContract.methods.owner().call();
            const deadline = await campaignContract.methods.deadline().call();
            const totalDonations = await campaignContract.methods.totalDonations().call();
            const goal = await campaignContract.methods.target().call();
            const stateNum = await campaignContract.methods.getState().call();

            // Log raw data for debugging
            console.log(`Campaign ${campaign.campaignAddress}:`, {
              stateNum: stateNum.toString(),
              deadline: Number(deadline),
              totalDonations: web3.utils.fromWei(totalDonations, "ether"),
              goal: web3.utils.fromWei(goal, "ether"),
              currentTimestamp: Math.floor(Date.now() / 1000),
            });

            // Map numeric state to string
            let state;
            switch (stateNum.toString()) {
              case "0":
                state = "Active";
                break;
              case "1":
                state = "Success";
                break;
              case "2":
                state = "Fail";
                break;
              default:
                console.error(`Unexpected state ${stateNum} for campaign ${campaign.campaignAddress}`);
                return null;
            }

            return {
              campaignAddress: campaign.campaignAddress,
              title,
              imageUrl,
              ownerAddress,
              deadline: Number(deadline),
              raised: parseFloat(web3.utils.fromWei(totalDonations, "ether")),
              goal: parseFloat(web3.utils.fromWei(goal, "ether")),
              state,
            };
          } catch (error) {
            console.error(`Error fetching data for campaign ${campaign.campaignAddress}:`, error);
            return null;
          }
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
      <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", p: 4, backgroundImage: `url(${homeBackground})`, backgroundRepeat: "no-repeat", backgroundSize: "cover", backgroundPosition: "center" }}>
        <Typography variant="h2" component="h1" sx={{ fontWeight: "bold", mb: 2, color: "#000" }}>
          Welcome to De Funds
        </Typography>
        <Typography variant="h6" sx={{ maxWidth: "600px", mb: 4, color: "#000" }}>
          Join our community of creators and supporters. Explore exciting projects and help bring innovative ideas to life.
        </Typography>
        <Button variant="outlined" sx={{ color: "#000000", borderColor: "#000000", textTransform: "none", mt: 2 }} onClick={handleScrollToCampaigns}>
          Discover Campaigns
        </Button>
      </Box>
      <Box ref={campaignsRef} sx={{ p: 4 }}>
        <Typography variant="h4" component="h2" sx={{ mb: 3, textAlign: "center", fontWeight: "bold" }}>
          Campaigns
        </Typography>
        {!account ? (
          <Typography variant="h6" sx={{ textAlign: "center", color: "#000" }}>
            Please connect to a wallet to load the campaigns.
          </Typography>
        ) : isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px" }}>
            <GradientCircularProgress />
          </Box>
        ) : campaigns.length === 0 ? (
          <Typography variant="h6" sx={{ textAlign: "center" }}>
            No campaigns found
          </Typography>
        ) : (
          <Grid container spacing={4}>
            {campaigns.map((campaign) => (
              <Grid item xs={12} sm={6} md={4} key={campaign.campaignAddress}>
                <Link to={`/campaign/${campaign.campaignAddress}`} style={{ textDecoration: "none" }}>
                  <CampaignCard
                    title={campaign.title}
                    imageUrl={campaign.imageUrl}
                    campaignAddress={campaign.campaignAddress}
                    deadline={campaign.deadline}
                    raised={campaign.raised}
                    goal={campaign.goal}
                    state={campaign.state}
                  />
                </Link>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </>
  );
};

export default Home;