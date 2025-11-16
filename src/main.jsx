import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.clean";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import "./styles/index.css";
import "./styles/global.css";
import "./styles/auth.css";
import "./styles/favorites.css";
import "./styles/home.css";
import "./styles/profile.css";
import "./styles/upload.css";



// Render the root component
ReactDOM.createRoot(document.getElementById("root")).render(


  // Wrap with router and authprovider
  <React.StrictMode>

  <BrowserRouter>

{/*authentication  provider */}
      <AuthProvider>
        {/* main application component */}
        <App />
      </AuthProvider>

    </BrowserRouter>

  </React.StrictMode>

);
