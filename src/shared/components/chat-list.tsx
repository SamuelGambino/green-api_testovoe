import type { Chat } from "@/lib/types"
import { formatTime } from "@/lib/format"
import { Avatar } from "./avatar"
import styles from "./messenger.module.css"

interface ChatListProps {
  chats: Chat[]
  activeChatId: string | null
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

export function ChatList({ chats, activeChatId, onSelect }: ChatListProps) {
  return (
    <ul className={styles.chatList} aria-label="Chats">
      {chats.map((chat) => {
        const last = chat.messages[chat.messages.length - 1]
        const isActive = chat.id === activeChatId
        return (
          <li key={chat.id}>
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
      })}
    </ul>
  )
}
