import React from "react";
import { useNavigate } from "react-router-dom";
import '../css_files/side_panel_style.css';

const SidePanel = () => {
  const navigate = useNavigate(); // Now it will work correctly

  return (
    <div className="background-container">
      <button className="logo-btn" onClick={() => navigate("/")}>LFP</button>
      <button className="tab-btn" onClick={() => navigate("/dashboard")}>Dashboard</button>
      <button className="tab-btn" onClick={() => navigate("/create-plan")}>Create Plan</button>
      <button className="tab-btn" onClick={() => navigate("/scenarios")}>Scenarios</button>
      <button className="tab-btn" onClick={() => navigate("/simulate")}>Simulate</button>
      <button className="tab-btn" onClick={() => navigate("/help")}>Help</button>
    </div>
  );
};

export default SidePanel;
