import type { Chat } from "@/lib/types"
import { Avatar } from "./avatar"
import { BackIcon } from "./icons"
import styles from "./messenger.module.css"

interface ChatHeaderProps {
  chat: Chat
  typing: boolean
  onBack: () => void
}

export function ChatHeader({ chat, typing, onBack }: ChatHeaderProps) {
  return (
    <header className={styles.chatHeader}>
      <button
        type="button"
        className={styles.backButton}
        onClick={onBack}
        aria-label="Back to chats"
      >
        <BackIcon />
      </button>
      <Avatar name={chat.name} color={chat.avatarColor} size={40} />
      <div className={styles.chatHeaderInfo}>
        <h2 className={styles.chatHeaderName}>{chat.name}</h2>
        <p className={styles.chatHeaderStatus}>
          {typing ? (
            <span className={styles.typingDots}>
              typing<span>.</span>
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
