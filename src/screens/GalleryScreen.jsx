import React, { useEffect, useState } from 'react'
import { useFirebase } from '../context/FirebaseContext'
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore'

export default function GalleryScreen() {
  const { db, authReady, error } = useFirebase()
  const appId = (typeof window !== 'undefined' && window.__firebase_config && window.__firebase_config.projectId) ? window.__firebase_config.projectId : 'artful-place'
  const [artworks, setArtworks] = useState([])
  const [loading, setLoading] = useState(true)
  const [firestoreError, setFirestoreError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function fetchArtworks() {
      setLoading(true)
      // If Firestore is configured, try to load the 'artworks' collection
      if (db) {
        try {
          const colRef = collection(db, 'artifacts', appId, 'public', 'data', 'artworks')
          const q = query(colRef, orderBy('createdAt', 'desc'), limit(100))
          const snap = await getDocs(q)
          const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
          if (!cancelled) setArtworks(items)
        } catch (e) {
          console.warn('Failed to load artworks from Firestore:', e.message)
          // Surface permission errors to the UI and avoid repeating noisy attempts
          if (!cancelled) setFirestoreError(String(e.message || e))
        }
      }

      // Fallback demo items (visible when no DB or empty collection)
      if (!cancelled && (!db || artworks.length === 0)) {
        setArtworks([
          { id: 'demo-1', title: 'Sculpture A', imageUrl: 'https://picsum.photos/seed/a/600/400' },
          { id: 'demo-2', title: 'Digital Study B', imageUrl: 'https://picsum.photos/seed/b/600/400' },
          { id: 'demo-3', title: 'Interactive Form C', imageUrl: 'https://picsum.photos/seed/c/600/400' },
        ])
      }

      if (!cancelled) setLoading(false)
    }

    if (authReady) fetchArtworks()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, authReady])

  if (!authReady) return <div style={{ padding: 20 }}>Initializing...</div>
  if (error) return <div style={{ padding: 20, color: 'salmon' }}>Firebase initialization error: {String(error)}</div>

  if (firestoreError) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Gallery</h2>
        <div style={{ marginTop: 8, color: 'salmon' }}>
          Firestore error: {firestoreError}
          <div style={{ marginTop: 8 }}>
            This usually means your Firestore security rules prevent reads. For development, sign in via the Account page or relax the rules to allow reads.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ marginTop: 0 }}>Gallery</h2>
      <p style={{ color: '#9fb0c8' }}>
        Browse artworks. If you connect Firestore, this will list real documents from the
        <code> artifacts/{appId}/public/data/artworks</code> collection (appId = {appId}).
      </p>

      {loading ? (
        <div style={{ marginTop: 12 }}>Loading...</div>
      ) : (
        <div className="gallery" style={{ marginTop: 12 }}>
          {artworks.map(a => (
            <div key={a.id} className="card">
              <div className="card-media"><img src={a.imageUrl} alt={a.title} /></div>
              <div className="card-body"><div className="card-title">{a.title}</div></div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
