import { useCallback, useEffect, useState } from "react"
import type { Credentials } from "@/shared/lib/types"
import type { Chat, Message } from "@/entities/chat/types"
import { formatChatId, getChatHistory, isSameChatId } from "@/api/greenApi"

const STORAGE_CHATS_PREFIX = "green_api_chats_"

const AVATAR_COLORS = [
  "#3390ec",
  "#e8618c",
  "#5b8def",
  "#4bb34b",
  "#9b59b6",
  "#f39c12",
  "#16a085",
  "#d35400",
]

function getRandomColor(seed = ""): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length
  return AVATAR_COLORS[index]
}

export function useChat(credentials: Credentials | null) {
  const [chats, setChats] = useState<Chat[]>(() => {
    if (!credentials) return []
    const storageKey = `${STORAGE_CHATS_PREFIX}${credentials.idInstance}`
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch {
      // ignore
    }
    if (credentials.recipient) {
      const formatted = formatChatId(credentials.recipient)
      return [
        {
          id: `chat-${formatted}`,
          name: credentials.recipient,
          recipient: formatted,
          avatarColor: getRandomColor(formatted),
          state: "ready",
          messages: [],
        },
      ]
    }
    return []
  })

  const [activeChatId, setActiveChatId] = useState<string | null>(() => {
    if (!credentials) return null
    const storageKey = `${STORAGE_CHATS_PREFIX}${credentials.idInstance}`
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const loaded: Chat[] = JSON.parse(saved)
        return loaded[0]?.id || null
      }
    } catch {
      // ignore
    }
    if (credentials.recipient) {
      const formatted = formatChatId(credentials.recipient)
      return `chat-${formatted}`
    }
    return null
  })

  // Persist chats to localStorage
  useEffect(() => {
    if (!credentials) return
    const storageKey = `${STORAGE_CHATS_PREFIX}${credentials.idInstance}`
    try {
      localStorage.setItem(storageKey, JSON.stringify(chats))
    } catch {
      // ignore
    }
  }, [chats, credentials])

  const updateChat = useCallback((chatId: string, updater: (chat: Chat) => Chat) => {
    setChats((prev) => prev.map((c) => (c.id === chatId ? updater(c) : c)))
  }, [])

  const createChat = useCallback(
    async (formattedRecipient: string, contactName?: string) => {
      if (!credentials) return
      const existing = chats.find(
        (c) =>
          isSameChatId(c.recipient, formattedRecipient) ||
          c.id === `chat-${formattedRecipient}`
      )

      if (existing) {
        setActiveChatId(existing.id)
        return
      }

      const displayName = contactName || formattedRecipient.replace(/@c\.us$/, "")
      const newChat: Chat = {
        id: `chat-${formattedRecipient}`,
        name: displayName,
        recipient: formattedRecipient,
        avatarColor: getRandomColor(formattedRecipient),
        state: "loading",
        messages: [],
      }

      setChats((prev) => [newChat, ...prev])
      setActiveChatId(newChat.id)

      // Fetch message history for this chat
      try {
        const history = await getChatHistory(credentials, formattedRecipient, 50)
        const mapped: Message[] = history
          .filter((h) => h.textMessage)
          .map((h) => ({
            id: h.idMessage || `hist-${Date.now()}-${Math.random()}`,
            text: h.textMessage || "",
            timestamp: h.timestamp ? h.timestamp * 1000 : Date.now(),
            direction: h.type === "outgoing" ? ("outgoing" as const) : ("incoming" as const),
            status: h.type === "outgoing" ? ("sent" as const) : undefined,
          }))
          .sort((a, b) => a.timestamp - b.timestamp)

        updateChat(newChat.id, (c) => ({
          ...c,
          state: mapped.length === 0 ? "empty" : "ready",
          messages: mapped,
        }))
      } catch {
        updateChat(newChat.id, (c) => ({
          ...c,
          state: "ready",
        }))
      }
    },
    [chats, credentials, updateChat]
  )

  const handleIncomingMessage = useCallback(
    (incomingChatId: string, senderDisplayName: string, incomingMsg: Message) => {
      setChats((prev) => {
        const matchIndex = prev.findIndex(
          (c) =>
            isSameChatId(c.recipient, incomingChatId) ||
            c.id === `chat-${incomingChatId}`
        )

        if (matchIndex !== -1) {
          const target = prev[matchIndex]
          if (target.messages.some((m) => m.id === incomingMsg.id)) {
            return prev
          }
          const updated: Chat = {
            ...target,
            state: "ready",
            messages: [...target.messages, incomingMsg],
          }
          return [updated, ...prev.filter((_, i) => i !== matchIndex)]
        }

        const brandNewChat: Chat = {
          id: `chat-${incomingChatId}`,
          name: senderDisplayName,
          recipient: incomingChatId,
          avatarColor: getRandomColor(incomingChatId),
          state: "ready",
          messages: [incomingMsg],
        }
        return [brandNewChat, ...prev]
      })
    },
    []
  )

  const retryHistory = useCallback(
    async (chatId: string) => {
      if (!credentials) return
      const targetChat = chats.find((c) => c.id === chatId)
      if (!targetChat) return

      updateChat(chatId, (chat) => ({ ...chat, state: "loading" }))

      try {
        const history = await getChatHistory(credentials, targetChat.recipient, 50)
        const mapped: Message[] = history
          .filter((h) => h.textMessage)
          .map((h) => ({
            id: h.idMessage || `hist-${Date.now()}-${Math.random()}`,
            text: h.textMessage || "",
            timestamp: h.timestamp ? h.timestamp * 1000 : Date.now(),
            direction: h.type === "outgoing" ? ("outgoing" as const) : ("incoming" as const),
            status: h.type === "outgoing" ? ("sent" as const) : undefined,
          }))
          .sort((a, b) => a.timestamp - b.timestamp)

        updateChat(chatId, (chat) => ({
          ...chat,
          state: mapped.length === 0 ? "empty" : "ready",
          messages: mapped,
        }))
      } catch {
        updateChat(chatId, (chat) => ({ ...chat, state: "ready" }))
      }
    },
    [chats, credentials, updateChat]
  )

  const activeChat = chats.find((c) => c.id === activeChatId) ?? null

  return {
    chats,
    activeChatId,
    activeChat,
    setActiveChatId,
    updateChat,
    createChat,
    handleIncomingMessage,
    retryHistory,
  }
}
