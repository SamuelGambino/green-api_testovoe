import type { Credentials } from "@/shared/lib/types"
import type { AuthStage } from "@/features/auth"
import { AuthForm, PasswordView, QrCodeView, getStoredCredentials } from "@/features/auth"
import styles from "@/shared/components/messenger.module.css"

interface AuthPageProps {
  authStage?: AuthStage
  isQrMode?: boolean
  pendingCredentials?: Credentials | null
  onConnect: (credentials: Credentials, forceContinue?: boolean) => Promise<boolean | void>
  onAuthorized?: () => void
  onRequirePassword?: () => void
  onBackToQr?: () => void
  onBack?: () => void
  connecting: boolean
  error: string | null
  notice: string | null
}

export function AuthPage({
  authStage = "form",
  isQrMode,
  pendingCredentials,
  onConnect,
  onAuthorized,
  onRequirePassword,
  onBackToQr,
  onBack,
  connecting,
  error,
  notice,
}: AuthPageProps) {
  const initialCreds = pendingCredentials || getStoredCredentials()

  const stage = authStage || (isQrMode ? "qr" : "form")

  return (
    <div className={styles.authScreen}>
      {stage === "password" && pendingCredentials && onAuthorized ? (
        <PasswordView
          credentials={pendingCredentials}
          onAuthorized={onAuthorized}
          onBackToQr={onBackToQr || onBack || (() => {})}
        />
      ) : stage === "qr" && pendingCredentials && onAuthorized && onBack ? (
        <QrCodeView
          credentials={pendingCredentials}
          onAuthorized={onAuthorized}
          onRequirePassword={onRequirePassword}
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
