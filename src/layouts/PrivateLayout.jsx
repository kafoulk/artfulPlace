import { Outlet } from "react-router-dom";
import NavbarTop from "../components/nav/NavbarTop";
import NavbarBottom from "../components/nav/NavbarBottom";
// Layout component for private routes header, footer, and main content area
export default function PrivateLayout() {
  // render the layout structure
  return (
    <div id="private-layout">
      
  <header>
        <NavbarTop />     
        <NavbarBottom />  
      </header>

      {/* main content area where nested routes will be rendered */}
      <main id="private-content" className="container">
        <Outlet />
      </main>

      {/* Footer section for web */}
      <footer id="web-footer">

        <div className="container" style={{ textAlign: "center", marginTop: "10px" }}>
          COPYRIGHT ©2025 All Rights Reserved | ARtful Place By Kiersten F. & Kiara C.M
        </div>
        
 </footer>

    </div>


  );
}
