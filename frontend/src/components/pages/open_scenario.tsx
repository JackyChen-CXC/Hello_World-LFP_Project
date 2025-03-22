import React from "react";
import { useParams } from "react-router-dom";
import "../css_files/page_style.css";

const OpenScenario = () => {
  const { id } = useParams();
  return (
  <div className="page-container">
    <div className="header" >
      <div>Scenarios</div>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "absolute", right: "40px" }}>
        <div>user</div>
        <img src="/images/user.png" height={80} width={90} />
      </div>
    </div>
    <div className="scenario-container" style={{width:"70%", height:"auto"}}> 
      <div className="split-container">
        <div className="left-container">
          <div className="normal-text">Title: </div>
          <div className="normal-text">Current Age: </div>
          <div className = "normal-text"> Financial Goal: </div>
          <div className="normal-text">Life Expectancy </div>
        </div>
        <div className="right-container">
          <div className="normal-text"> Plan Type: </div>
          <div className="normal-text"> Date Created: </div>
        </div>
      </div>
      <hr/>
      <div className="normal-text"> Investments</div>
      <hr/>
      <div className="normal-text"> Life Events</div>
    </div>
  </div>
  );
};
export default OpenScenario;


