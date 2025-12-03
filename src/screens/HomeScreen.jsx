import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, orderBy, onSnapshot, doc, setDoc, deleteDoc, getDocs } from "firebase/firestore";

import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";

import searchIcon from "../assets/search.svg";
import closeIcon from "../assets/close.svg";
import heartOutline from "../assets/heart-outline.svg"; 
import heartFilled from "../assets/heart-filled.svg";

import "../styles/home.css";

export default function HomeScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [allProjects, setAllProjects] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // pull all projects
  useEffect(() => {
    const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAllProjects(list);
        setLoading(false);
      },
      (err) => {
        console.error("Error loading projects:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // --- Load current user's favorites ---
  useEffect(() => {
    if (!user) return;

    const loadFavorites = async () => {
      try {
        const favRef = collection(db, "users", user.uid, "favorites");
        const snap = await getDocs(favRef);
        setFavoriteIds(new Set(snap.docs.map((d) => d.id)));
      } catch (err) {
        console.error("Error loading favorites:", err);
      }
    };

    loadFavorites();
  }, [user]);

  // --- Toggle favorite ---
  const toggleFavorite = async (projectId, e) => {
    e.stopPropagation(); // prevent navigating when clicking the heart
    if (!user) return;

    const favRef = doc(db, "users", user.uid, "favorites", projectId);

    try {
      if (favoriteIds.has(projectId)) {
        await deleteDoc(favRef);
        setFavoriteIds(prev => {
          const next = new Set(prev);
          next.delete(projectId);
          return next;
        });
      } else {
        await setDoc(favRef, { createdAt: new Date() });
        setFavoriteIds(prev => new Set(prev).add(projectId));
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  // --- Filtered projects by search ---
  const filteredProjects = useMemo(() => {
    if (!searchTerm.trim()) return allProjects;

    const term = searchTerm.toLowerCase();
    return allProjects.filter((p) => {
      const name = p.projectName || p.name || "";
      return name.toLowerCase().includes(term);
    });
  }, [allProjects, searchTerm]);

  const handleCardClick = (projectId) => {
    navigate(`/project/${projectId}`);
  };

 if (!user) return null;

  return (
    <main className="home-root">
      <section className="home-card">

        {/* Header */}
        <header className="home-header">
          <h1>Hello, {user.displayName || user.email || "Artist"}</h1>
          <p>Welcome to your AR Dimension!</p>

          <div className="home-search-wrapper">
            <img src={searchIcon} alt="" className="home-search-icon" />
            <input
              type="text"
              className="home-search-input"
              placeholder="Search Project"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="home-search-clear"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
              >
                <img src={closeIcon} alt="" />
              </button>
            )}
          </div>
        </header>

        {/* Global Projects Feed */}
        <section className="home-projects-section">
          <h1 className="home-section-title">Latest Art from the Dimension</h1>

          {loading && <p className="home-loading-text">Loading projects…</p>}
          {!loading && filteredProjects.length === 0 && (
            <p className="home-empty-text">No public projects yet.</p>
          )}

          <div className="home-projects-grid">
            {filteredProjects.map((project) => {
              const name = project.projectName || project.name || "Project";
              const isFav = favoriteIds.has(project.id);
              const isImage = typeof project.fileType === "string" && project.fileType.startsWith("image/");

              return (
                <article
                  key={project.id}
                  className="home-project-card"
                  onClick={() => handleCardClick(project.id)}
                >
                  <div className="home-project-thumb">
                    {isImage && project.fileUrl ? (
                      <img src={project.fileUrl} alt={name} className="home-project-img" />
                    ) : (
                      <div className="home-project-placeholder"><span>3D</span></div>
                    )}

                    <button
                      type="button"
                      className="home-fav-btn"
                      onClick={(e) => toggleFavorite(project.id, e)}
                      aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
                    >
                      <img src={isFav ? heartFilled : heartOutline} className="home-fav-icon" alt="" />
                    </button>
                  </div>

                  <p className="home-project-name">{name}</p>
                </article>
              );
            })}
          </div>
        </section>
      </section>
    </main>
  );
}
