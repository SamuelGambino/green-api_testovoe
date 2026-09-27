"use client"

import { useState } from "react"
import type { Chat, Credentials, Message } from "@/lib/types"
import { mockChats, mockReplies } from "@/lib/mock-data"
import { AuthScreen } from "./auth-screen"
import { ChatList } from "./chat-list"
import { ChatWindow } from "./chat-window"
import styles from "./messenger.module.css"

let idCounter = 0
const nextId = () => `local-${Date.now()}-${idCounter++}`

export function Messenger() {
  const [credentials, setCredentials] = useState<Credentials | null>(null)
  const [chats, setChats] = useState<Chat[]>(mockChats)
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [typingChatId, setTypingChatId] = useState<string | null>(null)
  const [sendError, setSendError] = useState<string | null>(null)

  const activeChat = chats.find((c) => c.id === activeChatId) ?? null

  function updateChat(chatId: string, updater: (chat: Chat) => Chat) {
    setChats((prev) => prev.map((c) => (c.id === chatId ? updater(c) : c)))
  }

  function updateMessage(chatId: string, messageId: string, patch: Partial<Message>) {
    updateChat(chatId, (chat) => ({
      ...chat,
      messages: chat.messages.map((m) =>
        m.id === messageId ? { ...m, ...patch } : m,
      ),
    }))
  }

  function handleSelect(chatId: string) {
    setActiveChatId(chatId)
    setSendError(null)
  }

  function handleRetry() {
    if (!activeChat) return
    const chatId = activeChat.id
    // Simulate re-fetching the history: error -> loading -> empty.
    updateChat(chatId, (chat) => ({ ...chat, state: "loading" }))
    setTimeout(() => {
      updateChat(chatId, (chat) => ({ ...chat, state: "empty" }))
    }, 1200)
  }

  function handleSend(text: string) {
    if (!activeChat) return
    const chatId = activeChat.id
    setSendError(null)

    const messageId = nextId()
    const outgoing: Message = {
      id: messageId,
      text,
      timestamp: Date.now(),
      direction: "outgoing",
      status: "sending",
    }

    updateChat(chatId, (chat) => ({
      ...chat,
      state: "ready",
      messages: [...chat.messages, outgoing],
    }))

    // Deterministic demo hook: sending "fail" simulates an API send error.
    const willFail = text.trim().toLowerCase() === "fail"

    setTimeout(() => {
      if (willFail) {
        updateMessage(chatId, messageId, { status: "error" })
        setSendError("Message failed to send. Check your connection.")
        return
      }

      updateMessage(chatId, messageId, { status: "sent" })

      // Simulate receiving an incoming reply.
      setTypingChatId(chatId)
      setTimeout(() => {
        setTypingChatId((current) => (current === chatId ? null : current))
        const reply: Message = {
          id: nextId(),
          text: mockReplies[Math.floor(Math.random() * mockReplies.length)],
          timestamp: Date.now(),
          direction: "incoming",
        }
        updateChat(chatId, (chat) => ({
          ...chat,
          messages: [...chat.messages, reply],
        }))
      }, 1600)
    }, 800)
  }

  if (!credentials) {
    return <AuthScreen onConnect={setCredentials} />
  }

  return (
    <div className={styles.app}>
      <aside
        className={`${styles.sidebar} ${activeChat ? styles.sidebarHidden : ""}`}
      >
        <div className={styles.sidebarHeader}>
          <h1 className={styles.sidebarTitle}>Messages</h1>
        </div>
        <ChatList
          chats={chats}
          activeChatId={activeChatId}
          onSelect={handleSelect}
        />
      </aside>

      <main
        className={`${styles.chatArea} ${activeChat ? "" : styles.chatAreaHidden}`}
      >
        {activeChat ? (
          <ChatWindow
            chat={activeChat}
            typing={typingChatId === activeChat.id}
            sendError={sendError}
            onSend={handleSend}
            onRetry={handleRetry}
            onBack={() => {
              setActiveChatId(null)
              setSendError(null)
            }}
          />
        ) : (
          <div className={styles.noChat}>
            <span className={styles.noChatPill}>
              Select a chat to start messaging
            </span>
          </div>
        )}
      </main>
    </div>
  )
}
