import type { Message } from "@/entities/message/types"
export type { Message }

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
