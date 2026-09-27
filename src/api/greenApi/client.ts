import type {
  ChatHistoryMessage,
  DeleteNotificationResponse,
  GreenApiCredentials,
  InstanceType,
  ReceiveNotificationResponse,
  SendMessageResponse,
  StateInstanceResponse,
} from './types'

export function cleanInstanceId(id: string): string {
  return id.replace(/^(waInstance|tgInstance)/i, '').trim()
}

export function detectInstanceType(id: string, preferred?: InstanceType): InstanceType {
  if (/^tg/i.test(id)) return 'tgInstance'
  if (/^wa/i.test(id)) return 'waInstance'
  return preferred || 'waInstance'
}

export function formatChatId(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return ''

  // If already formatted with suffix (e.g. 79991234567@c.us or @g.us) or starts with @ (telegram username)
  if (trimmed.includes('@')) {
    return trimmed
  }

  // Strip spaces, dashes, parentheses, plus
  const digits = trimmed.replace(/\D/g, '')
  if (digits.length > 0) {
    return `${digits}@c.us`
  }

  return trimmed
}

function buildApiUrl(
  creds: GreenApiCredentials,
  method: string,
  extraPath?: string | number,
): string {
  const host = (creds.apiUrl || 'https://api.green-api.com').replace(/\/+$/, '')
  const type = creds.instanceType || detectInstanceType(creds.idInstance)
  const id = cleanInstanceId(creds.idInstance)
  const token = creds.apiTokenInstance.trim()

  let url = `${host}/${type}${id}/${method}/${token}`
  if (extraPath !== undefined && extraPath !== '') {
    url += `/${extraPath}`
  }
  return url
}

async function handleResponse<T>(res: Response, methodName: string): Promise<T> {
  if (!res.ok) {
    let errorDetail: string
    try {
      const data = await res.json()
      errorDetail = data.message || data.error || JSON.stringify(data)
    } catch {
      errorDetail = await res.text().catch(() => res.statusText)
    }

    if (res.status === 401 || res.status === 403) {
      throw new Error(
        `GREEN-API Authentication Error (${res.status}): Please check your idInstance and apiTokenInstance. ${errorDetail}`,
      )
    }
    if (res.status === 400) {
      throw new Error(`GREEN-API Bad Request in ${methodName}: ${errorDetail}`)
    }
    throw new Error(`GREEN-API ${methodName} error (${res.status}): ${errorDetail || res.statusText}`)
  }

  // If 204 or empty body
  const text = await res.text()
  if (!text) {
    return null as unknown as T
  }

  try {
    return JSON.parse(text) as T
  } catch {
    return text as unknown as T
  }
}

/**
 * Checks instance authorization state
 * GET /waInstance{idInstance}/getStateInstance/{apiTokenInstance}
 */
export async function getStateInstance(
  creds: GreenApiCredentials,
): Promise<StateInstanceResponse> {
  const url = buildApiUrl(creds, 'getStateInstance')
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })
  return handleResponse<StateInstanceResponse>(res, 'getStateInstance')
}

/**
 * Sends a plain text message to recipient
 * POST /waInstance{idInstance}/sendMessage/{apiTokenInstance}
 */
export async function sendMessage(
  creds: GreenApiCredentials,
  chatId: string,
  message: string,
): Promise<SendMessageResponse> {
  const url = buildApiUrl(creds, 'sendMessage')
  const formattedChatId = formatChatId(chatId)

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      chatId: formattedChatId,
      message,
    }),
  })
  return handleResponse<SendMessageResponse>(res, 'sendMessage')
}

/**
 * Receives the next notification from the queue (HTTP API technology)
 * GET /waInstance{idInstance}/receiveNotification/{apiTokenInstance}
 */
export async function receiveNotification(
  creds: GreenApiCredentials,
): Promise<ReceiveNotificationResponse | null> {
  const url = buildApiUrl(creds, 'receiveNotification')
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  // If queue is empty, server returns null or empty JSON
  const data = await handleResponse<ReceiveNotificationResponse | null>(res, 'receiveNotification')
  if (!data || !data.receiptId) {
    return null
  }
  return data
}

/**
 * Deletes acknowledged notification from queue
 * DELETE /waInstance{idInstance}/deleteNotification/{apiTokenInstance}/{receiptId}
 */
export async function deleteNotification(
  creds: GreenApiCredentials,
  receiptId: number,
): Promise<DeleteNotificationResponse> {
  const url = buildApiUrl(creds, 'deleteNotification', receiptId)
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
    },
  })
  return handleResponse<DeleteNotificationResponse>(res, 'deleteNotification')
}

/**
 * Fetches recent chat history
 * POST /waInstance{idInstance}/getChatHistory/{apiTokenInstance}
 */
export async function getChatHistory(
  creds: GreenApiCredentials,
  chatId: string,
  count = 50,
): Promise<ChatHistoryMessage[]> {
  try {
    const url = buildApiUrl(creds, 'getChatHistory')
    const formattedChatId = formatChatId(chatId)
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        chatId: formattedChatId,
        count,
      }),
    })
    const data = await handleResponse<ChatHistoryMessage[]>(res, 'getChatHistory')
    return Array.isArray(data) ? data : []
  } catch {
    // getChatHistory is optional; return empty array if unavailable or fails
    return []
  }
}
