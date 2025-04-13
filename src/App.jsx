// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import MyCampaigns from "./pages/MyCampaigns";
import CreateCampaign from "./pages/CreateCampaign";

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<div style={{ padding: "20px" }}><h2>Home</h2></div>} />
        <Route path="/campaigns" element={<MyCampaigns />} />
        <Route path="/create" element={<CreateCampaign />} />
      </Routes>
    </Router>
  );
};

export default App;