// AuthContext.jsx
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

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
// Monitor auth state changes
  useEffect(() => {

// subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Login
  const login = async (email, password) => {

    const result = await signInWithEmailAndPassword(auth, email, password);
    setUser(result.user);
    return result;

  };

  // Signup
  const signup = async (email, password, name) => {

    const result = await createUserWithEmailAndPassword(auth, email, password);

   await updateProfile(result.user, { displayName: name });
    setUser(result.user);

    return result;
  };

  // Google login
  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    
    setUser(result.user); 
    return result;
  };

  // Logout
  const logout = () => signOut(auth);
// Provide auth context to children
  return (
   
   <AuthContext.Provider value={{ user, login, signup, loginWithGoogle, logout }}>
      {!loading && children}
   
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
