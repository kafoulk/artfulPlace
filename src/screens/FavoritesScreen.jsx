import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  deleteDoc,
} from "firebase/firestore";

import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";

import searchIcon from "../assets/search.svg";
import closeIcon from "../assets/close.svg";
import heartFilled from "../assets/heart-filled.svg";

import "../styles/favorites.css";

export default function FavoritesScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  //  proyectos favoritos 
  useEffect(() => {
    if (!user) return;

    const loadFavorites = async () => {
      setLoading(true);
      try {

  
        const favRef = collection(db, "users", user.uid, "favorites");
        const favSnap = await getDocs(favRef);

     if (favSnap.empty) {
         
      setProjects([]);    
      setLoading(false);
         
      return;
        }

        const favEntries = favSnap.docs.map((d) => ({

          projectId: d.id,
          ...d.data(),
        }));

        //traer cada proyecto por ID
        const projectPromises = favEntries.map(async (fav) => {

       const projRef = doc(db, "projects", fav.projectId);
       const projSnap = await getDoc(projRef);

          if (!projSnap.exists()) return null;

          return {
            id: projSnap.id,
            ...projSnap.data(),
            favoriteCreatedAt: fav.createdAt || null,

          };

        });

        const result = (await Promise.all(projectPromises)).filter(Boolean);

        // ordenar por fecha de favorito 
        result.sort((a, b) => {

          const aTime =
            a.favoriteCreatedAt?.toMillis?.() ??
            a.createdAt?.toMillis?.() ??
            0;
          const bTime =
            b.favoriteCreatedAt?.toMillis?.() ??
            b.createdAt?.toMillis?.() ??
            0;
          return bTime - aTime;

        });

        setProjects(result);

      } catch (err) {

        console.error("Error loading favorite projects:", err);

      } finally {

        setLoading(false);
      }
    };

    loadFavorites();
  }, [user]);

  // quitar de favoritos 
  const handleUnfavorite = async (projectId, e) => {
    e.stopPropagation();
    if (!user) return;

    const favDocRef = doc(db, "users", user.uid, "favorites", projectId);

    try {
      await deleteDoc(favDocRef);

      // quitar del estado local
      setProjects((prev) => prev.filter((p) => p.id !== projectId));

    } catch (err) {

      console.error("Error removing favorite:", err);
    }
  };

  //  busqueda
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

  return (
    <main className="favorites-root">
      <section className="favorites-card">


        {/* header */}
        <header className="favorites-header">

          <h1>Favorites</h1>
          <p>Your saved AR projects.</p>

          {/* search bar */}
          <div className="favorites-search-wrapper">

            <img src={searchIcon} className="favorites-search-icon" />
           
            <input
              type="text"
              className="favorites-search-input"
              placeholder="Search Project"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}/>
           
            {searchTerm && (
             
             <button
                type="button"
              className="favorites-search-clear"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search" >
                
                <img src={closeIcon} alt="" />

              </button>
            )
            }

          </div>
        </header>

        {/* favorites list */}
        <section className="favorites-projects-section">

          {loading && <p className="favorites-loading-text">Loading…</p>}

          {!loading && filteredProjects.length === 0 && (

            <p className="favorites-empty-text">
              You haven&apos;t added any favorites yet.
            </p>

          )}

          <div className="favorites-projects-grid">

            {filteredProjects.map((project) => {
              const name = project.projectName || project.name || "Project";

              const isImage =
                typeof project.fileType === "string" &&
                project.fileType.startsWith("image/");

              return (
                
                <article
                  key={project.id}
                  className="favorites-project-card"
                  onClick={() => handleCardClick(project.id)}>
                 
          
           <div className="favorites-project-thumb">
               {isImage && project.fileUrl ? (
                      <img
                        src={project.fileUrl}
                        alt={name}
                        className="favorites-project-img" />
                    ) : (

                      <div className="favorites-project-placeholder">
                        <span>3D</span>
                      </div>

                    )}

                    <button
                      type="button"
                      className="favorites-fav-btn"
                      onClick={(e) => handleUnfavorite(project.id, e)}
                      aria-label="Remove from favorites" >
                  
                  <img
                   src={heartFilled}
                    className="favorites-fav-icon" />

                    </button>


                  </div>

                  <p className="favorites-project-name">{name}</p>

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
