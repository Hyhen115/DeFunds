import Web3 from "web3";

// Replace with CrowdfundFactory ABI
const factoryABI = [
  // Paste the ABI from artifacts/contracts/CrowdfundFactory.sol/CrowdfundFactory.json
];

// Replace with your deployed CrowdfundFactory address
const factoryAddress = "0x123..."; // e.g., "0x5B38Da6a701c568545dCfcB03FcB875f56beddC"

export const initializeFactoryContract = (web3) => {
  if (!web3) {
    console.error("Web3 instance is not provided");
    return null;
  }
  try {
    return new web3.eth.Contract(factoryABI, factoryAddress);
  } catch (error) {
    console.error("Failed to initialize factory contract:", error);
    return null;
  }
};