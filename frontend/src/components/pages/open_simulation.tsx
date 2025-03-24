import React from "react";
import "../css_files/page_style.css";

const OpenSimulation = () => {
  return (
    <div className="page-container">
        <div className="header" style={{marginBottom:"5%"}}>
            <div>Simulate</div>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "absolute", right: "40px" }}>
                <div>user</div>
                <img src="/images/user.png" height={80} width={90} />
            </div>
        </div>
        <div className="simulation-container" >
            <div className="subheading"> Simulation Results and Graphs</div>
        </div>
    </div>

  );
};

export default OpenSimulation;
