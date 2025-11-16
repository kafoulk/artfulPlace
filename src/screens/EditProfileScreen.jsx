import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateEmail, updatePassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

import { useAuth } from "../context/AuthContext";
import { auth, db } from "../lib/firebase";
import { uploadUserImage } from "../lib/uploads";

import editIcon from "../assets/edit.svg";
import defaultAvatar from "../assets/pfp.jpg";
import defaultBanner from "../assets/banner-p.jpg";


import "../styles/profile.css";

export default function EditProfileScreen() {

  const { user, profile, setProfile } = useAuth();
  const navigate = useNavigate();

const [form, setForm] = useState(null);
const [saving, setSaving] = useState(false);
const [error, setError] = useState("");

  // archivos seleccionados
  const [avatarFile, setAvatarFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);

  // refs para inputs file
  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);



  // cargar datos al iniciar
  useEffect(() => {
    if (!user) return;

    const socials = profile?.socials || {};

setForm({

  displayName: profile?.displayName || user.displayName || "",
  email: profile?.email || user.email || "",
  password: "",
  socials: {
    instagram: socials.instagram || "",
    linkedin: socials.linkedin || "",
    discord: socials.discord || "",
    x: socials.x || "",
  },

  photoURL: profile?.photoURL || user.photoURL || defaultAvatar,
  bannerURL: profile?.bannerURL || user.bannerURL || defaultBanner,
});

  }, [user, profile]);


  if (!user || !form) {

    // loading state
    return (

      <main className="profile-edit-root">

        <section className="profile-edit-card">

          <p>Loading profile…</p>
        </section>

      </main>
    );
  }

  // cuando el user elige nuevo avatar
  const handleAvatarChange = (e) => {

  const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);

    // preview local
    const previewUrl = URL.createObjectURL(file);
    setForm((prev) => ({ ...prev, photoURL: previewUrl 

    }

    ));
  };

  // cuando el user elige nuevo banner
  const handleBannerChange = (e) => {

    const file = e.target.files?.[0];

    if (!file) return;

    setBannerFile(file);

    // preview local
    const previewUrl = URL.createObjectURL(file);
    setForm((prev) => ({ ...prev, bannerURL: previewUrl 

    }

    ));
  };

  // submit form
  const handleSubmit = async (e) => {

    e.preventDefault();
    setSaving(true);
    setError("");

    try {

      // subir img
     let photoURL = form.photoURL || profile?.photoURL || user.photoURL || defaultAvatar;
let bannerURL = form.bannerURL || profile?.bannerURL || defaultBanner;

if (avatarFile) {

  photoURL = await uploadUserImage(user.uid, avatarFile, "avatar");
}

if (bannerFile) {

  bannerURL = await uploadUserImage(user.uid, bannerFile, "banner");
}

      //  actualizar auth name y photourl

const authUpdates = {};

  if (form.displayName && form.displayName !== user.displayName) {
        authUpdates.displayName = form.displayName;
      }
    
 if (photoURL && photoURL !== user.photoURL) {

   authUpdates.photoURL = photoURL;
      }

     if (Object.keys(authUpdates).length > 0) {

        await updateProfile(user, authUpdates);
      }

      //actualizar email
      if (form.email && form.email !== user.email) {

        await updateEmail(user, form.email);
      }

   // actualizar password

      if (form.password) {

        await updatePassword(user, form.password);
      }

 //  actualizar firestore profile

 const ref = doc(db, "users", user.uid);

   const newProfile = {

      displayName: form.displayName,
     email: form.email,
      socials: form.socials,
       photoURL,
     bannerURL,

      };

      await setDoc(ref, newProfile, { merge: true });

  // actualizar contexto
  if (setProfile) {
     setProfile((prev) => ({ ...(prev || {}), ...newProfile }));
      }

   navigate("/profile");

    } catch (err) {

      console.error(err);
      setError(err.message || "Error updating profile");

  } finally {

      setSaving(false);
    }

  };

  const handleCancel = () => {
    navigate("/profile");

  };

 
  return (

    <main className="profile-edit-root">

      <section className="profile-edit-card">

        {/* banner and avatr*/}


        <header className="profile-edit-header">

  {/* banner */}

  <div className="profile-edit-banner">

    <div className="profile-banner">

      <img
        src={form.bannerURL || defaultBanner}
        alt="Banner"
        className="profile-banner-img" />

    </div>

    <button
      type="button"
      className="profile-edit-banner-btn"
      onClick={() => bannerInputRef.current?.click()}
      aria-label="Change banner">

      <img src={editIcon} alt="" />

    </button>

    <input
      ref={bannerInputRef}
      type="file"
      accept="image/*"
      hidden
      onChange={handleBannerChange}/>
 
  </div>

  {/* avatar tittle btn */}

  <div className="profile-edit-header-row">

    <div className="profile-avatar-wrapper profile-edit-avatar-wrapper">
      
    <img
        src={form.photoURL || defaultAvatar}
        alt="Avatar"
        className="profile-avatar-img" />
    
    </div>

    <div className="profile-edit-title-row">
      
      <h1 className="profile-edit-title">Edit Profile</h1>

      <button
        type="button"
        className="profile-edit-avatar-btn"
        onClick={() => avatarInputRef.current?.click()}
        aria-label="Change avatar" >
     
        <img src={editIcon} alt="" />
     
      </button>

      {/* input del avatar */}

      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleAvatarChange}  />
    
    </div>
 
  </div>


</header>


        {error && <p className="profile-edit-error">{error}</p>}

   {/* form */}

    <form className="profile-edit-form" onSubmit={handleSubmit}>

 {/* name */}

 <label className="profile-label" htmlFor="displayName">First Name</label>
         
         <input
            id="displayName"
            type="text"
            className="profile-input"
            placeholder="Enter your name"
            value={form.displayName}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, displayName: e.target.value }

              ))
            } />

   {/* email */}

     <label className="profile-label" htmlFor="email"> Email </label>
         
       <input
            id="email"
            type="email"
            className="profile-input"
            placeholder="Enter your email"
            value={form.email}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, email: e.target.value }

              ))
            } />

          {/* password */}

          <label className="profile-label" htmlFor="password">Password </label>
          <input
            id="password"
            type="password"
            className="profile-input"
            placeholder="Enter new password"
            value={form.password}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, password: e.target.value }))
            } />

          {/* instagram */}
          <label className="profile-label" htmlFor="instagram">Instagram URL</label>
          
          <input
            id="instagram"
            type="text"
            className="profile-input"
            placeholder="instagram.com/yourname"
            value={form.socials.instagram}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                socials: {
                  ...prev.socials,
                  instagram: e.target.value,
                },
              }))
            } />

          {/* linkeiIn */}

          <label className="profile-label" htmlFor="linkedin"> LinkedIn URL</label>
          <input
            id="linkedin"
            type="text"
            className="profile-input"
            placeholder="linkedin.com/in/yourname"
            value={form.socials.linkedin}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                socials: {
                  ...prev.socials,
                  linkedin: e.target.value,
                },
              }))
            }  />

          {/* discord */}
          <label className="profile-label" htmlFor="discord"> Discord URL</label>
        
          <input
            id="discord"
            type="text"
            className="profile-input"
            placeholder="discordapp.com/users/yourID"
            value={form.socials.discord}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                socials: {
                  ...prev.socials,
                  discord: e.target.value,
                },
              }))
            }
          />

          {/* x */}
          <label className="profile-label" htmlFor="x">  X URL </label>
          <input
            id="x"
            type="text"
            className="profile-input"
            placeholder="x.com/yourname"
            value={form.socials.x}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                socials: {
                  ...prev.socials,
                  x: e.target.value,
                },
              }))
            } />

          {/* botones */}
          
          <div className="profile-edit-actions">

            <button
              type="submit"
              className="profile-edit-save"
              disabled={saving} >
              {saving ? "Saving..." : "Save"}
            </button>

            <button
              type="button"
              className="profile-edit-cancel"
              onClick={handleCancel} >
              Cancel
            </button>

          </div>

        </form>


      </section>

      
    </main>
  );
}
