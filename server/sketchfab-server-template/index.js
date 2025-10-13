// index.js (Updated Express Server)

/*
Express server template for Sketchfab OAuth and API proxy.
Fill the environment variables and deploy to a secure server.

ENV variables required:
- FIREBASE_SERVICE_ACCOUNT_JSON (the JSON string or path to service account file)
- SKETCHFAB_CLIENT_ID
- SKETCHFAB_CLIENT_SECRET
- SERVER_BASE_URL (e.g., https://your-server.com)
- CLIENT_APP_URL (e.g., http://localhost:5173 or https://your-app.com)

Endpoints:
POST /api/sketchfab/auth/start
GET /api/sketchfab/auth/callback
POST /api/sketchfab/upload
PATCH /api/sketchfab/models/:modelUid
DELETE /api/sketchfab/models/:modelUid

This template demonstrates verifying Firebase ID tokens (client should include ID token in Authorization: Bearer <idToken> header).
It stores per-user Sketchfab tokens in Firestore under collection `sketchfabTokens` keyed by uid.
*/

// --- 1. Essential Dependency Imports (CommonJS style) ---
const express = require('express')
const fetch = require('node-fetch')
const multer = require('multer')
const admin = require('firebase-admin')
const cors = require('cors') // Added for frontend/backend communication
const dotenv = require('dotenv') // Added for local development .env file
const FormData = require('form-data') // Added to ensure form-data is imported correctly

// Load environment variables from .env file for local development
dotenv.config()

const app = express()
const upload = multer({ storage: multer.memoryStorage() })
const port = process.env.PORT || process.env.BACKEND_PORT || 3000 // Use BACKEND_PORT from .env if available

// Initialize Firebase Admin with service account JSON (as env var containing JSON)
if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  console.warn('FIREBASE_SERVICE_ACCOUNT_JSON not set. Server will not start properly.')
} else {
  try {
    const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
    admin.initializeApp({ credential: admin.credential.cert(sa) })
  } catch (e) {
    console.error('Error parsing FIREBASE_SERVICE_ACCOUNT_JSON:', e.message)
    console.warn('Firebase Admin initialization failed.')
  }
}

const db = admin.firestore()

// --- 2. Middleware Configuration ---
app.use(express.json())
app.use(cors({
    origin: process.env.CLIENT_APP_URL || '*', // Set a specific origin in production!
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}))


// Root path for health check
app.get('/', (req, res) => {
    res.status(200).send('ARtful Place Sketchfab Proxy Server is Running.')
})


// Middleware to verify Firebase ID tokens
async function verifyIdToken(req, res, next) {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).send('Missing id token')
  const idToken = auth.split(' ')[1]
  try {
    const decoded = await admin.auth().verifyIdToken(idToken)
    req.uid = decoded.uid
    next()
  } catch (err) {
    res.status(401).send('Invalid id token: ' + String(err))
  }
}

// Start Sketchfab OAuth: server builds authorize URL with redirect to /auth/callback
app.post('/api/sketchfab/auth/start', verifyIdToken, async (req, res) => {
  const clientId = process.env.SKETCHFAB_CLIENT_ID
  const redirect = `${process.env.SERVER_BASE_URL}/api/sketchfab/auth/callback`
  const state = JSON.stringify({ uid: req.uid })
  const url = `https://sketchfab.com/oauth2/authorize/?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirect)}&scope=all&state=${encodeURIComponent(state)}`
  res.json({ authorizeUrl: url })
})

// OAuth callback: exchange code for token, store token in Firestore tied to uid
app.get('/api/sketchfab/auth/callback', async (req, res) => {
  const { code, state } = req.query
  if (!code || !state) return res.status(400).send('Missing code/state')
  let parsed
  try { parsed = JSON.parse(state) } catch (e) { return res.status(400).send('Invalid state') }
  const uid = parsed.uid
  const tokenRes = await fetch('https://sketchfab.com/oauth2/token/', { // Corrected API host from original v3 to base
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'authorization_code', code: code, client_id: process.env.SKETCHFAB_CLIENT_ID, client_secret: process.env.SKETCHFAB_CLIENT_SECRET, redirect_uri: `${process.env.SERVER_BASE_URL}/api/sketchfab/auth/callback` })
  })
  if (!tokenRes.ok) {
    const t = await tokenRes.text()
    return res.status(502).send('Token exchange failed: ' + t)
  }
  const tokenBody = await tokenRes.json()
  // Check if the Sketchfab API returns an error in the body
  if (tokenBody.error) {
    return res.status(400).send(`Sketchfab Token Error: ${tokenBody.error_description || tokenBody.error}`)
  }
  await db.collection('sketchfabTokens').doc(uid).set(tokenBody, { merge: true })
  // redirect to app (using the new CLIENT_APP_URL variable)
  res.redirect(process.env.CLIENT_APP_URL || '/')
})

// Helper to get stored tokens for uid
async function getTokensForUid(uid) {
  const doc = await db.collection('sketchfabTokens').doc(uid).get()
  return doc.exists ? doc.data() : null
}

// Upload model proxy: receives multipart/form-data, forwards file to Sketchfab with user's token
app.post('/api/sketchfab/upload', verifyIdToken, upload.single('modelFile'), async (req, res) => {
  const uid = req.uid
  const tokens = await getTokensForUid(uid)
  if (!tokens || !tokens.access_token) return res.status(403).send('No Sketchfab token for user. Please connect your account.')
  const file = req.file
  if (!file) return res.status(400).send('No file provided')
  
  // Build form-data to Sketchfab
  // FormData is now explicitly required at the top, fixing the conditional import issue
  const fd = new FormData()
  fd.append('modelFile', file.buffer, { filename: req.body.filename || 'upload.obj', contentType: file.mimetype || 'application/octet-stream' }) // Added mimetype
  if (req.body.title) fd.append('title', req.body.title)
  if (req.body.description) fd.append('description', req.body.description)
  // Add other Sketchfab fields from request body if necessary (e.g., tags, categories)
  for (const key in req.body) {
    if (key !== 'filename' && key !== 'title' && key !== 'description') {
      fd.append(key, req.body[key])
    }
  }
  
  // Forward to Sketchfab
  const uploadRes = await fetch('https://api.sketchfab.com/v3/models', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.access_token}` },
    body: fd
  })
  
  const text = await uploadRes.text()
  if (!uploadRes.ok) return res.status(502).send(`Sketchfab Upload Failed: ${text}`)
  
  try {
    const parsed = JSON.parse(text)
    // Save model metadata in Firestore under artworks collection
    await db.collection('artworks').add({ owner: uid, sketchfabUid: parsed.uid, title: req.body.title || parsed.title || '', createdAt: admin.firestore.FieldValue.serverTimestamp(), metadata: parsed })
    res.json(parsed)
  } catch (e) {
    console.error('Failed to parse Sketchfab response:', text)
    return res.status(500).send('Failed to parse Sketchfab response.')
  }
})

// Edit model metadata (proxy to Sketchfab)
app.patch('/api/sketchfab/models/:modelUid', verifyIdToken, async (req,res) => {
  const uid = req.uid
  const tokens = await getTokensForUid(uid)
  if (!tokens || !tokens.access_token) return res.status(403).send('No Sketchfab token for user. Please connect your account.')
  const modelUid = req.params.modelUid
  const patchRes = await fetch(`https://api.sketchfab.com/v3/models/${modelUid}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${tokens.access_token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(req.body)
  })
  const txt = await patchRes.text()
  if (!patchRes.ok) return res.status(502).send(`Sketchfab Update Failed: ${txt}`)
  try {
    res.json(JSON.parse(txt))
  } catch (e) {
    // Patch response might be empty or 204 No Content
    res.status(200).json({ ok: true, message: `Model ${modelUid} updated.` })
  }
})

// Delete model
app.delete('/api/sketchfab/models/:modelUid', verifyIdToken, async (req,res) => {
  const uid = req.uid
  const tokens = await getTokensForUid(uid)
  if (!tokens || !tokens.access_token) return res.status(403).send('No Sketchfab token for user. Please connect your account.')
  const modelUid = req.params.modelUid
  const delRes = await fetch(`https://api.sketchfab.com/v3/models/${modelUid}`, { method: 'DELETE', headers: { Authorization: `Bearer ${tokens.access_token}` } })
  if (!delRes.ok) return res.status(502).send(`Sketchfab Delete Failed: ${await delRes.text()}`)
  // Remove Firestore record(s)
  await db.collection('artworks').where('sketchfabUid','==',modelUid).get().then(s => { s.forEach(doc => doc.ref.delete()) })
  res.json({ ok: true })
})

app.listen(port, () => console.log('Sketchfab proxy listening on port', port))