import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AddReading from './pages/AddReading'
import Ranking from './pages/Ranking'
import Profile from './pages/Profile'

function Protected ({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" aria-label="Carregando" />
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App () {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="/registrar" element={<Protected><AddReading /></Protected>} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/perfil" element={<Protected><Profile /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="border-t border-stone-100 bg-white py-6">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-stone-500">
          Energia &amp; Sustentabilidade BR — um projeto de inovação para um futuro mais consciente.
        </div>
      </footer>
    </div>
  )
}
