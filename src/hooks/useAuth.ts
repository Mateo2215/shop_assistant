// Keeps an anonymous Firebase session alive so Firestore queries always carry
// an auth token. The session is created once and then restored from local
// persistence on later visits (works offline after the first online launch).
import { useEffect, useState } from 'react'
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import { auth } from '../firebase'

export function useAuth() {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setReady(true)
      } else {
        // No restored session — create an anonymous one (needs network once).
        signInAnonymously(auth).catch((e) => setError(e as Error))
      }
    })
    return unsubscribe
  }, [])

  return { ready, error }
}
