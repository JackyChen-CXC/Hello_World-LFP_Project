import React from "react";
import '../css_files/page_style.css';

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
        <div className="normal_text">Name Your Plan*</div>
        <input className="input-boxes" type="text" />

        {/* Plan Type */}
        <div className="normal_text">Plan Type*</div>
        <div className="checkbox-group">
          <CheckboxGroup id="individual" label="Individual Plan" />
          <CheckboxGroup id="joint" label="Joint Plan" />
        </div>

        {/* Age and Birth Year */}
        <div className="joint-questions">
          <div className="normal_text">Current Age*</div>
          <div className="normal_text">What Year Were You Born*</div>
        </div>
        <div className="joint-inputs">
          <input className="input-boxes" type="text" />
          <input className="input-boxes" type="text" />
        </div>

        {/* Spouse Age and Birth Year */}
        <div className="joint-questions">
          <div className="normal_text">Spouse's Age (If joint plan)</div>
          <div className="normal_text">What Year Was Your Spouse Born (If joint plan)</div>
        </div>
        <div className="joint-inputs">
          <input className="input-boxes" type="text" />
          <input className="input-boxes" type="text" />
        </div>

        {/* Life Expectancy Option */}
        <div className="normal_text">Would you like to specify a life expectancy or sample it from a normal distribution?</div>
        <div className="checkbox-group">
          <CheckboxGroup id="life-yes" label="Yes" />
          <input className="input-boxes" type="text" />
          <CheckboxGroup id="life-no" label="No" />
        </div>

      </div>

      {/* Other Sections */}
      <div className="subheading">Investments & Savings</div>
      <div className="subheading">Life Events</div>
      <div className="subheading">Optimization</div>

      {/* Roth Conversion Optimization */}
      <div className="question">
        <div className="normal_text">Would you like to apply a Roth Conversion Optimization?</div>
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
