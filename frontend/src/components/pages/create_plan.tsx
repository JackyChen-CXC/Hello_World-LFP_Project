import React from "react";
import '../css_files/page_style.css';
import '../css_files/collapsible.css';

const CheckboxGroup = ({ id, label }) => {
  return (
    <div className="checkbox-container">
      <input className="checkbox" type="checkbox" id={id} />
      <label htmlFor={id}>{label}</label>
    </div>
  );
};

const CreatePlan = () => {
  return (
    <div className="page-container">
      
      <div className="header">
        <div>Create Plan</div>
        <div>user</div>
      </div>

      {/* Basic Information */}
      <div className="subheading">Basic Information</div>
      <div className="question"> 
        
        {/* Name Your Plan */}
        <div className="normal-text">Name Your Plan*</div>
        <input className="input-boxes" type="text" />

        {/* Plan Type */}
        <div className="normal-text">Plan Type*</div>
        <div className="checkbox-group">
          <CheckboxGroup id="individual" label="Individual Plan" />
          <CheckboxGroup id="joint" label="Joint Plan" />
        </div>

        {/* Age and Birth Year */}
        <div className="split-container">
          <div className = "left-side">
            <div className="normal-text">Current Age*</div>
            <input className="input-boxes" type="text" />
          </div>
          <div className="right-side">
            <div className="normal-text">What Year Were You Born*</div>
            <input className="input-boxes" type="text" />
          </div>
        </div>

        {/* Spouse Age and Birth Year */}
        <div className="split-container">
          <div className = "left-side">
            <div className="normal-text">Spouse's Age (If joint plan)</div>
            <input className="input-boxes" type="text" />
          </div>
          <div className="right-side">
            <div className="normal-text">What Year Was Your Spouse Born (If joint plan)</div>
            <input className="input-boxes" type="text" />
          </div>
        </div> 

        {/* Life Expectancy Option */}
        <div className="normal-text">Would you like to specify a life expectancy or sample it from a normal distribution?</div>
        <div className="checkbox-group">
          <CheckboxGroup id="life-yes" label="Yes" />
          <input className="input-boxes" type="text" />
          <CheckboxGroup id="life-no" label="No" />
        </div>

      </div>

      {/* Investment and savings*/}
      <div className="subheading">Investments & Savings</div>
      <div className="collapse-container">
        <div className="split-container">
          <div className="left-side">
          <div className="normal-text">Select Investment Type*</div>
          <select className="collapse-options" name="investmentType">
              <option value="domestic-stocks">Domestic Stocks</option>
              <option value="foreign-stocks">Foreign Stocks</option>
              <option value="bonds">Bonds</option>
              <option value="real-estate">Real Estate</option>
              <option value="cash-other">Cash & Other</option>
              <option value="investments">Investments</option>
              <option value="custom">Custom</option>
          </select>
          </div>
          <div className = "right-side"> 
            <div className="normal-text"> Name of Investment*</div>
            <input className="input-boxes" type="text" />
            <div className="normal-text"> Brief Description of Investment*</div>
            <textarea className="input-boxes textarea-box" rows="4"></textarea>
          </div>

        </div>
        
        <div className="normal-text"> What is the current value of the investment?*</div>

        <div className="normal-text"> How would you like to express the investment's annaul return? (select 1)*</div>

        <div className="normal-text"> What is the expected annual Income from dividends or interests from this
        investment? (select 1)*</div>

        <div className="normal-text"> What is the annual expense ratio for this investment*</div>
        <input className="input-boxes" type="text" />
        <div className="normal-text"> Is this investment taxable?*</div>
        
        <div className="normal-text"> What type of account is this investment stored in?</div>
      </div>
      <div className="subheading">Life Events</div>
      <div className="subheading">Optimization</div>

      {/* Roth Conversion Optimization */}
      <div className="question">
        <div className="normal-text">Would you like to apply a Roth Conversion Optimization?</div>
        <div className="checkbox-group">
          <CheckboxGroup id="roth-yes" label="Yes" />
          <input className="input-boxes" type="text" />
          <br/>
          <CheckboxGroup id="roth-no" label="No" />
        </div>
      </div>

    </div>
  );
};

export default CreatePlan;
