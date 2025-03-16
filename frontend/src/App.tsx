import axios from "axios";
import React, { useEffect, useState } from "react";
import './components/css_files/App.css';
import CreatePlan from "./components/pages/create_plan.tsx";
import SidePanel from "./components/pages/side_panel.tsx";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/")
      .then(response => setMessage(response.data))
      .catch(error => console.error(error));
  }, []);

  return (
    <div className="app-container">
      <div className = "side_panel">
        <SidePanel/>
      </div>
      <div className = "main-content" >
        <CreatePlan/>
      </div>
    </div>
  );
}

export default App;