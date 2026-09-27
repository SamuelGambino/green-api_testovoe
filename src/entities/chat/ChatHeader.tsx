import type { Chat } from "./types"
import { Avatar } from "@/shared/components/avatar"
import { BackIcon } from "@/shared/components/icons"
import styles from "@/shared/components/messenger.module.css"

interface ChatHeaderProps {
  chat: Chat
  typing?: boolean
  onBack: () => void
}

export function ChatHeader({ chat, typing = false, onBack }: ChatHeaderProps) {
  return (
    <header className={styles.chatHeader}>
      <button
        type="button"
        className={styles.backButton}
        onClick={onBack}
        aria-label="Назад к списку чатов"
        title="Назад к списку чатов"
      >
        <BackIcon />
      </button>
      <Avatar name={chat.name} color={chat.avatarColor} size={40} />
      <div className={styles.chatHeaderInfo}>
        <h2 className={styles.chatHeaderName}>{chat.name}</h2>
        <p className={styles.chatHeaderStatus}>
          {typing ? (
            <span className={styles.typingDots}>
              печатает<span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          ) : (
            chat.recipient
          )}
        </p>
      </div>
    </header>
  )
}
