import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const COLLECTION = "users";

// crea el doc si no existe y devuelve los datos
export async function ensureUserDoc(uid, defaults = {}) {


  const ref = doc(db, COLLECTION, uid);
  const snap = await getDoc(ref);

if (!snap.exists()) {


    const base = {
      displayName: "",
      email: "",
      photoURL: "",
      bannerURL: "",
      socials: {},
      ...defaults,
    };

  
  await setDoc(ref, base, { merge: true });
    return base;
  }

  return snap.data();
}

// obtiene el perfil 
export async function getUserProfile(uid) {

  const ref = doc(db, COLLECTION, uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;

}

// actualiza el perfil 
export async function updateUserProfile(uid, updates) {
  
  const ref = doc(db, COLLECTION, uid);
  await setDoc(ref, updates, { merge: true });
}
