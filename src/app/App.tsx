import { AuthPage } from "@/pages/AuthPage"
import { ChatPage } from "@/pages/ChatPage"
import { useAuth } from "@/features/auth"

export default function App() {
  const {
    credentials,
    pendingCredentials,
    isQrMode,
    connecting,
    authError,
    instanceStateNotice,
    login,
    confirmQrAuthorized,
    backToEdit,
    logout,
  } = useAuth()

  if (!credentials) {
    return (
      <AuthPage
        isQrMode={isQrMode}
        pendingCredentials={pendingCredentials}
        onConnect={login}
        onAuthorized={confirmQrAuthorized}
        onBack={backToEdit}
        connecting={connecting}
        error={authError}
        notice={instanceStateNotice}
      />
    )
  }

  return <ChatPage credentials={credentials} onLogout={logout} />
}
