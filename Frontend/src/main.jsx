import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { init } from '@emailjs/browser'; // Import EmailJS init
import App from "./App";
import "./index.css";

// Initialize EmailJS with your Public Key
init('t63w7Un-ufMR8JE1G'); // Replace with your actual Public Key, e.g., 'pK_123456789'

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);