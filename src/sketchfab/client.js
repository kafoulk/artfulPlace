/* Sketchfab client helpers (talk to your server-side proxy)
    - startSketchfabAuth: calls server to get the Sketchfab authorize URL, then returns it.
    - uploadModelToSketchfab: sends a file + metadata to server which proxies to Sketchfab
    - editSketchfabModel, deleteSketchfabModel: call server endpoints

    These functions use Firebase Auth to get the ID token. Ensure Firebase is initialized in the app.
*/
import { getAuth } from 'firebase/auth'

async function getIdToken() {
  const auth = getAuth()
  const user = auth.currentUser
  if (!user) throw new Error('You must be signed in to perform this action')
  return await user.getIdToken()
}

export async function startSketchfabAuth(apiBase) {
  const idToken = await getIdToken()
  const res = await fetch(`${apiBase}/api/sketchfab/auth/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error('Auth start failed: ' + txt)
  }
  const body = await res.json()
  // server returns { authorizeUrl }
  // --- CHANGE: Returning the URL so the component can handle redirection ---
  return body.authorizeUrl
}

export async function uploadModelToSketchfab(apiBase, file, metadata = {}) {
  const idToken = await getIdToken()
  const fd = new FormData()
  fd.append('modelFile', file)
  Object.entries(metadata).forEach(([k, v]) => fd.append(k, v))
  const res = await fetch(`${apiBase}/api/sketchfab/upload`, {
    method: 'POST',
    // Note: Headers for file uploads (Content-Type: multipart/form-data) 
    // are automatically set by the browser when using FormData, 
    // so we only need to manually pass the Authorization header.
    headers: { Authorization: `Bearer ${idToken}` }, 
    body: fd,
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function editSketchfabModel(apiBase, modelUid, metadata = {}) {
  const idToken = await getIdToken()
  const res = await fetch(`${apiBase}/api/sketchfab/models/${modelUid}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify(metadata),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function deleteSketchfabModel(apiBase, modelUid) {
  const idToken = await getIdToken()
  const res = await fetch(`${apiBase}/api/sketchfab/models/${modelUid}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${idToken}` },
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
