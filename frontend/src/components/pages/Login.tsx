import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from "react-router-dom";
import '../css_files/page_style.css';

const Login = () => {
  const navigate = useNavigate();

  const onSuccess = async (tokenResponse: any) => {
    console.log("Google login successful:", tokenResponse);
  
    try {
      // Fetch user info from Google
      const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
          Authorization: `Bearer ${tokenResponse.access_token}`,
        },
      });
      const userInfo = await res.json();
  
      console.log("Google user info:", userInfo);
  
      // Save user info locally
      localStorage.setItem("userId", userInfo.sub);        // Google's unique user ID
      localStorage.setItem("username", userInfo.email);    // Optional if using email
      localStorage.setItem("name", userInfo.name);         // Optional for display
      localStorage.setItem("given_name", userInfo.given_name);  
      localStorage.setItem("picture", userInfo.picture);  

      // Also save to MongoDB
      try {
        const saveResponse = await fetch("http://localhost:5000/api/adduser", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            googleId: userInfo.sub,
            email: userInfo.email,
            name: userInfo.name,
            given_name: userInfo.given_name,
            picture: userInfo.picture
          }),
        });

        const result = await saveResponse.json();
        console.log("User saved to database:", result);
        
        
        if (result.status === "SUCCESS" && result.data && result.data.userId) {
          localStorage.setItem("mongoUserId", result.data.userId);
        }
      } catch (dbError) {
       
        console.error("Failed to save user to database:", dbError);
      }

      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to fetch Google user info:", error);
    }
  };
  

  const onError = () => {
    console.error("Google login failed");
  };

  const login = useGoogleLogin({
    onSuccess,
    onError,
  });

  // Handle guest login
  const handleGuestLogin = () => {
    navigate("/dashboard");
  };

  return (
    <div className="Login-page-container">
      <div className="login-container">
        <h2>Login</h2>
        <p>Please log in with your Google account to continue.</p>
        <div style={{ marginTop: "20px" }}>
          <button onClick={() => login()} className="oval-google-button">
          Sign in with Google
          </button>
        </div>
        {/* Guest Login Button */}
        <div style={{ marginTop: "20px" }}>
          <button onClick={handleGuestLogin} className="guest-button">
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
