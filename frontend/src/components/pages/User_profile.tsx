import React from "react";
import '../css_files/page_style.css';
import { useNavigate } from "react-router-dom";
const UserProfile = () => {
  // Retrieve user data from localStorage or provide fallback defaults
  const username = localStorage.getItem("name") || "User";
  const email = localStorage.getItem("username")
  const picture = localStorage.getItem("picture")
  const navigate = useNavigate(); 
  const handleLogout = () => {
    const confirmLogout = window.confirm("Logout?");
    if (confirmLogout){
      localStorage.clear();
      navigate("/login");
    }
  };
  //console.log(picture)
  return (
    <div className="page-container">
      <div className="header">
        <div>User Profile</div>
      </div>
      <div className="profile-container" style={{ textAlign: "center", marginTop: "40px" }}>
        <img 
          src={picture}
          height={220} 
          width={220} 
          alt="User Profile" 
          style={{ borderRadius: "50%" }}
        />
        <h2>{username}</h2>
        <p>{email}</p>
        <button 
          onClick={handleLogout}
          className="logout-button"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
