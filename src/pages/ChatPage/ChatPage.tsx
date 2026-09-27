import { useState } from "react"
import type { Credentials } from "@/shared/lib/types"
import { ChatHeader, ChatList } from "@/entities/chat"
import { MessageList } from "@/entities/message"
import { NewChatModal, useChat } from "@/features/chat"
import { MessageInput, useMessaging } from "@/features/messaging"
import { AlertIcon, LogoutIcon, PlusIcon } from "@/shared/components/icons"
import styles from "@/shared/components/messenger.module.css"

interface ChatPageProps {
  credentials: Credentials
  onLogout: () => void
}

export function ChatPage({ credentials, onLogout }: ChatPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const {
    chats,
    activeChatId,
    activeChat,
    setActiveChatId,
    updateChat,
    createChat,
    handleIncomingMessage,
    retryHistory,
  } = useChat(credentials)

  const { sendError, setSendError, pollingStatus, sendMessage } = useMessaging({
    credentials,
    activeChat,
    updateChat,
    onIncomingMessage: handleIncomingMessage,
  })

  function handleSelect(chatId: string) {
    setActiveChatId(chatId)
    setSendError(null)
  }

  const isTelegram = credentials.instanceType === "tgInstance"
  const composerDisabled =
    !activeChat || activeChat.state === "loading" || activeChat.state === "error"

  return (
    <div className={styles.app}>
      <aside
        className={`${styles.sidebar} ${activeChat ? styles.sidebarHidden : ""}`}
      >
        <div className={styles.sidebarHeader}>
          <div>
            <h1 className={styles.sidebarTitle}>
              {isTelegram ? "Telegram" : "WhatsApp"}
            </h1>
            <div className={styles.statusIndicator}>
              <span
                className={`${styles.statusDot} ${
                  pollingStatus === "connected"
                    ? styles.statusDotOnline
                    : pollingStatus === "connecting"
                    ? styles.statusDotConnecting
                    : styles.statusDotError
                }`}
              />
              <span>
                {pollingStatus === "connected"
                  ? "В сети (HTTP API)"
                  : pollingStatus === "error"
                  ? "Повтор подключения…"
                  : "Подключение…"}
              </span>
            </div>
          </div>

          <div className={styles.sidebarActions}>
            <button
              type="button"
              className={styles.iconButton}
              onClick={() => setIsModalOpen(true)}
              title="Новый чат"
              aria-label="Новый чат"
            >
              <PlusIcon />
            </button>
            <button
              type="button"
              className={styles.iconButton}
              onClick={onLogout}
              title="Сменить инстанс / Выход"
              aria-label="Сменить инстанс / Выход"
            >
              <LogoutIcon />
            </button>
          </div>
        </div>

        <ChatList
          chats={chats}
          activeChatId={activeChatId}
          onSelect={handleSelect}
          onNewChat={() => setIsModalOpen(true)}
        />
      </aside>

      <main
        className={`${styles.chatArea} ${activeChat ? "" : styles.chatAreaHidden}`}
      >
        {activeChat ? (
          <>
            <ChatHeader
              chat={activeChat}
              onBack={() => {
                setActiveChatId(null)
                setSendError(null)
              }}
            />
            {sendError && (
              <div className={styles.errorBanner} role="alert">
                <AlertIcon width={16} height={16} />
                <span>{sendError}</span>
              </div>
            )}
            <MessageList
              chat={activeChat}
              onRetry={() => retryHistory(activeChat.id)}
            />
            <MessageInput
              disabled={composerDisabled}
              onSend={sendMessage}
            />
          </>
        ) : (
          <div className={styles.noChat}>
            <span className={styles.noChatPill}>
              Выберите или создайте чат для начала переписки
            </span>
          </div>
        )}
      </main>

      <NewChatModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateChat={createChat}
        instanceType={credentials.instanceType}
      />
    </div>
  )
}
