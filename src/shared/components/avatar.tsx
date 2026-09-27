import { getInitials } from "@/lib/format"
import styles from "./messenger.module.css"

interface AvatarProps {
  name: string
  color: string
  size?: number
}

export function Avatar({ name, color, size = 48 }: AvatarProps) {
  return (
    <div
      className={styles.avatar}
      style={{
        background: color,
        width: size,
        height: size,
        fontSize: size * 0.375,
      }}
      aria-hidden="true"
    >
      {getInitials(name)}
    </div>
  )
}
