import { useRef, useState } from "react"
import { SendIcon } from "@/shared/components/icons"
import styles from "@/shared/components/messenger.module.css"

interface MessageInputProps {
  disabled?: boolean
  onSend: (text: string) => void
}

export function MessageInput({ disabled, onSend }: MessageInputProps) {
  const [text, setText] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function autoGrow() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`
  }

  function submit() {
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setText("")
    requestAnimationFrame(() => {
      if (textareaRef.current) textareaRef.current.style.height = "auto"
    })
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.nativeEvent.isComposing || e.keyCode === 229) return
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className={styles.composer}>
      <textarea
        ref={textareaRef}
        className={styles.composerInput}
        placeholder="Напишите сообщение…"
        rows={1}
        value={text}
        disabled={disabled}
        onChange={(e) => {
          setText(e.target.value)
          autoGrow()
        }}
        onKeyDown={handleKeyDown}
        aria-label="Текст сообщения"
      />
      <button
        type="button"
        className={styles.sendButton}
        onClick={submit}
        disabled={disabled || text.trim().length === 0}
        aria-label="Отправить сообщение"
        title="Отправить (Enter)"
      >
        <SendIcon width={20} height={20} />
      </button>
    </div>
  )
}
