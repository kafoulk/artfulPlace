import React from 'react'
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
}
