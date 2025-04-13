import Web3 from "web3";

export const connectWallet = async () => {
  try {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const web3 = new Web3(window.ethereum);
    const accounts = await web3.eth.getAccounts();
    if (accounts.length === 0) {
      throw new Error("No accounts found");
    }
    return { web3, account: accounts[0] };
  } catch (error) {
    throw new Error(error.message || "Failed to connect wallet");
  }
};