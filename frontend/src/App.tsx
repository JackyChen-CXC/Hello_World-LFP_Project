import axios from "axios";
import React, { useEffect, useState } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import './components/css_files/App.css';
import CreatePlan from "./components/pages/create_plan.tsx";
import Dashboard from "./components/pages/dashboard.tsx";
import Footer from "./components/pages/Footer.tsx";
import Help from "./components/pages/help.tsx";
import Login from "./components/pages/Login.tsx";
import OpenScenario from "./components/pages/open_scenario.tsx";
import OpenSimulation from "./components/pages/open_simulation.tsx";
import Scenario from "./components/pages/scenario.tsx";
import SidePanel from "./components/pages/side_panel.tsx";
import Simulation from "./components/pages/simulation.tsx";
import UserProfile from "./components/pages/User_profile.tsx";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/")
      .then(response => setMessage(response.data))
      .catch(error => console.error(error));
  }, []);

  return (
    <Router> 
      <div className="app-container">
        <div className="side_panel">
          <SidePanel /> 
        </div>
        <div className="main-content">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create-plan" element={<CreatePlan />} />
            <Route path="/scenario" element={<Scenario />} />
            <Route path="/scenario/:id" element={<OpenScenario />} />
            <Route path="/simulate" element={<Simulation />} />
            <Route path="/simulation/:id" element={<OpenSimulation />} />
            <Route path="/help" element={<Help />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/" element={<Dashboard />} /> 
          </Routes>
        </div>
      </div>
      <div className="footer">
        <Footer /> 
      </div>
    </Router>
  );
}

export default App;
