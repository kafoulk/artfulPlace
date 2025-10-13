import React, { useEffect, useState } from 'react'
import { useFirebase } from '../context/FirebaseContext'
import { addArtwork, subscribeToArtworks } from '../firebase/firestore'
import { startSketchfabAuth, uploadModelToSketchfab } from '../sketchfab/client'

export default function ManagerScreen() {
  const { db, user } = useFirebase()
  const [artworks, setArtworks] = useState([])
  const [title, setTitle] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [modelFile, setModelFile] = useState(null)
  const [sketchfabMsg, setSketchfabMsg] = useState(null)
  const [msg, setMsg] = useState(null)
  const [firestoreError, setFirestoreError] = useState(null)

  useEffect(() => {
    if (!db) return
    const unsub = subscribeToArtworks(db, (err, items) => {
      if (err) {
        console.warn('Subscription error:', err)
        setFirestoreError(String(err))
      } else {
        setArtworks(items)
      }
    })
    return () => unsub && unsub()
  }, [db])

  async function handleUpload() {
    if (!user) { setMsg('You must be signed in to upload.'); return }
    setMsg(null)
    const payload = { title, imageUrl, owner: user.uid }
    const res = await addArtwork(db, payload)
    if (res.error) {
      setMsg(String(res.error))
      // surface permission error separately so it's obvious in UI
      setFirestoreError(String(res.error))
    } else { setMsg('Uploaded'); setTitle(''); setImageUrl('') }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Manager Dashboard</h2>
      <p style={{ color: '#9fb0c8' }}>Upload models, manage gallery, and view analytics here.</p>

      <div style={{ marginTop: 12 }}>
        <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
        <input placeholder="Image URL" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
        <div style={{ marginTop: 8 }}>
          <button onClick={handleUpload} className="btn btn-primary">Upload Artwork</button>
        </div>
        <div style={{ marginTop: 8 }}>
          <button onClick={async () => { setSketchfabMsg('Redirecting to Sketchfab...'); try { await startSketchfabAuth('http://localhost:3000') } catch (e) { setSketchfabMsg(String(e)) } }} className="btn btn-ghost">Connect Sketchfab</button>
        </div>
        <div style={{ marginTop: 8 }}>
          <input type="file" accept=".obj,.gltf,.glb,.zip" onChange={e => setModelFile(e.target.files && e.target.files[0])} />
          <button onClick={async () => { if (!modelFile) { setSketchfabMsg('Select a model file first'); return } setSketchfabMsg('Uploading to Sketchfab...'); try { const res = await uploadModelToSketchfab('http://localhost:3000', modelFile, { title }); setSketchfabMsg('Uploaded to Sketchfab: ' + (res.uid || res.id || 'ok')) } catch (err) { setSketchfabMsg(String(err)) } }} className="btn btn-primary" style={{ marginLeft: 8 }}>Upload to Sketchfab</button>
        </div>
      </div>

      {msg && <div style={{ marginTop: 12, color: msg === 'Uploaded' ? 'lightgreen' : 'salmon' }}>{msg}</div>}
      {firestoreError && (
        <div style={{ marginTop: 12, color: 'salmon' }}>
          Firestore error: {firestoreError}
          <div style={{ marginTop: 6 }}>If this is a permissions issue, sign in via the Account page or update Firestore rules.</div>
        </div>
      )}
      {sketchfabMsg && <div style={{ marginTop: 12, color: sketchfabMsg.startsWith('Uploaded') ? 'lightgreen' : 'salmon' }}>{sketchfabMsg}</div>}

      <div style={{ marginTop: 18 }}>
        <h3>Gallery Preview</h3>
        <div className="gallery" style={{ marginTop: 12 }}>
          {artworks.map(a => (
            <div key={a.id} className="card">
              <div className="card-media"><img src={a.imageUrl} alt={a.title} /></div>
              <div className="card-body"><div className="card-title">{a.title}</div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
