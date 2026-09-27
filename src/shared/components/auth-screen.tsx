"use client"

import { useState } from "react"
import type { Credentials } from "@/lib/types"
import { LockIcon } from "./icons"
import styles from "./messenger.module.css"

interface AuthScreenProps {
  onConnect: (credentials: Credentials) => void
}

type Errors = Partial<Record<keyof Credentials, string>>

export function AuthScreen({ onConnect }: AuthScreenProps) {
  const [idInstance, setIdInstance] = useState("")
  const [apiTokenInstance, setApiTokenInstance] = useState("")
  const [recipient, setRecipient] = useState("")
  const [errors, setErrors] = useState<Errors>({})
  const [connecting, setConnecting] = useState(false)

  function validate(): Errors {
    const next: Errors = {}
    if (!idInstance.trim()) next.idInstance = "Enter your idInstance"
    if (!apiTokenInstance.trim())
      next.apiTokenInstance = "Enter your apiTokenInstance"
    if (!recipient.trim()) next.recipient = "Enter a phone number or chat ID"
    return next
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length > 0) return

    // Simulated "connecting" state — no real API call is made here.
    setConnecting(true)
    setTimeout(() => {
      onConnect({
        idInstance: idInstance.trim(),
        apiTokenInstance: apiTokenInstance.trim(),
        recipient: recipient.trim(),
      })
    }, 900)
  }

  return (
    <div className={styles.authScreen}>
      <form className={styles.authCard} onSubmit={handleSubmit} noValidate>
        <div className={styles.authLogo}>
          <LockIcon width={32} height={32} />
        </div>
        <h1 className={styles.authTitle}>Connect to GREEN-API</h1>
        <p className={styles.authSubtitle}>
          Enter your instance credentials and a recipient to start messaging.
        </p>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="idInstance">
            idInstance
          </label>
          <input
            id="idInstance"
            className={`${styles.input} ${errors.idInstance ? styles.inputError : ""}`}
            value={idInstance}
            onChange={(e) => setIdInstance(e.target.value)}
            placeholder="1101000001"
            autoComplete="off"
          />
          {errors.idInstance && (
            <p className={styles.fieldError}>{errors.idInstance}</p>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="apiTokenInstance">
            apiTokenInstance
          </label>
          <input
            id="apiTokenInstance"
            className={`${styles.input} ${errors.apiTokenInstance ? styles.inputError : ""}`}
            value={apiTokenInstance}
            onChange={(e) => setApiTokenInstance(e.target.value)}
            placeholder="d75b3a66374942c5b3c019c698abc2067e151558acbd412345"
            autoComplete="off"
          />
          {errors.apiTokenInstance && (
            <p className={styles.fieldError}>{errors.apiTokenInstance}</p>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="recipient">
            Phone number / chat ID
          </label>
          <input
            id="recipient"
            className={`${styles.input} ${errors.recipient ? styles.inputError : ""}`}
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="+7 900 123-45-67"
            autoComplete="off"
          />
          {errors.recipient && (
            <p className={styles.fieldError}>{errors.recipient}</p>
          )}
        </div>

        <button className={styles.button} type="submit" disabled={connecting}>
          {connecting && <span className={`${styles.spinner} ${styles.spinnerSmall}`} />}
          {connecting ? "Connecting…" : "Open chat"}
        </button>

        <p className={styles.authHint}>
          Credentials are used only in the UI demo and are not sent anywhere.
        </p>
      </form>
    </div>
  )
}
