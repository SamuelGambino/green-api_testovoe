import { useState } from "react"
import type { Credentials } from "@/shared/lib/types"
import { getStateInstance, sendAuthorizationPassword } from "@/api/greenApi"
import { LockIcon } from "@/shared/components/icons"
import styles from "@/shared/components/messenger.module.css"

interface PasswordViewProps {
  credentials: Credentials
  onAuthorized: () => void
  onBackToQr: () => void
}

export function PasswordView({
  credentials,
  onAuthorized,
  onBackToQr,
}: PasswordViewProps) {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = password.trim()
    if (!trimmed) {
      setError("Пожалуйста, введите пароль двухэтапной аутентификации")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Send 2FA password to GREEN-API
      const res = await sendAuthorizationPassword(credentials, trimmed)

      if (res && res.error) {
        throw new Error(res.error || res.message || "Неверный пароль")
      }

      // Check instance state
      const stateRes = await getStateInstance(credentials)
      if (stateRes?.stateInstance === "authorized") {
        onAuthorized()
        return
      }

      // If still pendingPassword or another state, wait a moment and re-check
      await new Promise((resolve) => setTimeout(resolve, 1500))
      const retryState = await getStateInstance(credentials)
      if (retryState?.stateInstance === "authorized") {
        onAuthorized()
        return
      }

      if (retryState?.stateInstance === "pendingPassword") {
        setError("Неверный пароль двухэтапной аутентификации Telegram. Проверьте правильность и повторите.")
      } else {
        // Successful state
        onAuthorized()
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ошибка при отправке пароля"
      setError(
        msg.includes("400") || msg.includes("password")
          ? "Неверный пароль двухэтапной аутентификации Telegram. Попробуйте еще раз."
          : msg
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className={styles.authCard} onSubmit={handleSubmit} noValidate>
      <div className={styles.authLogo}>
        <LockIcon width={32} height={32} />
      </div>

      <h1 className={styles.authTitle}>Двухэтапная аутентификация</h1>
      <p className={styles.authSubtitle}>
        QR-код отсканирован. На вашем аккаунте Telegram включен облачный пароль (2FA). Введите его для завершения авторизации.
      </p>

      {error && (
        <div className={styles.authErrorBanner} role="alert">
          {error}
        </div>
      )}

      <div className={styles.field}>
        <label className={styles.label} htmlFor="cloudPassword">
          Облачный пароль Telegram *
        </label>
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <input
            id="cloudPassword"
            type={showPassword ? "text" : "password"}
            className={styles.input}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError(null)
            }}
            placeholder="Введите пароль 2FA"
            autoFocus
            autoComplete="current-password"
            style={{ paddingRight: "44px" }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            style={{
              position: "absolute",
              right: "12px",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "16px",
              padding: "4px",
              color: "#8a8f98",
            }}
            title={showPassword ? "Скрыть пароль" : "Показать пароль"}
            aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>
        <p style={{ margin: "6px 0 0", fontSize: "11px", color: "#8a8f98", lineHeight: 1.4 }}>
          Этот пароль был установлен вами в Telegram: Настройки → Конфиденциальность → Облачный пароль.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
        <button className={styles.button} type="submit" disabled={loading || !password.trim()}>
          {loading && <span className={`${styles.spinner} ${styles.spinnerSmall}`} />}
          {loading ? "Проверка пароля…" : "Подтвердить пароль"}
        </button>

        <button
          type="button"
          onClick={onBackToQr}
          style={{
            background: "none",
            border: "1px solid #e6e7eb",
            borderRadius: "10px",
            color: "#4a4f57",
            height: "40px",
            fontSize: "13px",
            cursor: "pointer",
            fontWeight: 500,
            transition: "all 0.15s ease",
          }}
        >
          ← Назад к QR-коду
        </button>
      </div>
    </form>
  )
}
