import React, { useState } from 'react'
import { Outlet, NavLink, useLocation, Navigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, CreditCard, Receipt,
  MessageSquare, PieChart, Settings, Menu, X, LogOut
} from 'lucide-react'
import { useApp } from '../context/AppContext'

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/clientes', icon: Users, label: 'Clientes' },
  { path: '/parcelamentos', icon: CreditCard, label: 'Parcelamentos' },
  { path: '/parcelas', icon: Receipt, label: 'Parcelas' },
  { path: '/cobrancas', icon: MessageSquare, label: 'Cobranças' },
  { path: '/financeiro', icon: PieChart, label: 'Financeiro' },
  { path: '/configuracoes', icon: Settings, label: 'Configurações' },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { isAuthenticated, logout, userData } = useApp()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const nomeExibido = userData?.negocio || userData?.nome || 'Meu Negócio'
  const emailExibido = userData?.email || ''
  const inicialExibida = nomeExibido.charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r border-neutral-200">
        <div className="flex items-center h-16 px-6 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <img 
              src="/img/140x93px.png" 
              alt="Parcelyx" 
              className="h-16 w-auto object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/img/icon-192.png';
              }}
            />
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-neutral-100">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-primary-700">{inicialExibida}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 truncate">{nomeExibido}</p>
              <p className="text-xs text-neutral-500 truncate">{emailExibido}</p>
            </div>
            <button
              onClick={logout}
              title="Sair"
              className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-72 bg-white shadow-elevated z-50 animate-slide-in flex flex-col">
            <div className="flex items-center justify-between h-16 px-6 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <img 
                  src="/img/140x93px.png" 
                  alt="Parcelyx" 
                  className="h-16 w-auto object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/img/icon-192.png';
                  }}
                />
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-neutral-100">
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {navItems.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
            {/* User info footer - Mobile */}
            <div className="p-4 border-t border-neutral-100">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-base font-semibold text-primary-700">{inicialExibida}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">{nomeExibido}</p>
                  <p className="text-xs text-neutral-500 truncate">{emailExibido}</p>
                </div>
                <button
                  onClick={() => {
                    setSidebarOpen(false)
                    logout()
                  }}
                  title="Sair"
                  className="p-2 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 md:ml-64">
        {/* Top bar mobile */}
        <header className="md:hidden sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-neutral-200">
          <div className="flex items-center justify-between h-14 px-4">
            <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 rounded-lg hover:bg-neutral-100">
              <Menu className="w-5 h-5 text-neutral-700" />
            </button>
            <div className="flex items-center gap-2">
              <img 
                src="/img/140x93px.png" 
                alt="Parcelyx" 
                className="h-14 w-auto object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/img/icon-192.png';
                }}
              />
            </div>
            <div className="w-9" />
          </div>
        </header>

        {/* Page content */}
        <main className="p-3 md:p-4 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 mobile-nav z-30 safe-area-bottom">
        <div className="flex items-center justify-around h-14 md:h-16 px-1">
          {navItems.slice(0, 5).map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors min-w-[60px] ${
                  isActive ? 'text-primary-600' : 'text-neutral-400'
                }`
              }
            >
              <item.icon className="w-5 h-5" strokeWidth={2.5} />
              <span className="text-[10px] font-medium truncate max-w-full">{item.label.slice(0, 10)}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
