import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { QRCodeCanvas } from "qrcode.react";
import "../styles/profile.css";

import instagramIcon from "../assets/instagram-color.svg";
import linkedinIcon from "../assets/linkedin-color.svg";
import discordIcon from "../assets/discord-color.svg";
import xIcon from "../assets/x.svg";
import editIcon from "../assets/edit.svg";

import defaultAvatar from "../assets/pfp.jpg";
import defaultBanner from "../assets/banner-p.jpg";


// profile  component
export default function ProfileScreen() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  // loading state
  if (!user || !profile) return null;

  const { displayName, photoURL, bannerURL, socials = {} } = profile;


// avatar and banner sources
  const avatarSrc = photoURL || user.photoURL || defaultAvatar;
  const bannerSrc = bannerURL || defaultBanner;

  
const slug = (displayName || user.displayName || user.email || "user")
    .toLowerCase()

    .replace(/\s+/g, "-");

  // public profile URL
 const publicProfileUrl = `${window.location.origin}/profile/${slug}`;

  // handle share profile
  const handleShare = async () => {
    

    try {

// use Web share API if available
      if (navigator.share) {
// share profile link
        await navigator.share({
          title: "Artful Place Profile",
          text: "Check my Artful Place profile",
          url: publicProfileUrl,

        });

      } else {
// fallback copy to clipboard
        await navigator.clipboard.writeText(publicProfileUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);

      }
    } catch {
      /* ignore */
    }
  };

  
  const normalizeUrl = (url) => {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    return `https://${url}`;
  };

  // open social link
  const open = (url) => {

    const valid = normalizeUrl(url);
    if (valid) window.open(valid, "_blank", "noopener");
  };

  
  return (

    <main className="profile-root">


      <section className="profile-card">

        <div className="profile-layout">

          {/* banner, avatar, share, socials, qr */}

          <div className="profile-col profile-col-left">
                     
           {/* banner */}
<div className="profile-banner">

  <img
    src={bannerURL || defaultBanner}
    alt="Profile banner"
    className="profile-banner-img" />

</div>

   {/* avatar nombre editar */}

          <div className="profile-header-row">

  <div className="profile-avatar-wrapper">

    <img
      src={photoURL || defaultAvatar}
      alt="Profile avatar"
      className="profile-avatar-img" />

  </div>

      <div className="profile-title-block">

       <h1 className="profile-username">

        {displayName || user.displayName || user.email}
                </h1>

                <button
                  type="button"
                  className="profile-edit-btn"
                  onClick={() => navigate("/profile/edit")}
                  aria-label="Edit profile">

                   <img src={editIcon} alt="" />

                </button>

              </div>

            </div>

            {/* btn share */}
            <div className="profile-share-row">

              <button
                type="button"
                className="profile-share-btn"
                onClick={handleShare} >
                Share Profile

              </button>

              {copied && (
                <span className="profile-share-feedback">Link copied</span>
              )}

            </div>

            {/* social icons */}

            <div className="profile-social-row">

              <button
                type="button"
                className="profile-social-btn"
                onClick={() => open(socials.instagram)} >

                <img src={instagramIcon} alt="Instagram" />

              </button>

              <button
                type="button"
                className="profile-social-btn"
                onClick={() => open(socials.linkedin)} >

                <img src={linkedinIcon} alt="LinkedIn" />

              </button>

              <button
                type="button"
                className="profile-social-btn"
                onClick={() => open(socials.discord)} >

                <img src={discordIcon} alt="Discord" />

              </button>

              <button
                type="button"
                className="profile-social-btn"
                onClick={() => open(socials.x)} >

                <img src={xIcon} alt="X (Twitter)" />

              </button>

            </div>

            {/* qr */}

            <div className="profile-qr-card">

              <div className="profile-qr-wrapper">

                <QRCodeCanvas
                  value={publicProfileUrl}
                  size={96}
                  color="#7766C6"
                  bgColor="#FFFFFF"
                  includeMargin />

              </div>

              <p className="profile-qr-text"> Scan to view my Artful Place profile </p>
            </div>

          </div>

          {/* recent projects \ sign out */}
          <div className="profile-col profile-col-right">

            <section className="profile-projects-card">

              <h2 className="profile-section-title">Recent Projects</h2>

              <p className="profile-projects-placeholder">Coming soon</p>


            </section>

            <div className="profile-signout-row">

              <button
                type="button"
                className="profile-signout-btn"
                onClick={logout}>

                Sign Out

              </button>
            </div>


          </div>

        </div>

      </section>
      
    </main>
  );
}


