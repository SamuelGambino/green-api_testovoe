import type { Chat } from "./types"
import { ChatListItem } from "./ChatListItem"
import { PlusIcon } from "@/shared/components/icons"
import styles from "@/shared/components/messenger.module.css"

interface ChatListProps {
  chats: Chat[]
  activeChatId: string | null
  onSelect: (chatId: string) => void
  onNewChat: () => void
}

export function ChatList({
  chats,
  activeChatId,
  onSelect,
  onNewChat,
}: ChatListProps) {
  if (chats.length === 0) {
    return (
      <div className={styles.emptyChatsNotice}>
        <p>No chats yet</p>
        <button
          type="button"
          className={styles.newChatNoticeBtn}
          onClick={onNewChat}
        >
          <PlusIcon />
          <span>Start a new chat</span>
        </button>
      </div>
    )
  }

  return (
    <ul className={styles.chatList} aria-label="Chats">
      {chats.map((chat) => (
        <ChatListItem
          key={chat.id}
          chat={chat}
          isActive={chat.id === activeChatId}
          onSelect={onSelect}
        />
      ))}
    </ul>
  )
}
