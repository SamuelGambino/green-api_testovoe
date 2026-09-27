import { useState } from "react"
import type { Credentials } from "@/shared/lib/types"
import { LockIcon } from "@/shared/components/icons"
import styles from "@/shared/components/messenger.module.css"

interface AuthFormProps {
  initialCreds?: Partial<Credentials> | null
  onSubmit: (creds: Credentials, forceContinue?: boolean) => Promise<boolean | void>
  connecting: boolean
  error: string | null
  notice: string | null
}

type Errors = Partial<Record<keyof Credentials, string>>

export function AuthForm({
  initialCreds,
  onSubmit,
  connecting,
  error,
  notice,
}: AuthFormProps) {
  const [instanceType, setInstanceType] = useState<"tgInstance" | "waInstance">(
    initialCreds?.instanceType || "tgInstance"
  )
  const [idInstance, setIdInstance] = useState(initialCreds?.idInstance || "")
  const [apiTokenInstance, setApiTokenInstance] = useState(initialCreds?.apiTokenInstance || "")
  const [recipient, setRecipient] = useState(initialCreds?.recipient || "")
  const [apiUrl, setApiUrl] = useState(initialCreds?.apiUrl || "https://api.green-api.com")
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Errors>({})

  function validate(): Errors {
    const next: Errors = {}
    if (!idInstance.trim()) next.idInstance = "Введите idInstance"
    if (!apiTokenInstance.trim()) next.apiTokenInstance = "Введите apiTokenInstance"
    return next
  }

  async function handleSubmit(e: React.FormEvent, forceContinue = false) {
    e.preventDefault()
    const found = validate()
    setFieldErrors(found)
    if (Object.keys(found).length > 0) return

    const creds: Credentials = {
      idInstance: idInstance.trim(),
      apiTokenInstance: apiTokenInstance.trim(),
      recipient: recipient.trim() || undefined,
      apiUrl: apiUrl.trim() || "https://api.green-api.com",
      instanceType,
    }

    await onSubmit(creds, forceContinue)
  }

  return (
    <form className={styles.authCard} onSubmit={(e) => handleSubmit(e, false)} noValidate>
      <div className={styles.authLogo}>
        <LockIcon width={32} height={32} />
      </div>
      <h1 className={styles.authTitle}>GREEN-API Мессенджер</h1>
      <p className={styles.authSubtitle}>
        Введите учетные данные инстанса GREEN-API для отправки и получения сообщений.
      </p>

      {/* Выбор типа инстанса */}
      <div className={styles.typeSelector} role="radiogroup" aria-label="Тип инстанса">
        <button
          type="button"
          className={`${styles.typeBtn} ${instanceType === "tgInstance" ? styles.typeBtnActive : ""}`}
          onClick={() => setInstanceType("tgInstance")}
        >
          <span>✈️</span> Telegram
        </button>
        <button
          type="button"
          className={`${styles.typeBtn} ${instanceType === "waInstance" ? styles.typeBtnActive : ""}`}
          onClick={() => setInstanceType("waInstance")}
        >
          <span>💬</span> WhatsApp
        </button>
      </div>

      {error && (
        <div className={styles.authErrorBanner} role="alert">
          {error}
        </div>
      )}

      {notice && (
        <div className={styles.authNoticeBanner}>
          <p style={{ margin: "0 0 10px 0" }}>{notice}</p>
          <button
            type="button"
            className={styles.button}
            style={{ height: "36px", fontSize: "13px" }}
            onClick={(e) => handleSubmit(e, true)}
          >
            Продолжить в любом случае
          </button>
        </div>
      )}

      <div className={styles.field}>
        <label className={styles.label} htmlFor="idInstance">
          idInstance *
        </label>
        <input
          id="idInstance"
          className={`${styles.input} ${fieldErrors.idInstance ? styles.inputError : ""}`}
          value={idInstance}
          onChange={(e) => setIdInstance(e.target.value)}
          placeholder="например, 1101823456"
          autoComplete="off"
        />
        {fieldErrors.idInstance && (
          <p className={styles.fieldError}>{fieldErrors.idInstance}</p>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="apiTokenInstance">
          apiTokenInstance *
        </label>
        <input
          id="apiTokenInstance"
          type="password"
          className={`${styles.input} ${fieldErrors.apiTokenInstance ? styles.inputError : ""}`}
          value={apiTokenInstance}
          onChange={(e) => setApiTokenInstance(e.target.value)}
          placeholder="например, d75b3a66374942c5b3c019c698abc206..."
          autoComplete="off"
        />
        {fieldErrors.apiTokenInstance && (
          <p className={styles.fieldError}>{fieldErrors.apiTokenInstance}</p>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="recipient">
          Номер получателя или Chat ID (необязательно)
        </label>
        <input
          id="recipient"
          className={styles.input}
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="например, 79991234567 или 79991234567@c.us"
          autoComplete="off"
        />
        <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#8a8f98" }}>
          Вы также сможете добавить или создать диалог после подключения.
        </p>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <button
          type="button"
          style={{
            background: "none",
            border: "none",
            color: "#3390ec",
            fontSize: "12px",
            cursor: "pointer",
            padding: 0,
            textDecoration: "underline",
          }}
          onClick={() => setShowAdvanced((prev) => !prev)}
        >
          {showAdvanced ? "▲ Скрыть дополнительные настройки" : "▼ Дополнительные настройки (Хост API URL)"}
        </button>

        {showAdvanced && (
          <div style={{ marginTop: "10px" }} className={styles.field}>
            <label className={styles.label} htmlFor="apiUrl">
              Хост URL GREEN-API
            </label>
            <input
              id="apiUrl"
              className={styles.input}
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://api.green-api.com"
            />
            <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#8a8f98" }}>
              По умолчанию https://api.green-api.com (или хост вашего инстанса, например https://7103.api.greenapi.com)
            </p>
          </div>
        )}
      </div>

      <button className={styles.button} type="submit" disabled={connecting}>
        {connecting && <span className={`${styles.spinner} ${styles.spinnerSmall}`} />}
        {connecting ? "Проверка подключения…" : "Подключиться к GREEN-API"}
      </button>

      <p className={styles.authHint}>
        Учетные данные отправляются напрямую в методы GREEN-API для отправки и получения сообщений.
      </p>
    </form>
  )
}
