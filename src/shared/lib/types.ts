export type MessageDirection = "incoming" | "outgoing"

export type MessageStatus = "sending" | "sent" | "error"

export interface Message {
  id: string
  text: string
  timestamp: number
  direction: MessageDirection
  status?: MessageStatus
}

/**
 * Simulated loading state of a chat's message history.
 * Used only to demonstrate UI states — there is no real API here.
 */
export type ChatState = "ready" | "loading" | "error" | "empty"

export interface Chat {
  id: string
  name: string
  /** Phone number or chat ID of the recipient. */
  recipient: string
  /** Fallback avatar color when there is no image. */
  avatarColor: string
  state: ChatState
  messages: Message[]
}

export interface Credentials {
  idInstance: string
  apiTokenInstance: string
  recipient: string
}
