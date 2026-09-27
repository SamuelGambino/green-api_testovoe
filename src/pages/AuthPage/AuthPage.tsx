import type { Credentials } from "@/shared/lib/types"
import { AuthForm, getStoredCredentials } from "@/features/auth"
import styles from "@/shared/components/messenger.module.css"

interface AuthPageProps {
  onConnect: (credentials: Credentials, forceContinue?: boolean) => Promise<boolean | void>
  connecting: boolean
  error: string | null
  notice: string | null
}

export function AuthPage({
  onConnect,
  connecting,
  error,
  notice,
}: AuthPageProps) {
  const initialCreds = getStoredCredentials()

  return (
    <div className={styles.authScreen}>
      <AuthForm
        initialCreds={initialCreds}
        onSubmit={onConnect}
        connecting={connecting}
        error={error}
        notice={notice}
      />
    </div>
  )
}
