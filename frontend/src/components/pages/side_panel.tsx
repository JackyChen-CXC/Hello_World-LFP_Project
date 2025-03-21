import React from "react";
import { useNavigate } from "react-router-dom";
import '../css_files/side_panel_style.css';

const SidePanel = () => {
  const navigate = useNavigate(); 

  return (
    <div className="background-container">
      <button className="logo-btn" onClick={() => navigate("/")}>LFP</button>
      <button className="tab-btn" onClick={() => navigate("/dashboard")}>Dashboard</button>
      <button className="tab-btn" onClick={() => navigate("/create-plan")}>Create Plan</button>
      <button className="tab-btn" onClick={() => navigate("/scenario")}>Scenarios</button>
      <button className="tab-btn" onClick={() => navigate("/simulate")}>Simulation</button>
      <button className="tab-btn" onClick={() => navigate("/help")}>Help</button>
      <button className="tab-btn" onClick={() => navigate("/Login")}>Login</button>
    </div>
  );
};

export default SidePanel;
