import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Zap, Trophy, UserCircle, LogOut, LayoutDashboard, PlusCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import type { NavLinkRenderProps } from 'react-router-dom'

export default function Navbar () {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout () {
    logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-stone-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-bold text-stone-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-soft">
            <Zap size={18} />
          </span>
          <span className="text-lg">
            Energia<span className="text-brand-600">&amp;</span>Sustentabilidade
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {user ? (
            <>
              <NavLink to="/dashboard" className={navClass}>
                <LayoutDashboard size={16} /> <span className="hidden sm:inline">Painel</span>
              </NavLink>
              <NavLink to="/registrar" className={navClass}>
                <PlusCircle size={16} /> <span className="hidden sm:inline">Registrar</span>
              </NavLink>
              <NavLink to="/ranking" className={navClass}>
                <Trophy size={16} /> <span className="hidden sm:inline">Ranking</span>
              </NavLink>
              <NavLink to="/perfil" className={navClass}>
                <UserCircle size={16} /> <span className="hidden sm:inline">{user.nome.split(' ')[0]}</span>
              </NavLink>
              <button onClick={handleLogout} className="inline-flex cursor-pointer items-center gap-1.5 rounded-2xl px-3 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900" aria-label="Sair">
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost !py-2 !px-4 text-sm">Entrar</Link>
              <Link to="/registro" className="btn-primary !py-2 !px-4 text-sm">Criar conta</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

function navClass ({ isActive }: NavLinkRenderProps) {
  return `inline-flex cursor-pointer items-center gap-1.5 rounded-2xl px-3 py-2 text-sm font-medium transition-colors duration-200 ${
    isActive ? 'bg-brand-50 text-brand-700' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
  }`
}
