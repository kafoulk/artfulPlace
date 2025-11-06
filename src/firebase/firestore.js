/* import { getFirestore, collection, addDoc, getDocs, doc, getDoc, setDoc, query, orderBy, limit, serverTimestamp, onSnapshot } from 'firebase/firestore'

// Determine appId from injected firebase config or fallback
const APP_ID = (typeof window !== 'undefined' && window.__firebase_config && window.__firebase_config.projectId) ? window.__firebase_config.projectId : 'artful-place'

function artworksCollectionRef(db) {
  // path: /artifacts/{appId}/public/data/artworks
  return collection(db, 'artifacts', APP_ID, 'public', 'data', 'artworks')
}

export async function getModelList(dbInstance, limitCount = 50) {
  const db = dbInstance || getFirestore()
  try {
    const q = query(artworksCollectionRef(db), orderBy('createdAt', 'desc'), limit(limitCount))
    const snap = await getDocs(q)
    return { items: snap.docs.map(d => ({ id: d.id, ...d.data() })), error: null }
  } catch (err) { return { items: [], error: err } }
}

export async function saveToken(dbInstance, tokenId, payload) {
  const db = dbInstance || getFirestore()
  try {
    const ref = doc(db, 'tokens', tokenId)
    await setDoc(ref, payload, { merge: true })
    return { ok: true }
  } catch (err) { return { ok: false, error: err } }
}

export async function fetchToken(dbInstance, tokenId) {
  const db = dbInstance || getFirestore()
  try {
    const ref = doc(db, 'tokens', tokenId)
    const snap = await getDoc(ref)
    return { data: snap.exists() ? snap.data() : null, error: null }
  } catch (err) { return { data: null, error: err } }
}

// Add an artwork document to the namespaced 'artifacts/{appId}/public/data/artworks' collection.
export async function addArtwork(dbInstance, payload) {
  const db = dbInstance || getFirestore()
  try {
    const ref = artworksCollectionRef(db)
    const data = { ...payload, createdAt: serverTimestamp() }
    const docRef = await addDoc(ref, data)
    return { id: docRef.id, error: null }
  } catch (err) { return { id: null, error: err } }
}

// Subscribe to realtime updates on the namespaced artworks collection. Returns an unsubscribe function.
export function subscribeToArtworks(dbInstance, onUpdate, limitCount = 100) {
  const db = dbInstance || getFirestore()
  const q = query(artworksCollectionRef(db), orderBy('createdAt', 'desc'), limit(limitCount))
  const unsub = onSnapshot(q, (snap) => {
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    onUpdate(null, items)
  }, (err) => onUpdate(err, []))
  return unsub
}
 */