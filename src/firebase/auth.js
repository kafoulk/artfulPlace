/* import { getAuth, signInWithCustomToken, signInAnonymously, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'

// Helpers accept an auth instance when available. Return standardized { user, error }.
export async function signIn(authInstance, token) {
  const auth = authInstance || getAuth()
  try {
    let res
    if (token) res = await signInWithCustomToken(auth, token)
    else res = await signInAnonymously(auth)
    return { user: res.user, error: null }
  } catch (err) {
    return { user: null, error: err }
  }
}

export async function signUpWithEmail(authInstance, email, password) {
  const auth = authInstance || getAuth()
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password)
    return { user: res.user, error: null }
  } catch (err) { return { user: null, error: err } }
}

export async function signInWithEmailHelper(authInstance, email, password) {
  const auth = authInstance || getAuth()
  try {
    const res = await signInWithEmailAndPassword(auth, email, password)
    return { user: res.user, error: null }
  } catch (err) { return { user: null, error: err } }
}

export async function signOutUser(authInstance) {
  const auth = authInstance || getAuth()
  try { await signOut(auth); return { success: true } } catch (err) { return { success: false, error: err } }
}
 */