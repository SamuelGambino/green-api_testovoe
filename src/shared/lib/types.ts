export type { Chat, ChatState } from "@/entities/chat/types"
export type { Message, MessageDirection, MessageStatus } from "@/entities/message/types"

export interface Credentials {
  idInstance: string
  apiTokenInstance: string
  recipient?: string
  apiUrl?: string
  instanceType?: "tgInstance" | "waInstance"
}
