import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import {
  ensureUserDoc,
  updateUserProfile,
} from "../lib/firestore"; 

const AuthContext = createContext(null);


export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);      // user de firebase auth
  const [profile, setProfile] = useState(null); // doc de firestore
  const [loading, setLoading] = useState(true);

  // escucha cambios de auth y carga perfil desde firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      // usuario logueado
      setUser(firebaseUser);

      // carga o crea doc de firestore
      try {


        const data = await ensureUserDoc(firebaseUser.uid, {
          displayName: firebaseUser.displayName || "",
          email: firebaseUser.email || "",
          photoURL: firebaseUser.photoURL || "",

        });

 setProfile(data);

      } catch (err) {

        console.error("Error loading user profile:", err);
        setProfile(null);

      } finally {

        setLoading(false);

      }
    });

    return () => unsubscribe();
  }, []);

  // login email s password
  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  // signup crea usuario en auth y doc en firestore
  const signup = async (email, password, name) => {

    
  const result = await createUserWithEmailAndPassword(auth, email, password);

    if (name) {
      await updateProfile(result.user, { displayName: name });
    }

const data = await ensureUserDoc(result.user.uid, {

      displayName: name || "",
      email,
      photoURL: result.user.photoURL || "",

    });

    setProfile(data);
    return result;

  };

  // login con google
  const loginWithGoogle = async () => {

const res = await signInWithPopup(auth, googleProvider);

const data = await ensureUserDoc(res.user.uid, {

      displayName: res.user.displayName || "",
      email: res.user.email || "",
      photoURL: res.user.photoURL || "",

    });

    setProfile(data);
    return res;
  };

const logout = () => signOut(auth);

  return (

    <AuthContext.Provider
      value={{
        user,
        profile,
        setProfile,      
        login,
        signup,
        loginWithGoogle,
        logout,
      }}>

      {!loading && children}
    </AuthContext.Provider>
    
  );
}


export const useAuth = () => useContext(AuthContext);
