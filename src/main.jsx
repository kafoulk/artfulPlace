import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.clean";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import "./styles/index.css";
import "./styles/global.css";
import "./styles/auth.css";


// Render the root component
ReactDOM.createRoot(document.getElementById("root")).render(


  // Wrap the app with routing and authentication context providers
  <React.StrictMode>

{/* // Routing provider */}
  <BrowserRouter>

{/* // Authentication context provider */}
      <AuthProvider>
        {/* // Main application component */}
        <App />
      </AuthProvider>

    </BrowserRouter>

  </React.StrictMode>

);
