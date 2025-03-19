import React from "react";
import '../css_files/footer_style.css';
import { Routes, Route, Link } from "react-router-dom";
import CreatePlan from "./create_plan.tsx";
import Dashboard from "./dashboard.tsx";
import Scenario from "./scenario.tsx";
import Simulation from "./simulation.tsx";
import Help from "./help.tsx";

const Footer = () => {
  return (
    <div className="footer-container">
      <div style={{opacity:"68%"}}>Lifetime Financial Planner</div>

      {/* Navigation Buttons */}
      <div className="nav-container">
        <Link to="/dashboard" className="nav-button">Dashboard</Link>
        <>|</>
        <Link to="/create-plan" className="nav-button">Create Plan</Link>
        <>|</>
        <Link to="/scenarios" className="nav-button">Scenarios</Link>
        <>|</>
        <Link to="/simulate" className="nav-button">Simulation</Link>
        <>|</>
        <Link to="/help" className="nav-button">Help</Link>
      </div>


    </div>
  );
};

export default Footer;
