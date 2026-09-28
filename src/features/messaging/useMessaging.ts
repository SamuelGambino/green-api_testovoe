import { useCallback, useEffect, useRef, useState } from "react"
import type { Credentials } from "@/shared/lib/types"
import type { Chat, Message } from "@/entities/chat/types"
import {
  deleteNotification,
  extractMessageText,
  getSettings,
  receiveNotification,
  sendMessage as sendGreenApiMessage,
  setSettings,
} from "@/api/greenApi"

interface UseMessagingProps {
  credentials: Credentials | null
  activeChat: Chat | null
  updateChat: (chatId: string, updater: (chat: Chat) => Chat) => void
  onIncomingMessage: (chatId: string, senderName: string, message: Message) => void
}

export function useMessaging({
  credentials,
  activeChat,
  updateChat,
  onIncomingMessage,
}: UseMessagingProps) {
  const [sendError, setSendError] = useState<string | null>(null)
  const [pollingStatus, setPollingStatus] = useState<"connected" | "connecting" | "error">(
    "connected"
  )
  const [webhookConfigNotice, setWebhookConfigNotice] = useState<string | null>(null)
  const [isConfiguringWebhooks, setIsConfiguringWebhooks] = useState(false)

  // Configure instance settings for HTTP API receiveNotification
  const syncWebhooks = useCallback(async () => {
    if (!credentials) return
    setIsConfiguringWebhooks(true)
    try {
      const settings = await getSettings(credentials)

      const needsUpdate =
        settings.incomingWebhook !== "yes" ||
        (settings.webhookUrl && settings.webhookUrl.trim() !== "")

      if (needsUpdate) {
        setWebhookConfigNotice("Настройка инстанса для приема входящих сообщений…")
        await setSettings(credentials, {
          incomingWebhook: "yes",
          webhookUrl: "", // Must be empty for HTTP API receiveNotification
          outgoingMessageWebhook: "yes",
          stateInstanceWebhook: "yes",
        })
        setWebhookConfigNotice("Входящие сообщения успешно включены (incomingWebhook: yes, webhookUrl: очищен).")
      } else {
        setWebhookConfigNotice(null)
      }
    } catch (err) {
      console.warn("Не удалось проверить/обновить настройки вебхуков:", err)
      setWebhookConfigNotice(
        "Не удалось автоматически проверить настройки вебхуков инстанса. Проверьте в консоли GREEN-API, что incomingWebhook включен."
      )
    } finally {
      setIsConfiguringWebhooks(false)
    }
  }, [credentials])

  // Run webhook configuration once on connect
  useEffect(() => {
    if (!credentials) return
    let cancelled = false
    const timer = setTimeout(() => {
      if (!cancelled) {
        syncWebhooks()
      }
    }, 0)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [credentials, syncWebhooks])

  // Send message
  async function sendMessage(text: string) {
    if (!activeChat || !credentials) return
    const chatId = activeChat.id
    const targetRecipient = activeChat.recipient
    setSendError(null)

    const tempMessageId = `temp-${Date.now()}`
    const outgoing: Message = {
      id: tempMessageId,
      text,
      timestamp: Date.now(),
      direction: "outgoing",
      status: "sending",
    }

    // Add optimistic message
    updateChat(chatId, (chat) => ({
      ...chat,
      state: "ready",
      messages: [...chat.messages, outgoing],
    }))

    try {
      const response = await sendGreenApiMessage(credentials, targetRecipient, text)
      updateChat(chatId, (chat) => ({
        ...chat,
        messages: chat.messages.map((m) =>
          m.id === tempMessageId
            ? { ...m, id: response.idMessage || m.id, status: "sent" }
            : m
        ),
      }))
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Не удалось отправить сообщение через GREEN-API"
      setSendError(errorMsg)
      updateChat(chatId, (chat) => ({
        ...chat,
        messages: chat.messages.map((m) =>
          m.id === tempMessageId ? { ...m, status: "error" } : m
        ),
      }))
    }
  }

  // Polling loop for ReceiveNotification + DeleteNotification (technology-http-api)
  const isPollingRef = useRef(false)
  useEffect(() => {
    if (!credentials) return

    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | null = null

    async function pollNotifications() {
      if (cancelled || !credentials) return

      try {
        const notification = await receiveNotification(credentials)
        if (cancelled) return

        setPollingStatus("connected")

        if (notification && notification.receiptId) {
          const { receiptId, body } = notification

          // Handle incoming message or phone-sent message
          if (
            body?.typeWebhook === "incomingMessageReceived" ||
            body?.typeWebhook === "outgoingMessageReceived"
          ) {
            const senderData = body.senderData
            const text = extractMessageText(body.messageData)

            const rawBody = body as unknown as { chatId?: string }
            const incomingChatId =
              senderData?.chatId ||
              rawBody.chatId ||
              senderData?.sender ||
              ""

            if (text && incomingChatId) {
              const senderDisplayName =
                senderData?.chatName ||
                senderData?.senderName ||
                senderData?.senderContactName ||
                incomingChatId.replace(/@(c|g)\.us$/, "")

              const isOutgoing = body.typeWebhook === "outgoingMessageReceived"

              const parsedMsg: Message = {
                id: body.idMessage || `msg-${Date.now()}-${Math.random()}`,
                text,
                timestamp: body.timestamp ? body.timestamp * 1000 : Date.now(),
                direction: isOutgoing ? "outgoing" : "incoming",
                status: isOutgoing ? "sent" : undefined,
              }

              onIncomingMessage(incomingChatId, senderDisplayName, parsedMsg)
            }
          }

          // Acknowledge and delete notification from queue
          try {
            await deleteNotification(credentials, receiptId)
          } catch (delErr) {
            console.warn("Ошибка при удалении уведомления:", delErr)
          }

          // Immediately poll again to drain pending notifications
          if (!cancelled) {
            timer = setTimeout(pollNotifications, 100)
          }
          return
        }

        // Empty queue, wait 1.5 seconds
        if (!cancelled) {
          timer = setTimeout(pollNotifications, 1500)
        }
      } catch (err) {
        console.warn("Ошибка получения уведомления GREEN-API:", err)
        setPollingStatus("error")
        if (!cancelled) {
          timer = setTimeout(pollNotifications, 4000)
        }
      }
    }

    if (!isPollingRef.current) {
      isPollingRef.current = true
      pollNotifications()
    }

    return () => {
      cancelled = true
      isPollingRef.current = false
      if (timer) clearTimeout(timer)
    }
  }, [credentials, onIncomingMessage])

  return {
    sendError,
    setSendError,
    pollingStatus,
    webhookConfigNotice,
    setWebhookConfigNotice,
    isConfiguringWebhooks,
    syncWebhooks,
    sendMessage,
  }
}
