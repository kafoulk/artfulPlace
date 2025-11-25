import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Popup from "reactjs-popup";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { db } from "../lib/firebase";
import { uploadProjectFile } from "../lib/uploads";
import { useAuth } from "../context/AuthContext";

import upIcon from "../assets/up.svg";
import checkIcon from "../assets/check.svg";

import "../styles/upload.css";

export default function UploadScreen() {

const { user } = useAuth();

  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showSaved, setShowSaved] = useState(false);

  // dropzone config
  const onDrop = useCallback((acceptedFiles) => {

 const f = acceptedFiles?.[0];
    if (!f) return;

    setFile(f);

    // preview solo para imágenes
    if (f.type.startsWith("image/")) {
      
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);

    } else {

      setPreviewUrl("");
    }
  }, []);

  const {

 getRootProps,
 getInputProps,
isDragActive,
open: openFileDialog,
 
} = useDropzone({

    onDrop,
    maxFiles: 1,
    noClick: true,
    noKeyboard: true,
    // files for img and 3d files
    accept: {
      "image/*": [],
      "model/gltf-binary": [".glb"],
      "model/gltf+json": [".gltf"],
      "model/obj": [".obj"],
      "application/octet-stream": [".fbx"],

    },

  });

  const resetForm = () => {
   
    setProjectName("");
    setDescription("");
    setFile(null);
    setPreviewUrl("");
    setError("");

  };

  const handleCancel = () => {
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

 if (!user) {
  
  setError("You must be logged in to upload a project.");
      return;
   
    }

    if (!projectName || !description || !file) {
      setError("Please fill all fields and choose a file.");
      return;
    }

    try {
      setSaving(true);

      // upload to storage
const uploaded = await uploadProjectFile(user.uid, file);

 // save metadata en firestore

 const projectsRef = collection(db, "projects");
  
 await addDoc(projectsRef, {
        userId: user.uid,
      projectName,
       
      description,
        fileUrl: uploaded.url,
       
        filePath: uploaded.path,
        fileName: uploaded.name,
        fileType: uploaded.contentType || "unknown",
        createdAt: serverTimestamp(),
      });

      //  popup saved y limpiar form
      resetForm();

      setShowSaved(true);
   setTimeout(() => setShowSaved(false), 2000);

 } catch (err) {

   console.error(err);
      setError(err.message || "Error uploading project");

    } finally {
      setSaving(false);
    }

  };

  return (


    <main className="upload-root">


      <section className="upload-card">


  <header className="upload-header">

    <h1 className="upload-title">Upload Project</h1>

  </header>

     {error && <p className="upload-error">{error}</p>}

     <form className="upload-form" onSubmit={handleSubmit}>
        
      {/* project name */}
        
   <label className="upload-label" htmlFor="projectName"> Project Name </label>

    <input
      id="projectName"
      type="text"
      className="upload-input"
      placeholder="Enter project name"
      value={projectName}
      onChange={(e) => setProjectName(e.target.value)}
      required  />

          {/* description */}

          <label className="upload-label" htmlFor="description">
            Description
          </label>

          <textarea
            id="description"
            className="upload-textarea"
            placeholder="Describe your project"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required />

   {/* dropzone */}
        
          <div {...getRootProps({ className: `upload-dropzone ${ isDragActive ? "upload-dropzone-active" : ""  }`,
           })} >

 <input {...getInputProps()} required />

            <div className="upload-dropzone-inner">

              {/* icono y texto cuando no hay preview */}
              {!previewUrl && (
                <>
                  <img src={upIcon} alt="" className="upload-drop-icon" />

                  <p className="upload-drop-title">Drop file here</p>

                  <p className="upload-drop-subtitle">
                    File supported .jpg, .png, .gif, .glb, .gltf, .obj, .fbx
                  </p>

                </>
              )}

              {/* Preview de imagen si hay  */}
              {
              previewUrl && (
                <div className="upload-preview-wrapper">

                  <img src={previewUrl} alt="Preview" className="upload-preview-image"  />

                </div>
              )}

              {/* file name */}

              {file && (
                <p className="upload-file-name" title={file.name}>
                  {file.name}
                </p>

              )}

              <button
                type="button"
                className="upload-choose-btn"
                onClick={openFileDialog} > Choose file </button>

            </div>

          </div>

          {/* btn */}
          <div className="upload-actions">
           
            <button
              type="submit"
              className="upload-save-btn"
              disabled={saving} >
              {saving ? "Saving..." : "Save"}
            </button>

            <button
              type="button"
              className="upload-cancel-btn"
              onClick={handleCancel}>Cancel </button> 

               </div>

        </form>

        {/* popup saved */}


       <Popup open={showSaved}

  closeOnDocumentClick={false}
  closeOnEscape={false}

  modal={false}

  contentStyle={{ padding: "0", border: "none", background: "transparent" }}
  overlayStyle={{ background: "rgba(0,0,0,0.0)" }} >

  <div className="popup-saved">

    <img src={checkIcon} alt="Saved" className="popup-check-icon" />
    <p>Saved!</p>

  </div>


</Popup>
      </section>


    </main>
  );
}
