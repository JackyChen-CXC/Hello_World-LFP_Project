import React from "react";
import '../css_files/page_style.css';

const Dashboard = () => {
  return (
  <div className="page-container">
    <div className="header">
        <div>Dashboard</div>
        <div style={{display:"flex", justifyContent:"center", alignItems:"center",  position: "absolute", right: "40px"}}>
          <div>user</div>
          <img src="/images/user.png" height={80} width={90} />
        </div>
      </div>
  </div>
  );
};
export default Dashboard;

