export type MessageDirection = "incoming" | "outgoing"

export type MessageStatus = "sending" | "sent" | "error"

export interface Message {
  id: string
  text: string
  timestamp: number
  direction: MessageDirection
  status?: MessageStatus
}
