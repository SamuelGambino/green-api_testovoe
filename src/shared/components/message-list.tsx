"use client"

import { useEffect, useRef } from "react"
import type { Chat } from "@/lib/types"
import { MessageBubble } from "./message-bubble"
import { AlertIcon, InboxIcon } from "./icons"
import styles from "./messenger.module.css"

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
        <p className={styles.stateText}>Loading messages…</p>
      </div>
    )
  }

  if (chat.state === "error") {
    return (
      <div className={styles.centerState}>
        <AlertIcon width={40} height={40} className={styles.errorIcon} />
        <p className={styles.stateTitle}>Something went wrong</p>
        <p className={styles.stateText}>
          We couldn&apos;t load this conversation. Please try again.
        </p>
        <button type="button" className={styles.retryButton} onClick={onRetry}>
          Retry
        </button>
      </div>
    )
  }

  if (chat.messages.length === 0) {
    return (
      <div className={styles.centerState}>
        <InboxIcon className={styles.stateIcon} />
        <p className={styles.stateTitle}>No messages yet</p>
        <p className={styles.stateText}>
          Send a message below to start the conversation.
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
