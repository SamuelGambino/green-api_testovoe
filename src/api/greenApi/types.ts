export type InstanceType = 'tgInstance' | 'waInstance'

export interface GreenApiCredentials {
  idInstance: string
  apiTokenInstance: string
  apiUrl?: string
  instanceType?: InstanceType
  recipient?: string
}

export interface StateInstanceResponse {
  stateInstance: 'authorized' | 'notAuthorized' | 'blocked' | 'sleepMode' | 'starting' | string
}

export interface SendMessagePayload {
  chatId: string
  message: string
  quotedMessageId?: string
}

export interface SendMessageResponse {
  idMessage: string
}

export interface IncomingMessageData {
  typeMessage: string
  textMessageData?: {
    textMessage: string
  }
  extendedTextMessageData?: {
    textMessage: string
    description?: string
    title?: string
    previewImageUrl?: string
  }
}

export interface SenderData {
  chatId: string
  chatName?: string
  sender: string
  senderName?: string
  senderContactName?: string
}

export interface NotificationBody {
  typeWebhook: string
  instanceData?: {
    idInstance: number
    wid: string
    typeInstance: string
  }
  timestamp: number
  idMessage?: string
  status?: string
  senderData?: SenderData
  messageData?: IncomingMessageData
}

export interface ReceiveNotificationResponse {
  receiptId: number
  body: NotificationBody
}

export interface DeleteNotificationResponse {
  result: boolean
}

export interface ChatHistoryMessage {
  type: 'incoming' | 'outgoing'
  timestamp: number
  idMessage: string
  textMessage?: string
  statusMessage?: string
  chatId?: string
}
