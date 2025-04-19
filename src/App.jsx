import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import MyCampaigns from "./pages/MyCampaigns";
import CreateCampaign from "./pages/CreateCampaign";
import CampaignDetails from "./pages/CampaignDetails";
import CampaignManage from "./pages/CampaignManage";
import { initializeFactoryContract } from "./utils/factoryContract";

const App = () => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [factoryContract, setFactoryContract] = useState(null);

  useEffect(() => {
    if (web3) {
      try {
        const factoryInstance = initializeFactoryContract(web3);
        setFactoryContract(factoryInstance);
        console.log("Factory contract initialized:", factoryInstance);
      } catch (error) {
        console.error("Error initializing factory contract:", error);
      }
    }
  }, [web3]);

  // Log props for debugging
  console.log("App render:", { web3, account, factoryContract });

  return (
    <Router basename="/DeFunds">
      <Navbar account={account} setAccount={setAccount} setWeb3={setWeb3} />
      <Routes>
        <Route path="/" element={<Home account={account} web3={web3} factoryContract={factoryContract} />} />
        <Route path="/mycampaign" element={<MyCampaigns account={account} web3={web3} factoryContract={factoryContract} />} />
        <Route path="/create" element={<CreateCampaign account={account} web3={web3} factoryContract={factoryContract} />} />
        <Route path="/campaign/:address" element={<CampaignDetails account={account} web3={web3} />} />
        <Route path="/campaign/:address/manage" element={<CampaignManage account={account} web3={web3} />} />
      </Routes>
    </Router>
  );
};

export default App;