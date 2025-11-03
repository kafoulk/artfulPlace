/* import React from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { FirebaseProvider } from './context/FirebaseContext'
import GalleryScreen from './screens/GalleryScreen'
import ManagerScreen from './screens/ManagerScreen'
import AuthScreen from './screens/AuthScreen'
import './styles/index.css'

export default function App() {
  return (
    <FirebaseProvider>
      <BrowserRouter>
        <div className="app-root min-h-screen">
          <header className="p-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-indigo-300">Artful Place</h1>
            <nav className="flex gap-4">
              <Link to="/" className="text-indigo-200 hover:text-white">Gallery</Link>
              <Link to="/manager" className="text-indigo-200 hover:text-white">Manager</Link>
              <Link to="/account" className="text-indigo-200 hover:text-white">Account</Link>
            </nav>
          </header>

          <main className="p-4">
            <Routes>
              <Route path="/" element={<GalleryScreen />} />
              <Route path="/manager" element={<ManagerScreen />} />
              <Route path="/account" element={<AuthScreen />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </FirebaseProvider>
  )
} */

 
import { Routes, Route, Link } from "react-router-dom";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

function Home() {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: "24px" }}>
      <h2>Welcome, {user?.displayName || user?.email}</h2>
      <p>Home protected screen</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
   
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/signup" element={<SignupScreen />} />

     
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      
      <Route
        path="*"
        element={
          <div style={{ padding: 24 }}>
            <h3>Page Not Found</h3>
            <Link to="/">Go Home</Link>
          </div>
        }
      />
    </Routes>
  );
}
