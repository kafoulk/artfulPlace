import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";

import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";

import heartOutline from "../assets/heart-outline.svg";
import heartFilled from "../assets/heart-filled.svg";
import editIcon from "../assets/edit.svg";
import shareIcon from "../assets/share.svg";
import backIcon from "../assets/arrow.svg"; 
import deleteIcon from "../assets/delete.svg"; 

import "../styles/project.css"; 

const useProjectOwner = (userId) => {
  const [owner, setOwner] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const loadOwner = async () => {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setOwner(docSnap.data());
      }
    };

    loadOwner();
  }, [userId]);

  return owner;
};


export default function ProjectScreen() {
  const { user } = useAuth();
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  // Load project data
  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    const docRef = doc(db, "projects", projectId);
    
    // Fetch project
    const fetchProject = async () => {
      try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProject({ id: docSnap.id, ...data });
          setIsOwner(user && user.uid === data.userId);
        } else {
          console.error("No such project!");
          setProject(null);
        }
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId, user]);

  // Load favorite status
  useEffect(() => {
    if (!user || !project) return;

    const checkFavorite = async () => {
      const favDocRef = doc(db, "users", user.uid, "favorites", projectId);
      const docSnap = await getDoc(favDocRef);
      setIsFavorite(docSnap.exists());
    };

    checkFavorite();
  }, [user, project, projectId]);

  const projectOwner = useProjectOwner(project?.userId);
  const projectName = project?.projectName || project?.name || "Untitled Project";
  const projectDescription = project?.description || "No description provided.";
  const projectFileUrl = project?.fileUrl;
  const isImage = typeof project?.fileType === "string" && project?.fileType.startsWith("image/");
  
  const ownerName = projectOwner?.displayName || projectOwner?.email || "Unknown User";
  

  
  const handleToggleFavorite = async () => {
    if (!user || !project) return;

    const favDocRef = doc(db, "users", user.uid, "favorites", projectId);

    try {
      if (isFavorite) {
        await deleteDoc(favDocRef);
        setIsFavorite(false);
      } else {
        await setDoc(favDocRef, {
          projectId,
          createdAt: new Date(),
        });
        setIsFavorite(true);
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  const handleDeleteProject = async () => {
    if (!isOwner || !project) return;
    
    if (window.confirm(`Are you sure you want to delete "${projectName}"?`)) {
        try {
            await deleteDoc(doc(db, "projects", projectId));
            alert("Project deleted successfully.");
            navigate('/home');
        } catch (error) {
            console.error("Error deleting document: ", error);
            alert("Failed to delete project.");
        }
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: projectName,
          text: projectDescription,
          url: url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Project link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  // --- Rendering States ---
  if (loading) {
    return (
      <main className="project-root">
        <div className="project-card">
          <p>Loading project details...</p>
        </div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="project-root">
        <div className="project-card">
            <button className="project-back-btn" onClick={() => navigate(-1)}>
                <img src={backIcon} alt="Back" />
            </button>
          <p>Project not found.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="project-root">
      <div className="project-card">
        {/* Header Row: Back Button and Delete Button */}
        <header className="project-header">
          <button className="project-back-btn" onClick={() => navigate(-1)}>
            <img src={backIcon} alt="Back" />
          </button>
          {isOwner && (
            <button className="project-delete-btn" onClick={handleDeleteProject} aria-label="Delete Project">
                <img src={deleteIcon} alt="Delete" />
            </button>
          )}
        </header>

        {/* Project Thumbnail */}
        <div className="project-thumbnail">
          {isImage && projectFileUrl ? (
            <img src={projectFileUrl} alt={projectName} className="project-image" />
          ) : (
            <div className="project-placeholder">
              <span>{isImage ? "Image Preview" : "3D Model Preview"}</span>
            </div>
          )}
        </div>

        {/* Project Details */}
        <section className="project-details">
          <div className="project-title-row">
            <h1 className="project-name">{projectName}</h1>
                      {isOwner && (
            <button 
                className="project-action-btn" 
                onClick={() => navigate(`/project/edit/${projectId}`)}
                aria-label="Edit Project">
              <img src={editIcon} alt="Edit" />
            </button>
          )}
          </div>
          
          <p className="project-creator-info">
            Created by: <span className="project-creator-name">{ownerName}</span>
          </p>

          <p className="project-description">
            {projectDescription}
          </p>
        </section>

        {/* Action Buttons */}
        <footer className="project-actions">
          <button className="project-ar-btn">AR View</button>
            <button className="project-action-btn" onClick={handleToggleFavorite} aria-label="Toggle Favorite">
            <img src={isFavorite ? heartFilled : heartOutline} alt="Favorite" />
          </button>
            <button className="project-share-btn" onClick={handleShare} aria-label="Share Project">
              <img src={shareIcon} alt="Share" />
            </button>
          
        </footer>
      </div>
    </main>
  );
}