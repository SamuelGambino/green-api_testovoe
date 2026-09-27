import type { Chat } from "./types"
import { formatTime } from "@/shared/lib/format"
import { Avatar } from "@/shared/components/avatar"
import styles from "@/shared/components/messenger.module.css"

interface ChatListItemProps {
  chat: Chat
  isActive: boolean
  onSelect: (chatId: string) => void
}

function previewFor(chat: Chat): string {
  switch (chat.state) {
    case "loading":
      return "Loading messages…"
    case "error":
      return "Couldn't load messages"
    case "empty":
      return "No messages yet"
    default: {
      const last = chat.messages[chat.messages.length - 1]
      if (!last) return "No messages yet"
      return (last.direction === "outgoing" ? "You: " : "") + last.text
    }
  }
}

export function ChatListItem({ chat, isActive, onSelect }: ChatListItemProps) {
  const last = chat.messages[chat.messages.length - 1]

  return (
    <li>
      <button
        type="button"
        className={`${styles.chatItem} ${isActive ? styles.chatItemActive : ""}`}
        onClick={() => onSelect(chat.id)}
        aria-current={isActive ? "true" : undefined}
      >
        <Avatar name={chat.name} color={chat.avatarColor} />
        <div className={styles.chatItemBody}>
          <div className={styles.chatItemTop}>
            <span className={styles.chatName}>{chat.name}</span>
            {last && (
              <span className={styles.chatTime}>
                {formatTime(last.timestamp)}
              </span>
            )}
          </div>
          <div className={styles.chatPreview}>{previewFor(chat)}</div>
        </div>
      </button>
    </li>
  )
}
