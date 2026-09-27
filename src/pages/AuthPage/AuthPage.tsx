import type { Credentials } from "@/shared/lib/types"
import { AuthForm, QrCodeView, getStoredCredentials } from "@/features/auth"
import styles from "@/shared/components/messenger.module.css"

interface AuthPageProps {
  isQrMode?: boolean
  pendingCredentials?: Credentials | null
  onConnect: (credentials: Credentials, forceContinue?: boolean) => Promise<boolean | void>
  onAuthorized?: () => void
  onBack?: () => void
  connecting: boolean
  error: string | null
  notice: string | null
}

export function AuthPage({
  isQrMode,
  pendingCredentials,
  onConnect,
  onAuthorized,
  onBack,
  connecting,
  error,
  notice,
}: AuthPageProps) {
  const initialCreds = pendingCredentials || getStoredCredentials()

  return (
    <div className={styles.authScreen}>
      {isQrMode && pendingCredentials && onAuthorized && onBack ? (
        <QrCodeView
          credentials={pendingCredentials}
          onAuthorized={onAuthorized}
          onBack={onBack}
        />
      ) : (
        <AuthForm
          initialCreds={initialCreds}
          onSubmit={onConnect}
          connecting={connecting}
          error={error}
          notice={notice}
        />
      )}
    </div>
  )
}
