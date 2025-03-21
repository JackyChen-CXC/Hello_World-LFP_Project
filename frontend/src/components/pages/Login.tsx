import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from "react-router-dom";
import '../css_files/page_style.css';

const Login = () => {
  const navigate = useNavigate();

  const onSuccess = (credentialResponse: any) => {
    console.log("Google login successful:", credentialResponse);
    navigate("/dashboard");
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
