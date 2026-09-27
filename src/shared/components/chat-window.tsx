import type { Chat } from "@/lib/types"
import { ChatHeader } from "./chat-header"
import { MessageList } from "./message-list"
import { MessageInput } from "./message-input"
import { AlertIcon } from "./icons"
import styles from "./messenger.module.css"

interface ChatWindowProps {
  chat: Chat
  typing: boolean
  sendError: string | null
  onSend: (text: string) => void
  onRetry: () => void
  onBack: () => void
}

export function ChatWindow({
  chat,
  typing,
  sendError,
  onSend,
  onRetry,
  onBack,
}: ChatWindowProps) {
  const composerDisabled = chat.state === "loading" || chat.state === "error"

  return (
    <>
      <ChatHeader chat={chat} typing={typing} onBack={onBack} />
      {sendError && (
        <div className={styles.errorBanner} role="alert">
          <AlertIcon width={16} height={16} />
          <span>{sendError}</span>
        </div>
      )}
      <MessageList chat={chat} onRetry={onRetry} />
      <MessageInput disabled={composerDisabled} onSend={onSend} />
    </>
  )
}
