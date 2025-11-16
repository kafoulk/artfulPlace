import React, { createContext, useContext, useState, useEffect } from 'react'
import { initializeApp } from 'firebase/app'
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const FirebaseContext = createContext(null)

export const useFirebase = () => useContext(FirebaseContext)

export function FirebaseProvider({ children }) {
  const [app, setApp] = useState(null)
  const [auth, setAuth] = useState(null)
  const [db, setDb] = useState(null)
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const config = typeof window !== 'undefined' ? window.__firebase_config : null
    if (!config) { setError('Missing firebase config'); setAuthReady(true); return }
    try {
      const a = initializeApp(config)
      const _auth = getAuth(a)
      const _db = getFirestore(a)
      setApp(a); setAuth(_auth); setDb(_db)

      const unsub = onAuthStateChanged(_auth, (u) => { setUser(u); setAuthReady(true) })
      // try anonymous signin if not signed in
      if (!_auth.currentUser) signInAnonymously(_auth).catch(e => setError(e.message))
      return () => unsub()
    } catch (err) {
      setError(err.message)
      setAuthReady(true)
    }
  }, [])

  const value = { app, auth, db, user, authReady, error }
  return <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>
}
