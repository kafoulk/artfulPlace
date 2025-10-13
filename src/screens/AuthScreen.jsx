import React, { useState } from 'react'
import { useFirebase } from '../context/FirebaseContext'
import { signIn, signUpWithEmail, signInWithEmailHelper, signOutUser } from '../firebase/auth'

export default function AuthScreen() {
  const { auth, user } = useFirebase()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)

  async function handleAnon() {
    setLoading(true); setMsg(null)
    const res = await signIn(auth)
    setLoading(false)
    if (res.error) setMsg(String(res.error))
  }

  async function handleSignUp() {
    setLoading(true); setMsg(null)
    const res = await signUpWithEmail(auth, email, password)
    setLoading(false)
    if (res.error) setMsg(String(res.error))
  }

  async function handleSignInEmail() {
    setLoading(true); setMsg(null)
    const res = await signInWithEmailHelper(auth, email, password)
    setLoading(false)
    if (res.error) setMsg(String(res.error))
  }

  async function handleSignOut() {
    setLoading(true); setMsg(null)
    const res = await signOutUser(auth)
    setLoading(false)
    if (res.error) setMsg(String(res.error))
  }

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginTop: 0 }}>Account</h2>
      {user ? (
        <div>
          <div>Signed in as <strong>{user.uid}</strong></div>
          <div style={{ marginTop: 12 }}>
            <button onClick={handleSignOut} className="btn btn-ghost">Sign out</button>
          </div>
        </div>
      ) : (
        <div>
          <p style={{ color: '#9fb0c8' }}>Sign in anonymously, or with email/password to manage uploads.</p>
          <div style={{ marginTop: 12 }}>
            <button onClick={handleAnon} disabled={loading} className="btn btn-primary">Sign in (anonymous)</button>
          </div>
          <div style={{ marginTop: 12 }}>
            <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} type="password" />
            <div style={{ marginTop: 8 }}>
              <button onClick={handleSignInEmail} className="btn btn-primary">Sign in (email)</button>
              <button onClick={handleSignUp} style={{ marginLeft: 8 }} className="btn btn-ghost">Create account</button>
            </div>
          </div>
        </div>
      )}

      {msg && <div style={{ marginTop: 12, color: 'salmon' }}>{msg}</div>}
    </div>
  )
}
