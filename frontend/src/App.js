import React, { useState, useEffect } from "react";
import axios from "axios";
import logo from './logo.svg';
import './App.css';

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/")
      .then(response => setMessage(response.data))
      .catch(error => console.error(error));
  }, []);

  return (
    <div>
      <h1>React & Express App</h1>
      <p>{message}</p>
    </div>
  );
}

export default App;