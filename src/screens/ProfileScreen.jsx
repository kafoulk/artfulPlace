import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { QRCodeCanvas } from "qrcode.react";
import "../styles/profile.css";
import "../styles/home.css"; 

import instagramIcon from "../assets/instagram-color.svg";
import linkedinIcon from "../assets/linkedin-color.svg";
import discordIcon from "../assets/discord-color.svg";
import xIcon from "../assets/x.svg";
import editIcon from "../assets/edit.svg";

import defaultAvatar from "../assets/pfp.jpg";
import defaultBanner from "../assets/banner-p.jpg";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  limit,
} from "firebase/firestore";
import { db } from "../lib/firebase";

import heartOutline from "../assets/heart-outline.svg";
import heartFilled from "../assets/heart-filled.svg";


// profile  component
export default function ProfileScreen() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [projects, setProjects] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  if (!user || !profile) return null;

// Pull user's personal projects
useEffect(() => {
 if (!user) return;

 const PROJECTS_LIMIT = 4;

 const q = query(
  collection(db, "projects"),
 where("userId", "==", user.uid),
  orderBy("createdAt", "desc"),
  limit(PROJECTS_LIMIT) );

 const unsub = onSnapshot(
  q,
  (snapshot) => {
  setProjects(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
   setLoading(false); },
 () => setLoading(false)
 );
 return () => unsub();
}, [user]);

// Load favorite project IDs
useEffect(() => {
  if (!user) return;

  const loadFavorites = async () => {
    const favRef = collection(db, "users", user.uid, "favorites");
    const snap = await getDocs(favRef);
    setFavoriteIds(new Set(snap.docs.map((d) => d.id)));
  };

  loadFavorites();
}, [user]);

// Add / remove Favorite
const toggleFavorite = async (projectId, e) => {
  e.stopPropagation();
  if (!user) return;

  const favRef = doc(db, "users", user.uid, "favorites", projectId);
  const isFavorite = favoriteIds.has(projectId);

  try {
    if (isFavorite) {
      await deleteDoc(favRef);
      setFavoriteIds(prev => {
        const next = new Set(prev);
        next.delete(projectId);
        return next;
      });
    } else {
      await setDoc(favRef, {
        createdAt: new Date()
      });
      setFavoriteIds(prev => new Set(prev).add(projectId));
    }
  } catch (err) {
    console.error("Error toggling favorite:", err);
  }
};


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
      if (navigator.share) {
        await navigator.share({
          title: "Artful Place Profile",
          text: "Check my Artful Place profile",
          url: publicProfileUrl,
        });

      } else {
        await navigator.clipboard.writeText(publicProfileUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);

      }
    } catch {
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

  {loading && (
    <p className="profile-projects-placeholder">Loading…</p>
  )}

  {!loading && projects.length === 0 && (
    <p className="profile-projects-placeholder">No projects yet.</p>
  )}

  <div className="home-projects-grid home-projects-grid--profile">
    {projects.map((p) => {
      const name = p.projectName || p.name || "Project";
      const isFav = favoriteIds.has(p.id);
      const isImage =
        typeof p.fileType === "string" && p.fileType.startsWith("image/");

      return (
        <article
          key={p.id}
          className="home-project-card"
          onClick={() => navigate(`/project/${p.id}`)}
        >
          <div className="home-project-thumb">
            {isImage && p.fileUrl ? (
              <img
                src={p.fileUrl}
                alt={name}
                className="home-project-img"
              />
            ) : (
              <div className="home-project-placeholder">
                <span>3D</span>
              </div>
            )}

            <button
              type="button"
              className="home-fav-btn"
              onClick={(e) => toggleFavorite(p.id, e)}
              aria-label={
                isFav ? "Remove from favorites" : "Add to favorites"
              }
            >
              <img
                src={isFav ? heartFilled : heartOutline}
                className="home-fav-icon"
                alt=""
              />
            </button>
          </div>

          <p className="home-project-name">{name}</p>
        </article>
      );
    })}
  </div>
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


