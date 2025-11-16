import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

// referencia al doc del usuario
function userDocRef(uid) {
  return doc(db, "users", uid);
}

// crea el doc de usuario si no existe 
export async function ensureUserDoc(user, extra = {}) {


  const uid = typeof user === "string" ? user : user.uid;
const ref = userDocRef(uid);
  const snap = await getDoc(ref);

  
if (!snap.exists()) {

    const baseData = {

      displayName: user.displayName || "",
      email: user.email || "",
      photoURL: user.photoURL || "",
      bannerURL: "",
      socials: {
        instagram: "",
        linkedin: "",
        discord: "",
        x: "",

      },

    };

 const data = { ...baseData, ...extra };
    await setDoc(ref, data, { merge: true });
    return data;

  } else {

    const data = snap.data();
    if (Object.keys(extra).length > 0) {

const merged = { ...data, ...extra };

   await setDoc(ref, merged, { merge: true });
      return merged;

    }
    return data;

  }
}

/* lee el perfil o null si no existe */
export async function getUserProfile(uid) {

  const snap = await getDoc(userDocRef(uid));


  return snap.exists() ? snap.data() : null;

}

/* atualiza el perfil */
export async function updateUserProfile(uid, data) {

  await setDoc(userDocRef(uid), data, { 
    merge: true 

  });
  
}
