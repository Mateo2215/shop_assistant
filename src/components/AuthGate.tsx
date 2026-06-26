// Holds the app on a themed loading screen until the anonymous session is
// ready, so Firestore listeners never fire before auth (the rules now require
// request.auth != null). Shows a friendly message if the first sign-in fails.
import type { ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'

export function AuthGate({ children }: { children: ReactNode }) {
  const { ready, error } = useAuth()

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-8 text-center">
        <span className="text-3xl">📡</span>
        <p className="font-brand text-lg font-bold">Brak połączenia</p>
        <p className="text-market-lightMuted dark:text-market-muted">
          Nie udało się połączyć z bazą. Sprawdź internet i odśwież stronę.
        </p>
      </div>
    )
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <span
          className="h-10 w-10 animate-spin rounded-full border-4 border-market-lightRaised border-t-fresh-greenStrong dark:border-market-raised dark:border-t-fresh-greenSoft"
          aria-label="Ładowanie"
        />
        <p className="font-brand text-market-lightMuted dark:text-market-muted">Ładowanie…</p>
      </div>
    )
  }

  return <>{children}</>
}
