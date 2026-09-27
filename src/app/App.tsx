import { AuthPage } from "@/pages/AuthPage"
import { ChatPage } from "@/pages/ChatPage"
import { useAuth } from "@/features/auth"

export default function App() {
  const {
    credentials,
    connecting,
    authError,
    instanceStateNotice,
    login,
    logout,
  } = useAuth()

  if (!credentials) {
    return (
      <AuthPage
        onConnect={login}
        connecting={connecting}
        error={authError}
        notice={instanceStateNotice}
      />
    )
  }

  return <ChatPage credentials={credentials} onLogout={logout} />
}
