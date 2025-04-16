import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  LinearProgress,
  Paper,
  Box,
  Button,
} from "@mui/material";
import makeBlockie from "ethereum-blockies-base64";

const CampaignTable = ({ campaigns }) => {
  return (
    <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
      <Table sx={{ minWidth: 650 }} aria-label="campaigns table">
        <TableHead>
          <TableRow sx={{ backgroundColor: "#f9f9f9" }}>
            <TableCell sx={{ fontWeight: "bold", color: "#000" }}>Address</TableCell>
            <TableCell sx={{ fontWeight: "bold", color: "#000" }}>Name</TableCell>
            <TableCell sx={{ fontWeight: "bold", color: "#000" }}>Status</TableCell>
            <TableCell sx={{ fontWeight: "bold", color: "#000" }}>Deadline</TableCell>
            <TableCell sx={{ fontWeight: "bold", color: "#000" }}>Funding Progress</TableCell>
            <TableCell sx={{ fontWeight: "bold", color: "#000" }}>Deadline Extension Proposal</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {campaigns.map((campaign, index) => {
            const fundingProgress = campaign.target > 0 ? (campaign.raised / campaign.target) * 100 : 0;
            const voteProgress = campaign.proposalVotesFor !== undefined && campaign.proposalVotesAgainst !== undefined && (campaign.proposalVotesFor + campaign.proposalVotesAgainst) > 0
              ? (campaign.proposalVotesFor / (campaign.proposalVotesFor + campaign.proposalVotesAgainst)) * 100
              : 0;

            // Determine the color for the status button
            const statusColor =
              campaign.status === "Success"
                ? "#4caf50"
                : campaign.status === "Fail"
                ? "#f44336"
                : "#1976d2"; // Blue for Active

            return (
              <TableRow key={index} sx={{ "&:hover": { backgroundColor: "#f9f9f9" } }}>
                <TableCell sx={{ color: "#000", display: "flex", alignItems: "center", gap: 1 }}>
                  <img
                    src={makeBlockie(campaign.address)}
                    alt="Address Icon"
                    style={{ width: "24px", height: "24px", borderRadius: "50%" }}
                  />
                  {`${campaign.address.slice(0, 6)}...${campaign.address.slice(-4)}`}
                </TableCell>
                <TableCell sx={{ color: "#000" }}>{campaign.name}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    disabled={true}
                    sx={{
                      color: statusColor,
                      borderColor: statusColor,
                      borderRadius: "20px",
                      textTransform: "none",
                      pointerEvents: "none", // Ensures no hover effects or clickability
                    }}
                  >
                    {campaign.status}
                  </Button>
                </TableCell>
                <TableCell sx={{ color: "#000" }}>
                  {new Date(campaign.deadline).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ width: "150px" }}>
                      <LinearProgress
                        variant="determinate"
                        value={fundingProgress}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: "#e0e0e0",
                          "& .MuiLinearProgress-bar": { backgroundColor: "#4caf50" },
                        }}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ color: "#000" }}>
                      {`${fundingProgress.toFixed(1)}% (${campaign.raised}/${campaign.target} ETH)`}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  {campaign.proposalActive ? (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ width: "150px" }}>
                          <LinearProgress
                            variant="determinate"
                            value={voteProgress}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: "#ffcccc",
                              "& .MuiLinearProgress-bar": { backgroundColor: "#4caf50" },
                            }}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ color: "#000" }}>
                          {`${voteProgress.toFixed(1)}% For`}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: "#000" }}>
                        {`${campaign.proposalVotesFor} ETH For vs ${campaign.proposalVotesAgainst} ETH Against`}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ color: "#000" }}>
                      Currently no deadline extension proposals.
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CampaignTable;