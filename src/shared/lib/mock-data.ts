import type { Chat } from "./types"

const now = Date.now()
const minutes = (n: number) => now - n * 60 * 1000

/**
 * Mock chats used purely to demonstrate the UI. Each chat is intentionally
 * in a different state so every screen state can be inspected:
 * - "ready": an active chat with incoming + outgoing history
 * - "empty": a chat with no messages yet
 * - "loading": history is being loaded
 * - "error": history failed to load
 */
export const mockChats: Chat[] = [
  {
    id: "chat-1",
    name: "Anna Petrova",
    recipient: "+7 900 123-45-67",
    avatarColor: "#e8618c",
    state: "ready",
    messages: [
      {
        id: "m1",
        text: "Hi! Did you get a chance to look at the test task?",
        timestamp: minutes(58),
        direction: "incoming",
      },
      {
        id: "m2",
        text: "Yes, just finished reading through the requirements.",
        timestamp: minutes(55),
        direction: "outgoing",
        status: "sent",
      },
      {
        id: "m3",
        text: "Great. The messaging goes through GREEN-API for Telegram.",
        timestamp: minutes(54),
        direction: "incoming",
      },
      {
        id: "m4",
        text: "Only plain text messages for now, right?",
        timestamp: minutes(52),
        direction: "outgoing",
        status: "sent",
      },
      {
        id: "m5",
        text: "Exactly. Keep it simple and minimal.",
        timestamp: minutes(50),
        direction: "incoming",
      },
    ],
  },
  {
    id: "chat-2",
    name: "Dmitry Sokolov",
    recipient: "+7 911 987-65-43",
    avatarColor: "#5b8def",
    state: "empty",
    messages: [],
  },
  {
    id: "chat-3",
    name: "Maria Ivanova",
    recipient: "+7 921 555-33-11",
    avatarColor: "#4bb34b",
    state: "loading",
    messages: [],
  },
  {
    id: "chat-4",
    name: "Support Bot",
    recipient: "79001112233@c.us",
    avatarColor: "#9b59b6",
    state: "error",
    messages: [],
  },
]

/** Canned incoming replies used to simulate receiving a message. */
export const mockReplies = [
  "Got it, thanks!",
  "Sounds good.",
  "Let me check and get back to you.",
  "Perfect, works for me.",
  "Sure, no problem.",
]
