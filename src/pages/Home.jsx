import React, { useRef } from "react";
import { Box, Typography, Grid, Card, CardContent, Button } from "@mui/material";
import homeBackground from "../assets/homeBackground.png"; // adjust the path if needed

const Home = () => {
  // Dummy array for campaigns—replace with contract data later.
  const dummyCampaigns = [1, 2, 3, 4];
  // Reference to the campaigns section for scrolling
  const campaignsRef = useRef(null);

  // Smooth-scroll handler
  const handleScrollToCampaigns = () => {
    if (campaignsRef.current) {
      campaignsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Hero Section with Background Image */}
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
          sx={{
            fontWeight: "bold",
            mb: 2,
            color: "#000", // black text color
          }}
        >
          Welcome to Crowdfunding Dapp
        </Typography>
        <Typography
          variant="h6"
          sx={{
            maxWidth: "600px",
            mb: 4,
            color: "#000", // black text color
          }}
        >
          Join our community of creators and supporters. Explore exciting projects and help bring innovative ideas to life.
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
          sx={{
            mb: 3,
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          Campaigns
        </Typography>
        <Grid container spacing={4}>
          {dummyCampaigns.map((campaign) => (
            <Grid item xs={12} sm={6} md={4} key={campaign}>
              <Card
                sx={{
                  boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                  borderRadius: "8px",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    transition: "transform 0.3s ease",
                  },
                }}
              >
                <CardContent>
                  <Typography variant="h5" component="div" sx={{ mb: 1 }}>
                    Campaign Title {campaign}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Brief description of campaign {campaign}. This space can be filled with data fetched from your contracts.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  );
};

export default Home;
