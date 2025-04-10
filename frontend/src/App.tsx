import { Routes, Route } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import HomePage from './pages/Home'

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </GoogleOAuthProvider>
  )
}

export default App