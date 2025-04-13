import Web3 from "web3";

// Replace with Crowdfund ABI
const crowdfundABI = [
  // Paste the ABI from artifacts/contracts/Crowdfund.sol/Crowdfund.json
];

export const initializeCrowdfundContract = (web3, campaignAddress) => {
  if (!web3 || !campaignAddress) {
    console.error("Web3 instance or campaign address not provided");
    return null;
  }
  try {
    return new web3.eth.Contract(crowdfundABI, campaignAddress);
  } catch (error) {
    console.error("Failed to initialize crowdfund contract:", error);
    return null;
  }
};