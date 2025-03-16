import React from "react";
import '../css_files/side_panel_style.css';


const SidePanel = () => {
  return (
  <div className = "background-container">
    <button className="logo-btn">LFP</button>
    <button className="tab-btn"> Dashboard </button>
    <button className="tab-btn"> Create Plan </button>
    <button className="tab-btn"> Scenarios </button>
    <button className="tab-btn"> Simulate </button>
    <button className="tab-btn"> Help </button>
    
  </div>
  );
};
export default SidePanel;

