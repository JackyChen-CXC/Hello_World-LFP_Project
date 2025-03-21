import React from "react";
import '../css_files/page_style.css';

const Simulation = () => {
  return (
  <div className="page-container" >
    <div className="header" >
      <div>Simulate</div>
      <div style={{display:"flex", justifyContent:"center", alignItems:"center",position: "absolute", right: "40px"}}>
        <div>user</div>
        <img src="/images/user.png" height={80} width={90} />
      </div>
    </div>
    <div className="subheading" style={{marginBottom:"-50px"}}> Monte Carlo Simulation:</div>
    <p className="normal-text"style={{width:"70%"}}> A Monte Carlo Simulation is a statistical method used to model uncertainty and
        predict possible future outcomes. It runs thousands of simulations using different
        randomized market conditions, such as investment returns, inflation rates, and
        economic fluctuations, to estimate your financial future.
    </p>
    <button className="page-buttons" style={{width:"200px"}}>Select a Plan</button>
    <div className="simulation-container">
      <div className="questions">
        <div className="normal-text"> How many simulations do you want to run?</div>
        <button className="page-buttons" style={{width:"200px", marginLeft:"40%"}}> Run Simulation</button>
      </div>
    </div>
  </div>
  );
};
export default Simulation;

