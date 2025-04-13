import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import MyCampaigns from "./pages/MyCampaigns";
import CreateCampaign from "./pages/CreateCampaign";

const App = () => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);

  return (
    <Router>
      <Navbar account={account} setAccount={setAccount} setWeb3={setWeb3} />
      <Routes>
        <Route path="/" element={<Home account={account} />} />
        <Route path="/campaigns" element={<MyCampaigns account={account} />} />
        <Route path="/create" element={<CreateCampaign account={account} />} />
      </Routes>
    </Router>
  );
};

export default App;