import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import MyCampaigns from "./pages/MyCampaigns";
import CreateCampaign from "./pages/CreateCampaign";
import CampaignDetails from "./pages/CampaignDetails"; // Add this import
import { initializeFactoryContract } from "./utils/factoryContract";

const App = () => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [factoryContract, setFactoryContract] = useState(null);

  useEffect(() => {
    if (web3) {
      const factoryInstance = initializeFactoryContract(web3);
      setFactoryContract(factoryInstance);
    }
  }, [web3]);

  return (
    <Router>
      <Navbar account={account} setAccount={setAccount} setWeb3={setWeb3} />
      <Routes>
        <Route path="/" element={<Home account={account} web3={web3} factoryContract={factoryContract} />} />
        <Route path="/campaigns" element={<MyCampaigns account={account} web3={web3} factoryContract={factoryContract} />} />
        <Route path="/create" element={<CreateCampaign account={account} web3={web3} factoryContract={factoryContract} />} />
        <Route path="/campaign/:address" element={<CampaignDetails account={account} web3={web3} />} /> {/* Add this route */}
      </Routes>
    </Router>
  );
};

export default App;