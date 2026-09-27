import { useEffect, useRef } from "react"
import type { Chat } from "@/entities/chat/types"
import { MessageBubble } from "./MessageBubble"
import { AlertIcon, InboxIcon } from "@/shared/components/icons"
import styles from "@/shared/components/messenger.module.css"

interface MessageListProps {
  chat: Chat
  onRetry: () => void
}

export function MessageList({ chat, onRetry }: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chat.messages.length, chat.id])

  if (chat.state === "loading") {
    return (
      <div className={styles.centerState}>
        <span className={styles.spinner} />
        <p className={styles.stateText}>Загрузка сообщений…</p>
      </div>
    )
  }

  if (chat.state === "error") {
    return (
      <div className={styles.centerState}>
        <AlertIcon width={40} height={40} className={styles.errorIcon} />
        <p className={styles.stateTitle}>Не удалось загрузить сообщения</p>
        <p className={styles.stateText}>
          Произошла ошибка при загрузке переписки. Пожалуйста, попробуйте снова.
        </p>
        <button type="button" className={styles.retryButton} onClick={onRetry}>
          Повторить
        </button>
      </div>
    )
  }

  if (chat.messages.length === 0) {
    return (
      <div className={styles.centerState}>
        <InboxIcon className={styles.stateIcon} />
        <p className={styles.stateTitle}>Нет сообщений</p>
        <p className={styles.stateText}>
          Отправьте первое сообщение ниже, чтобы начать диалог.
        </p>
      </div>
    )
  }

  return (
    <div className={styles.messages}>
      {chat.messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      <div ref={endRef} />
    </div>
  )
}
