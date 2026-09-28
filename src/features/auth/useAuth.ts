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

export type AuthStage = "form" | "qr" | "password"

export function useAuth() {
  const [credentials, setCredentials] = useState<Credentials | null>(() => getStoredCredentials())
  const [pendingCredentials, setPendingCredentials] = useState<Credentials | null>(null)
  const [authStage, setAuthStage] = useState<AuthStage>("form")
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

        if (state === "notAuthorized") {
          // Instance needs QR authorization
          setPendingCredentials(creds)
          setAuthStage("qr")
          setConnecting(false)
          return false
        }

        if (state === "pendingPassword") {
          // Instance needs 2FA Cloud Password
          setPendingCredentials(creds)
          setAuthStage("password")
          setConnecting(false)
          return false
        }

        if (state === "sleepMode") {
          setInstanceStateNotice(
            "Инстанс находится в спящем режиме. Убедитесь, что телефон включен и подключен к сети."
          )
        } else if (state === "blocked") {
          setAuthError("Инстанс заблокирован в сервисе GREEN-API.")
          setConnecting(false)
          return false
        } else if (state !== "authorized") {
          setInstanceStateNotice(
            `Статус инстанса: "${state || "неизвестно"}". Если требуется сканирование QR-кода, вы можете перейти к авторизации.`
          )
        }
      }

      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(creds))
      } catch {
        // ignore storage error
      }

      setCredentials(creds)
      setPendingCredentials(null)
      setAuthStage("form")
      return true
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Не удалось подключиться к GREEN-API"
      setAuthError(msg)
      return false
    } finally {
      setConnecting(false)
    }
  }, [])

  const confirmAuthorized = useCallback(() => {
    if (pendingCredentials) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(pendingCredentials))
      } catch {
        // ignore
      }
      setCredentials(pendingCredentials)
      setPendingCredentials(null)
      setAuthStage("form")
      setAuthError(null)
    }
  }, [pendingCredentials])

  const goToPassword = useCallback(() => {
    setAuthStage("password")
    setAuthError(null)
  }, [])

  const backToQr = useCallback(() => {
    setAuthStage("qr")
    setAuthError(null)
  }, [])

  const backToEdit = useCallback(() => {
    setAuthStage("form")
    setAuthError(null)
    setInstanceStateNotice(null)
  }, [])

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
    setCredentials(null)
    setPendingCredentials(null)
    setAuthStage("form")
    setAuthError(null)
    setInstanceStateNotice(null)
  }, [])

  return {
    credentials,
    pendingCredentials,
    authStage,
    isQrMode: authStage === "qr",
    isPasswordMode: authStage === "password",
    connecting,
    authError,
    setAuthError,
    instanceStateNotice,
    setInstanceStateNotice,
    login,
    confirmAuthorized,
    confirmQrAuthorized: confirmAuthorized,
    goToPassword,
    backToQr,
    backToEdit,
    logout,
  }
}
