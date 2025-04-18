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
} from "@mui/material";
import { Link } from "react-router-dom";
import makeBlockie from "ethereum-blockies-base64";

const CampaignTable = ({ campaigns }) => {
  return (
    <TableContainer component={Paper} sx={{ boxShadow: 3, overflowX: "auto" }}>
      <Table
        sx={{
          minWidth: 650,
          tableLayout: "fixed",
        }}
        aria-label="campaigns table"
      >
        <TableHead>
          <TableRow sx={{ backgroundColor: "#f9f9f9" }}>
            <TableCell
              sx={{
                borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
                width: "48px",
                minWidth: "48px",
                maxWidth: "48px",
                padding: "8px",
              }}
            ></TableCell>
            <TableCell sx={{ fontWeight: "bold", color: "#000" }}>Address</TableCell>
            <TableCell sx={{ fontWeight: "bold", color: "#000" }}>Name</TableCell>
            <TableCell sx={{ fontWeight: "bold", color: "#000" }}>Status</TableCell>
            <TableCell sx={{ fontWeight: "bold", color: "#000" }}>Deadline</TableCell>
            <TableCell sx={{ fontWeight: "bold", color: "#000" }}>Funding Progress</TableCell>
            <TableCell sx={{ fontWeight: "bold", color: "#000" }}>Contract Balance</TableCell>
            <TableCell sx={{ fontWeight: "bold", color: "#000" }}>Deadline Extension Proposal</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {campaigns.map((campaign, index) => {
            const fundingProgress = campaign.target > 0 ? (campaign.raised / campaign.target) * 100 : 0;
            const balanceProgress = campaign.target > 0 ? (campaign.balance / campaign.target) * 100 : 0;
            const voteProgress =
              campaign.proposalVotesFor !== undefined &&
              campaign.proposalVotesAgainst !== undefined &&
              (campaign.proposalVotesFor + campaign.proposalVotesAgainst) > 0
                ? (campaign.proposalVotesFor / (campaign.proposalVotesFor + campaign.proposalVotesAgainst)) * 100
                : 0;

            return (
              <TableRow
                key={index}
                sx={{
                  "&:hover": { backgroundColor: "#f9f9f9", cursor: "pointer" },
                }}
                component={Link}
                to={`/campaign/${campaign.address}/manage`}
              >
                <TableCell
                  sx={{
                    minHeight: "48px",
                    padding: "8px",
                    borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
                    width: "48px",
                    minWidth: "48px",
                    maxWidth: "48px",
                    textAlign: "center",
                  }}
                >
                  <img
                    src={makeBlockie(campaign.address)}
                    alt="Address Icon"
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      display: "block",
                      margin: "0 auto",
                    }}
                  />
                </TableCell>
                <TableCell
                  sx={{
                    color: "#000",
                    minHeight: "48px",
                    padding: "8px",
                    borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
                  }}
                >
                  <Typography variant="body2">
                    {`${campaign.address.slice(0, 6)}...${campaign.address.slice(-4)}`}
                  </Typography>
                </TableCell>
                <TableCell
                  sx={{
                    color: "#000",
                    minHeight: "48px",
                    padding: "8px",
                    borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
                  }}
                >
                  {campaign.name}
                </TableCell>
                <TableCell
                  sx={{
                    minHeight: "48px",
                    padding: "8px",
                    borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color:
                        campaign.status === "Success"
                          ? "#4caf50"
                          : campaign.status === "Fail"
                          ? "#f44336"
                          : "#1976d2",
                      fontWeight: "medium",
                    }}
                  >
                    {campaign.status}
                  </Typography>
                </TableCell>
                <TableCell
                  sx={{
                    color: "#000",
                    minHeight: "48px",
                    padding: "8px",
                    borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
                  }}
                >
                  {new Date(campaign.deadline).toLocaleDateString()}
                </TableCell>
                <TableCell
                  sx={{
                    minHeight: "48px",
                    padding: "8px",
                    borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
                  }}
                >
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
                <TableCell
                  sx={{
                    minHeight: "48px",
                    padding: "8px",
                    borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ width: "150px" }}>
                      <LinearProgress
                        variant="determinate"
                        value={balanceProgress}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: "#e0e0e0",
                          "& .MuiLinearProgress-bar": { backgroundColor: "#2196f3" },
                        }}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ color: "#000" }}>
                      {`${balanceProgress.toFixed(1)}% (${campaign.balance}/${campaign.target} ETH)`}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell
                  sx={{
                    minHeight: "48px",
                    padding: "8px",
                    borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
                  }}
                >
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