import React, { useState } from 'react'
import { Outlet, NavLink, useLocation, Navigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, CreditCard, Receipt,
  MessageSquare, PieChart, Settings, Menu, X, LogOut, Bell, AlertTriangle, Clock
} from 'lucide-react'
import { useApp } from '../context/AppContext'

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Início' },
  { path: '/parcelamentos', icon: CreditCard, label: 'Contratos' },
  { path: '/clientes', icon: Users, label: 'Clientes' },
  { path: '/parcelas', icon: Receipt, label: 'Parcelas' },
  { path: '/cobrancas', icon: MessageSquare, label: 'Cobranças' },
  { path: '/financeiro', icon: PieChart, label: 'Financeiro' },
  { path: '/configuracoes', icon: Settings, label: 'Configurações' },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showAlerts, setShowAlerts] = useState(false)
  const location = useLocation()
  const { isAuthenticated, logout, userData, parcelas } = useApp()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const nomeExibido = userData?.negocio || userData?.nome || 'Meu Negócio'
  const emailExibido = userData?.email || ''
  const inicialExibida = nomeExibido.charAt(0).toUpperCase()

  // Verificação de expiração do plano
  const dataExpiracao = userData?.dataExpiracao || userData?.data_expiracao
  const plano = userData?.plano
  let diasRestantes = null
  let planoExpirado = false

  if (dataExpiracao) {
    const expDate = new Date(dataExpiracao + 'T23:59:59')
    const hojeDt = new Date()
    diasRestantes = Math.ceil((expDate - hojeDt) / (1000 * 60 * 60 * 24))
    planoExpirado = diasRestantes < 0
  }

  // Se o plano expirou, bloqueia acesso
  if (planoExpirado) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-dark-800 rounded-2xl border border-red-500/30 p-8">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Plano expirado</h2>
            <p className="text-sm text-gray-400 mb-2">
              Seu {plano === 'teste' ? 'período de teste' : 'plano'} expirou em {new Date(dataExpiracao).toLocaleDateString('pt-BR')}.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Para continuar usando o Parcelyx, entre em contato com nosso suporte para renovar.
            </p>
            <a href="https://wa.me/5516992383821?text=Olá!%20Meu%20plano%20expirou%20e%20gostaria%20de%20renovar."
              target="_blank" rel="noreferrer"
              className="w-full py-3.5 bg-pix-500 hover:bg-pix-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 mb-3">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Falar com suporte
            </a>
            <button onClick={logout}
              className="w-full py-3 border border-dark-500 text-gray-400 font-semibold rounded-xl hover:bg-dark-700">
              Sair da conta
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Alertas locais
  const hoje = new Date().toISOString().split('T')[0]
  const atrasadas = parcelas?.filter(p => p.status === 'atrasado') || []
  const venceHoje = parcelas?.filter(p => p.status === 'vence_hoje') || []
  const totalAlertas = atrasadas.length + venceHoje.length

  return (
    <div className="min-h-screen bg-dark-900 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-dark-800 border-r border-dark-500/50">
        <div className="flex items-center h-16 px-6 border-b border-dark-500/50">
          <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-1.5">
            <img 
              src="/img/140x93px.png" 
              alt="Parcelyx" 
              className="h-10 w-auto object-contain"
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
                    ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                    : 'text-gray-400 hover:bg-dark-600 hover:text-gray-200 border border-transparent'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-dark-500/50">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 bg-primary-500/20 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-primary-400">{inicialExibida}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-200 truncate">{nomeExibido}</p>
              <p className="text-xs text-gray-500 truncate">{emailExibido}</p>
            </div>
            <button
              onClick={logout}
              title="Sair"
              className="p-1.5 rounded-lg hover:bg-dark-600 text-gray-500 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-72 bg-dark-800 shadow-elevated z-50 animate-slide-in flex flex-col">
            <div className="flex items-center justify-between h-16 px-6 border-b border-dark-500/50">
              <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-1.5">
                <img 
                  src="/img/140x93px.png" 
                  alt="Parcelyx" 
                  className="h-10 w-auto object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/img/icon-192.png';
                  }}
                />
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-dark-600">
                <X className="w-5 h-5 text-gray-400" />
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
                        ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                        : 'text-gray-400 hover:bg-dark-600 hover:text-gray-200 border border-transparent'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="p-4 border-t border-dark-500/50">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center">
                  <span className="text-base font-semibold text-primary-400">{inicialExibida}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-200 truncate">{nomeExibido}</p>
                  <p className="text-xs text-gray-500 truncate">{emailExibido}</p>
                </div>
                <button
                  onClick={() => {
                    setSidebarOpen(false)
                    logout()
                  }}
                  title="Sair"
                  className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
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
        <header className="md:hidden sticky top-0 z-30 bg-dark-800/90 backdrop-blur-md border-b border-dark-500/50">
          <div className="flex items-center justify-between h-14 px-4">
            <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 rounded-lg hover:bg-dark-600">
              <Menu className="w-5 h-5 text-gray-300" />
            </button>
            <div className="flex items-center gap-2 bg-white rounded-xl px-2 py-1">
              <img 
                src="/img/140x93px.png" 
                alt="Parcelyx" 
                className="h-9 w-auto object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/img/icon-192.png';
                }}
              />
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowAlerts(!showAlerts)} className="p-2 rounded-lg hover:bg-dark-600 relative">
                <Bell className="w-5 h-5 text-gray-400" />
                {totalAlertas > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white">
                    {totalAlertas > 9 ? '9+' : totalAlertas}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Painel de alertas */}
        {showAlerts && (
          <div className="md:hidden fixed inset-0 z-[90]" onClick={() => setShowAlerts(false)}>
            <div className="fixed inset-0 bg-black/50" />
            <div className="absolute top-14 right-2 left-2 bg-dark-800 rounded-2xl border border-dark-500/50 shadow-elevated animate-fade-in max-h-[60vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b border-dark-500/50 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Alertas</h3>
                <button onClick={() => setShowAlerts(false)} className="text-gray-500 hover:text-gray-300">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-3 space-y-2">
                {totalAlertas === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">Nenhum alerta no momento ✅</p>
                ) : (
                  <>
                    {venceHoje.length > 0 && (
                      <div className="flex items-center gap-3 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                        <Clock className="w-5 h-5 text-amber-400 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-amber-300">{venceHoje.length} parcela{venceHoje.length > 1 ? 's' : ''} vence{venceHoje.length === 1 ? '' : 'm'} hoje</p>
                          <p className="text-xs text-gray-500 mt-0.5">{venceHoje.slice(0, 3).map(p => p.clienteNome).join(', ')}{venceHoje.length > 3 ? '...' : ''}</p>
                        </div>
                      </div>
                    )}
                    {atrasadas.length > 0 && (
                      <div className="flex items-center gap-3 p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-red-300">{atrasadas.length} parcela{atrasadas.length > 1 ? 's' : ''} em atraso</p>
                          <p className="text-xs text-gray-500 mt-0.5">{atrasadas.slice(0, 3).map(p => p.clienteNome).join(', ')}{atrasadas.length > 3 ? '...' : ''}</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Banner plano expirando */}
        {diasRestantes !== null && diasRestantes >= 0 && diasRestantes <= 2 && (
          <div className="mx-3 md:mx-4 lg:mx-8 mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-300">
                {diasRestantes === 0 ? 'Seu plano expira hoje!' : `Seu plano expira em ${diasRestantes} dia${diasRestantes > 1 ? 's' : ''}!`}
              </p>
              <p className="text-xs text-gray-500">Renove para não perder acesso.</p>
            </div>
            <a href="https://wa.me/5516992383821?text=Olá!%20Quero%20renovar%20meu%20plano%20do%20Parcelyx."
              target="_blank" rel="noreferrer"
              className="px-3 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded-lg whitespace-nowrap">
              Renovar
            </a>
          </div>
        )}

        {/* Page content */}
        <main className="p-3 md:p-4 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-dark-800 border-t border-dark-500/50 mobile-nav z-30 safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-1">
          {navItems.slice(0, 5).map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors min-w-[60px] ${
                  isActive ? 'text-primary-400' : 'text-gray-500'
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
