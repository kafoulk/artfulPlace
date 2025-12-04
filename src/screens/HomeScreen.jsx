import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
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
import filterIcon from "../assets/filter.svg";
import heartOutline from "../assets/heart-outline.svg";
import heartFilled from "../assets/heart-filled.svg";

import "../styles/home.css";

export default function HomeScreen() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [allProjects, setAllProjects] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

 const [filterMode, setFilterMode] = useState("all");
 const [showFilterMenu, setShowFilterMenu] = useState(false);

  // load all projects from Firestore (global)
  useEffect(() => {
    const q = query(
      collection(db, "projects"),
      orderBy("createdAt", "desc")
    );

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

  // load user projects
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

  // toggle fav
  const toggleFavorite = async (projectId, e) => {
    e.stopPropagation(); 
    if (!user) return;

    const favRef = doc(db, "users", user.uid, "favorites", projectId);

    try {
      if (favoriteIds.has(projectId)) {

        // delete from fav
        await deleteDoc(favRef);
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(projectId);
          return next;
        });
      } else {

        // agregar a favoritos
        await setDoc(favRef, {
          projectId,
          createdAt: new Date(),
        });
        setFavoriteIds((prev) => new Set(prev).add(projectId));
      }

    } catch (err) {

      console.error("Error", err);
    }
  };

  //cambiar filtro 
    const handleFilterClick = (mode) => {
    

    setFilterMode((prev) => (prev === mode ? "all" : mode));
    setShowFilterMenu(false);
  };

  //search y filter
const filteredProjects = useMemo(() => {
    let list = allProjects;

    if (user) {
      if (filterMode === "mine") {
        list = list.filter((p) => p.userId === user.uid); 
      } else if (filterMode === "world") {
        list = list.filter((p) => p.userId !== user.uid);
      }
    }

    if (!searchTerm.trim()) return list;

    const term = searchTerm.toLowerCase();
    return list.filter((p) => {
      const name = p.projectName || p.name || "";
      return name.toLowerCase().includes(term);
    });
  }, [allProjects, filterMode, searchTerm, user]);

  const handleCardClick = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  if (!user) return null;

  const displayName =
    profile?.displayName || user.displayName || user.email || "Artist";

  return (
    <main className="home-root">
      <section className="home-card">
        {/*header */}
        <header className="home-header">
          <h1>Hello, {displayName}</h1>
          <p>Welcome to your AR Dimension!</p>

          {/* search and filter*/}
          <div className="home-search-row">

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
                  onClick={() => setSearchTerm("")} >
                  <img src={closeIcon} alt="" />
                </button>

              )}
              
            </div>

            {/* filert dropdown*/}
            <div className="home-filter-wrapper">

              {/* btn icon */}
              <button
                type="button"
                className={`home-filter-btn ${
                  filterMode !== "all" ? "home-filter-btn-active" : ""
                }`}

                onClick={() => setShowFilterMenu((prev) => !prev)} >

                <img src={filterIcon}  />

              </button>

              {/* dropdown */}
              {showFilterMenu && (
                <div className="home-filter-menu">


                  <button
                    className={
                      filterMode === "mine"
                        ? "home-filter-option active"
                        : "home-filter-option"
                    }
                    onClick={() => handleFilterClick("mine")} > My AR Dimension </button>

                  <button
                    className={
                      filterMode === "world"
                        ? "home-filter-option active"
                        : "home-filter-option"
                    }
                    onClick={() => handleFilterClick("world")} > World AR Dimension  </button>

                </div>
              )}

            </div>

          </div>
        </header>


        {/* projects all users */}

        <section className="home-projects-section">

          <h1 className="home-section-title">Latest Art from the Dimension</h1>

          {loading && (
            <p className="home-loading-text">Loading projects…</p>
          )}

          {!loading && filteredProjects.length === 0 && (

            <p className="home-empty-text">
              No public projects yet.
            </p>

          )}

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
                  onClick={() => handleCardClick(project.id)}  >


                  {/* thumbnail */}
                  <div className="home-project-thumb">

                    {isImage && project.fileUrl ? (
                      <img
                        src={project.fileUrl}
                        alt={name}
                        className="home-project-img"  />
                    ) : (

                      <div className="home-project-placeholder">
                        <span>3D</span>
                      </div>

                    )
                    }

                    <button
                      type="button"
                      className="home-fav-btn"
                      onClick={(e) => toggleFavorite(project.id, e)}
                      aria-label={
                        isFav
                          ? "Remove from favorites"
                          : "Add to favorites"
                      } >

                      <img
                        src={isFav ? heartFilled : heartOutline}
                        className="home-fav-icon"  />

                    </button>

                  </div>

                  {/* name project */}
                  <p className="home-project-name">{name}</p>

                </article>

              );


            })
            }
          </div>

        </section>


      </section>
      
    </main>
  );
}
