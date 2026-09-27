import { useCallback, useState } from "react"
import type { Credentials } from "@/shared/lib/types"
import { getStateInstance } from "@/api/greenApi"

const STORAGE_KEY = "green_api_credentials"

export function getStoredCredentials(): Credentials | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

export function useAuth() {
  const [credentials, setCredentials] = useState<Credentials | null>(() => getStoredCredentials())
  const [connecting, setConnecting] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [instanceStateNotice, setInstanceStateNotice] = useState<string | null>(null)

  const login = useCallback(async (creds: Credentials, forceContinue = false): Promise<boolean> => {
    setConnecting(true)
    setAuthError(null)
    setInstanceStateNotice(null)

    try {
      if (!forceContinue) {
        // Verify credentials with GREEN-API getStateInstance
        const stateRes = await getStateInstance(creds)
        const state = stateRes?.stateInstance

        if (state !== "authorized") {
          setInstanceStateNotice(
            `Instance status is "${state || "unknown"}". If your instance is not yet authorized in GREEN-API (e.g. requires QR scan), you can still continue.`
          )
          setConnecting(false)
          return false
        }
      }

      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(creds))
      } catch {
        // ignore storage error
      }

      setCredentials(creds)
      return true
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to connect to GREEN-API"
      setAuthError(msg)
      return false
    } finally {
      setConnecting(false)
    }
  }, [])

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
    setCredentials(null)
    setAuthError(null)
    setInstanceStateNotice(null)
  }, [])

  return {
    credentials,
    connecting,
    authError,
    setAuthError,
    instanceStateNotice,
    setInstanceStateNotice,
    login,
    logout,
  }
}
