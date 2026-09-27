import type { Message } from "./types"
import { formatTime } from "@/shared/lib/format"
import { DoubleCheckIcon } from "@/shared/components/icons"
import styles from "@/shared/components/messenger.module.css"

interface MessageBubbleProps {
  message: Message
}

function StatusTick({ status }: { status?: Message["status"] }) {
  if (status === "sending") {
    return (
      <span
        className={`${styles.spinner} ${styles.spinnerSmall} ${styles.tickSending}`}
        aria-label="Sending"
      />
    )
  }
  if (status === "error") {
    return <span className={styles.metaError}>failed</span>
  }
  if (status === "sent") {
    return (
      <span className={styles.tick} aria-label="Sent">
        <DoubleCheckIcon />
      </span>
    )
  }
  return null
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isOutgoing = message.direction === "outgoing"
  return (
    <div
      className={`${styles.messageRow} ${
        isOutgoing ? styles.messageRowOutgoing : styles.messageRowIncoming
      }`}
    >
      <div
        className={`${styles.bubble} ${
          isOutgoing ? styles.bubbleOutgoing : styles.bubbleIncoming
        }`}
      >
        <p className={styles.bubbleText}>{message.text}</p>
        <div className={styles.bubbleMeta}>
          <span>{formatTime(message.timestamp)}</span>
          {isOutgoing && <StatusTick status={message.status} />}
        </div>
      </div>
    </div>
  )
}
