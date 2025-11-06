import { NavLink } from "react-router-dom";
// sbg Icons
import HomeIcon from "../../assets/home.svg?react";
import UploadIcon from "../../assets/upload.svg?react";
import FavoriteIcon from "../../assets/favorite.svg?react";
import ProfileIcon from "../../assets/user.svg?react";

export default function NavbarBottom() {

  return (
// Bottom Navigation Bar
    <nav id="nav-bottom" className="bottom-nav" aria-label="Bottom navigation">

      <NavLink to="/"
end className={({ isActive }) =>

          `bottom-nav-item ${isActive ? "is-active" : ""}`
        }
        aria-label="Home">

        <HomeIcon className="nav-icon" />

      </NavLink>

      <NavLink
        to="/upload"
        className={({ isActive }) =>
          `bottom-nav-item ${isActive ? "is-active" : ""}`
        }
        aria-label="Upload Project" >
       
        <UploadIcon className="nav-icon" />

      </NavLink>

      <NavLink
        to="/favorites"
        className={({ isActive }) =>
          `bottom-nav-item ${isActive ? "is-active" : ""}`
        }
        aria-label="Favorites" >
        
        <FavoriteIcon className="nav-icon" />

      </NavLink>

      <NavLink
        to="/profile"
        className={({ isActive }) =>
          `bottom-nav-item ${isActive ? "is-active" : ""}`
        }
        aria-label="Profile" >
       
        <ProfileIcon className="nav-icon" />
        
      </NavLink>

    </nav>


  );

}

