import { NavLink } from "react-router-dom";
import logo from "../../assets/artfulplace-logo.png"; 


export default function NavbarTop() {
  // Top navigation bar
  return (
    <nav id="nav-top">
      <div className="navt-wrapper">
        
        
          <NavLink to="/" end>
            <img src={logo} alt="Artful Place" className="navt-logo" />
          </NavLink>
        

       <div className="navt-center">
        
          {/* <NavLink to="/" end className={({ isActive }) => "navt-link " + (isActive ? "is-active" : "")}>Home</NavLink> */}
          <NavLink to="/upload" className={({ isActive }) => "navt-link " + (isActive ? "is-active" : "")}>Upload Project</NavLink>
          <NavLink to="/favorites" className={({ isActive }) => "navt-link " + (isActive ? "is-active" : "")}>Favorites</NavLink>
          <NavLink to="/profile" className={({ isActive }) => "navt-link " + (isActive ? "is-active" : "")}>Profile</NavLink>
       
</div>
        
      </div>
    </nav>
  );
}
