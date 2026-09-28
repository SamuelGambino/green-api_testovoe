import { AuthPage } from "@/pages/AuthPage"
import { ChatPage } from "@/pages/ChatPage"
import { useAuth } from "@/features/auth"

export default function App() {
  const {
    credentials,
    pendingCredentials,
    authStage,
    connecting,
    authError,
    instanceStateNotice,
    login,
    confirmAuthorized,
    goToPassword,
    backToQr,
    backToEdit,
    logout,
  } = useAuth()

  if (!credentials) {
    return (
      <AuthPage
        authStage={authStage}
        pendingCredentials={pendingCredentials}
        onConnect={login}
        onAuthorized={confirmAuthorized}
        onRequirePassword={goToPassword}
        onBackToQr={backToQr}
        onBack={backToEdit}
        connecting={connecting}
        error={authError}
        notice={instanceStateNotice}
      />
    )
  }

  return <ChatPage credentials={credentials} onLogout={logout} />
}
