import axios from "axios";
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Import Router
import './components/css_files/App.css';
import CreatePlan from "./components/pages/create_plan.tsx";
import SidePanel from "./components/pages/side_panel.tsx";
import Dashboard from "./components/pages/dashboard.tsx"; 
import Scenarios from "./components/pages/scenario.tsx";
import Simulate from "./components/pages/simulation.tsx";
import Help from "./components/pages/help.tsx";

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
            <Route path="/scenarios" element={<Scenarios />} />
            <Route path="/simulate" element={<Simulate />} />
            <Route path="/help" element={<Help />} />
            <Route path="/" element={<Dashboard />} /> {/* Default page */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
