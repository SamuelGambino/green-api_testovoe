import { useState } from "react"
import { formatChatId } from "@/api/greenApi"
import styles from "@/shared/components/messenger.module.css"

interface NewChatModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateChat: (chatId: string, name?: string) => void
  instanceType?: "tgInstance" | "waInstance"
}

export function NewChatModal({
  isOpen,
  onClose,
  onCreateChat,
  instanceType = "tgInstance",
}: NewChatModalProps) {
  const [recipient, setRecipient] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")

  if (!isOpen) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = recipient.trim()
    if (!trimmed) {
      setError("Пожалуйста, укажите номер телефона или Chat ID")
      return
    }

    const formatted = formatChatId(trimmed)
    onCreateChat(formatted, name.trim() || undefined)
    setRecipient("")
    setName("")
    setError("")
    onClose()
  }

  const isTelegram = instanceType === "tgInstance"

  return (
    <div className={styles.modalOverlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            Новый чат в {isTelegram ? "Telegram" : "WhatsApp"}
          </h2>
          <button
            type="button"
            className={styles.modalClose}
            onClick={onClose}
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="modalRecipient">
              Номер телефона или Chat ID *
            </label>
            <input
              id="modalRecipient"
              className={`${styles.input} ${error ? styles.inputError : ""}`}
              value={recipient}
              onChange={(e) => {
                setRecipient(e.target.value)
                setError("")
              }}
              placeholder={
                isTelegram
                  ? "+7 999 123-45-67 или 123456789@c.us"
                  : "+7 999 123-45-67 или 79991234567"
              }
              autoFocus
              autoComplete="off"
            />
            {error && <p className={styles.fieldError}>{error}</p>}
            <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#8a8f98" }}>
              Введите номер телефона с кодом страны (например, 79991234567).
            </p>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="modalName">
              Имя контакта (необязательно)
            </label>
            <input
              id="modalName"
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="например, Мария, Клиент #42"
              autoComplete="off"
            />
          </div>

          <div className={styles.modalButtons}>
            <button
              type="button"
              className={styles.modalCancelBtn}
              onClick={onClose}
            >
              Отмена
            </button>
            <button
              type="submit"
              className={styles.modalSubmitBtn}
              disabled={!recipient.trim()}
            >
              Создать чат
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
