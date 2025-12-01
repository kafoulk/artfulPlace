import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "firebase/firestore";

import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";

import searchIcon from "../assets/search.svg";
import closeIcon from "../assets/close.svg";
import heartOutline from "../assets/heart-outline.svg"; 
import heartFilled from "../assets/heart-filled.svg";

import "../styles/home.css";

export default function HomeScreen() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // load user's projects
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "projects"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")

    );

    const unsub = onSnapshot(
      q, (snapshot) => {
        const list = snapshot.docs.map((d) => ({

          id: d.id,
          ...d.data(),
        }));
        setProjects(list);
        setLoading(false);
      },
      (err) => {

        console.error("Error loading projects:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user]);

  // load favorite id
  useEffect(() => {
    if (!user) return;

    const loadFavorites = async () => {
      try {

        const favRef = collection(db, "users", user.uid, "favorites");
        const snap = await getDocs(favRef);
        const ids = new Set(snap.docs.map((d) => d.id));
        setFavoriteIds(ids);

      } catch (err) {

        console.error("Error loading favorites:", err);
      }
    };

    loadFavorites();
  }, [user]);

  // toggle favorite
  const toggleFavorite = async (projectId, e) => {

    // para que el click en el corazón NO dispare el click de la card
    e.stopPropagation();

    if (!user) return;

  const favDocRef = doc(db, "users", user.uid, "favorites", projectId);

    try {

      if (favoriteIds.has(projectId)) {

        // quitar de favoritos
        await deleteDoc(favDocRef);

        setFavoriteIds((prev) => {

          const copy = new Set(prev);
          copy.delete(projectId);
          return copy;

        }
      );
      } else {

        // agregar a favoritos
        await setDoc(favDocRef, {
          projectId,
          createdAt: new Date(),
        }
      );

        setFavoriteIds((prev) => new Set(prev).add(projectId));
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }

  };

  // search filter
  const filteredProjects = useMemo(() => {

    if (!searchTerm.trim()) return projects;

    const term = searchTerm.toLowerCase();

    return projects.filter((p) => {

      const name = p.projectName || p.name || "";

      return name.toLowerCase().includes(term);
    });

  }, [projects, searchTerm]);

  const handleCardClick = (projectId) => {

    navigate(`/project/${projectId}`);
  };

  if (!user) return null;

  const displayName =
    profile?.displayName || user.displayName || user.email || "User";

  return (


    <main className="home-root">

      <section className="home-card">

        {/* header */}
        <header className="home-header">

          {/* personalized greeting */}
      <h1>Hello, {user?.displayName || user?.email || "Artist"}</h1>
      <p>Welcome to your AR Dimension!</p>

          {/* search bar */}
          <div className="home-search-wrapper">

            <img src={searchIcon} alt="" className="home-search-icon" />
            <input
              type="text"
              className="home-search-input"
              placeholder="Search Project"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} />
           
            {searchTerm && (
             
            <button
                type="button"
                className="home-search-clear"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search" >
             
                <img src={closeIcon} />


              </button>
            )}

          </div>

        </header>

        {/* projects list */}
        <section className="home-projects-section">
          <h1 className="home-section-title">Projects</h1>

          {loading && <p className="home-loading-text">Loading projects…</p>}

          {!loading && filteredProjects.length === 0 && (

            <p className="home-empty-text">
              You don&apos;t have any projects yet. Try uploading one!
            </p>
          )
          }

          <div className="home-projects-grid">
            {filteredProjects.map((project) => {
              
              const name = project.projectName || project.name || "Project";
              const isFav = favoriteIds.has(project.id);

              const isImage =
                typeof project.fileType === "string" &&
                project.fileType.startsWith("image/");

              return (
                <article
                  key={project.id}
                  className="home-project-card"
                  onClick={() => handleCardClick(project.id)} >
                
                  {/* imagen or preview */}
                  <div className="home-project-thumb">

                    {isImage && project.fileUrl ? (
                      <img
                        src={project.fileUrl}
                        alt={name}
                        className="home-project-img" />
                        // si no es imagen
                    ) : (
                      <div className="home-project-placeholder">

                        <span>3D</span>
                      </div>
                    )}

                    <button
                      type="button"
                      className="home-fav-btn"
                      onClick={(e) => toggleFavorite(project.id, e)}
                      aria-label={
                        isFav ? "Remove from favorites" : "Add to favorites"
                      } >
                      <img
                        src={isFav ? heartFilled : heartOutline}
                        className="home-fav-icon"  />

                    </button>


                  </div>

                  {/* nombre */}

                  <p className="home-project-name">{name}</p>

                </article>
              );
            }
          )
            }

          </div>
        </section>

      </section>
    </main>
  );
}
