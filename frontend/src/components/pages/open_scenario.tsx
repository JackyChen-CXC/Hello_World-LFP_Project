import React from "react";
import '../css_files/page_style.css';

const OpenScenario = () => {
  return (
  <div className="page-container">
    <div className="header" >
      <div>Scenarios</div>
      <div>user</div>
    </div>
    <div className="scenario-container"> 
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
        <hr/>
        <div> Investments</div>
        <hr/>
        <div> Life Events</div>
      </div>
    </div>
  </div>
  );
};
export default OpenScenario;


