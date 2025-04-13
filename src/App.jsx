import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import MyCampaigns from "./pages/MyCampaigns";
import CreateCampaign from "./pages/CreateCampaign";

const App = () => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);

  return (
    <Router>
      <Navbar account={account} setAccount={setAccount} setWeb3={setWeb3} />
      <Routes>
        <Route path="/" element={<div style={{ padding: "20px" }}><h2>Home</h2></div>} />
        <Route path="/campaigns" element={<MyCampaigns />} />
        <Route path="/create" element={<CreateCampaign />} />
      </Routes>
    </Router>
  );
};

export default App;