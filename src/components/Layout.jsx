import React, { useState, useRef } from 'react'
import { Outlet, NavLink, useLocation, Navigate, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, CreditCard, Receipt,
  MessageSquare, PieChart, Settings, Menu, X, LogOut, Bell, AlertTriangle, Clock, Search, CalendarDays, RefreshCw, Camera
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { supabase } from '../lib/supabase'

// Itens do menu inferior (5 itens — o central é "Receber")
const bottomNavItems = [
  { path: '/',               icon: LayoutDashboard, label: 'Início' },
  { path: '/parcelamentos',  icon: CreditCard,      label: 'Contratos' },
  { path: '/parcelas',       icon: RefreshCw,       label: 'Receber', center: true },
  { path: '/clientes',       icon: Users,           label: 'Clientes' },
  { path: '/configuracoes',  icon: Menu,            label: 'Menu' },
]

// Todos os itens da sidebar desktop
const navItems = [
  { path: '/',               icon: LayoutDashboard, label: 'Início' },
  { path: '/parcelamentos',  icon: CreditCard,      label: 'Contratos' },
  { path: '/clientes',       icon: Users,           label: 'Clientes' },
  { path: '/parcelas',       icon: Receipt,         label: 'Parcelas' },
  { path: '/cobrancas',      icon: MessageSquare,   label: 'Cobranças' },
  { path: '/financeiro',     icon: PieChart,        label: 'Financeiro' },
  { path: '/agenda',         icon: CalendarDays,    label: 'Agenda' },
  { path: '/configuracoes',  icon: Settings,        label: 'Configurações' },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen]   = useState(false)
  const [showAlerts, setShowAlerts]     = useState(false)
  const [showSearch, setShowSearch]     = useState(false)
  const [searchQuery, setSearchQuery]   = useState('')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const photoInputRef = useRef(null)
  const location  = useLocation()
  const navigate  = useNavigate()
  const { isAuthenticated, logout, userData, updateUserData, parcelas, clientes, parcelamentos } = useApp()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  const nomeExibido   = userData?.negocio || userData?.nome || 'Meu Negócio'
  const emailExibido  = userData?.email || ''
  const inicialExibida = nomeExibido.charAt(0).toUpperCase()
  const fotoUrl       = userData?.foto_url || userData?.fotoUrl || null

  // Verificação de expiração do plano
  const dataExpiracao = userData?.dataExpiracao || userData?.data_expiracao
  const plano = userData?.plano
  let diasRestantes = null
  let planoExpirado = false
  if (dataExpiracao) {
    const expDate = new Date(dataExpiracao + 'T23:59:59')
    diasRestantes = Math.ceil((expDate - new Date()) / (1000 * 60 * 60 * 24))
    planoExpirado = diasRestantes < 0
  }

  // Upload de foto de perfil
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 3 * 1024 * 1024) { alert('Imagem muito grande. Máximo 3MB.'); return }
    setUploadingPhoto(true)
    try {
      const ext = file.name.split('.').pop()
      const { data: { user } } = await supabase.auth.getUser()
      const fileName = `avatar_${user.id}.${ext}`
      await supabase.storage.from('avatars').upload(fileName, file, { upsert: true })
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName)
      const url = urlData?.publicUrl + `?t=${Date.now()}`
      await updateUserData({ foto_url: url })
    } catch (err) {
      console.error('Erro ao fazer upload:', err)
    }
    setUploadingPhoto(false)
    e.target.value = ''
  }

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

  const atrasadas   = parcelas?.filter(p => p.status === 'atrasado') || []
  const venceHoje   = parcelas?.filter(p => p.status === 'vence_hoje') || []
  const totalAlertas = atrasadas.length + venceHoje.length

  const searchResults = searchQuery.length >= 2 ? {
    clientes:  (clientes || []).filter(c => c.nome?.toLowerCase().includes(searchQuery.toLowerCase()) || c.telefone?.includes(searchQuery)).slice(0, 5),
    contratos: (parcelamentos || []).filter(p => p.clienteNome?.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5),
  } : null

  // Avatar component reutilizável
  const Avatar = ({ size = 'md', showCamera = false }) => {
    const sizes = { sm: 'w-8 h-8 text-sm', md: 'w-10 h-10 text-base', lg: 'w-12 h-12 text-lg' }
    return (
      <div className={`relative flex-shrink-0 ${showCamera ? 'cursor-pointer' : ''}`}
        onClick={showCamera ? () => photoInputRef.current?.click() : undefined}>
        <div className={`${sizes[size]} rounded-full overflow-hidden border-2 border-pix-500/40 flex items-center justify-center bg-dark-600`}>
          {fotoUrl
            ? <img src={fotoUrl} alt="Perfil" className="w-full h-full object-cover" />
            : <span className="font-bold text-pix-400">{inicialExibida}</span>
          }
        </div>
        {showCamera && (
          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-pix-500 rounded-full flex items-center justify-center border-2 border-dark-900">
            {uploadingPhoto
              ? <div className="w-2.5 h-2.5 border border-white border-t-transparent rounded-full animate-spin" />
              : <Camera className="w-2.5 h-2.5 text-white" />
            }
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900 flex" style={{ maxWidth: '100vw', overflowX: 'hidden' }}>
      {/* Input hidden para foto */}
      <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />

      {/* ── SIDEBAR DESKTOP ── */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-dark-800 border-r border-dark-500/50">
        <div className="flex items-center h-16 px-6 border-b border-dark-500/50">
          <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-1.5">
            <img src="/img/140x93px.png" alt="Parcelyx" className="h-10 w-auto object-contain"
              onError={e => { e.target.onerror = null; e.target.src = '/img/icon-192.png' }} />
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <NavLink key={item.path} to={item.path} end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                    : 'text-gray-400 hover:bg-dark-600 hover:text-gray-200 border border-transparent'
                }`}>
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-dark-500/50">
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar size="md" showCamera />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-200 truncate">{nomeExibido}</p>
              <p className="text-xs text-gray-500 truncate">{emailExibido}</p>
            </div>
            <button onClick={logout} title="Sair"
              className="p-1.5 rounded-lg hover:bg-dark-600 text-gray-500 hover:text-red-400 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── SIDEBAR MOBILE OVERLAY ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-72 bg-dark-800 shadow-elevated z-50 animate-slide-in flex flex-col">
            <div className="flex items-center justify-between h-16 px-6 border-b border-dark-500/50">
              <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-1.5">
                <img src="/img/140x93px.png" alt="Parcelyx" className="h-10 w-auto object-contain"
                  onError={e => { e.target.onerror = null; e.target.src = '/img/icon-192.png' }} />
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-dark-600">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {navItems.map(item => (
                <NavLink key={item.path} to={item.path} end={item.path === '/'}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                        : 'text-gray-400 hover:bg-dark-600 hover:text-gray-200 border border-transparent'
                    }`}>
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="p-4 border-t border-dark-500/50">
              <div className="flex items-center gap-3 px-3 py-2">
                <Avatar size="lg" showCamera />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-200 truncate">{nomeExibido}</p>
                  <p className="text-xs text-gray-500 truncate">{emailExibido}</p>
                </div>
                <button onClick={() => { setSidebarOpen(false); logout() }} title="Sair"
                  className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* ── MAIN ── */}
      <div className="flex-1 md:ml-64" style={{ maxWidth: '100vw', overflowX: 'hidden', minWidth: 0 }}>

        {/* ── TOP BAR MOBILE ── */}
        <header className="md:hidden sticky top-0 z-30 bg-dark-900/95 backdrop-blur-md">
          <div className="flex items-center justify-between px-3 pt-3 pb-3">
            {/* Avatar com câmera */}
            <div className="flex items-center gap-2 min-w-0">
              <Avatar size="md" showCamera />
              <div className="min-w-0">
                <p className="text-[10px] text-gray-400 leading-none">Bem vindo,</p>
                <p className="text-sm font-bold text-white leading-tight truncate max-w-[140px]">{nomeExibido}</p>
              </div>
            </div>
            {/* Ações */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => { setShowSearch(!showSearch); setShowAlerts(false) }}
                style={{ minHeight: 'unset' }}
                className="p-2 rounded-xl hover:bg-dark-700 text-gray-400">
                <Search className="w-5 h-5" />
              </button>
              <button onClick={() => { setShowAlerts(!showAlerts); setShowSearch(false) }}
                style={{ minHeight: 'unset' }}
                className="p-2 rounded-xl hover:bg-dark-700 text-gray-400 relative">
                <Bell className="w-5 h-5" />
                {totalAlertas > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white">
                    {totalAlertas > 9 ? '9+' : totalAlertas}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* ── PAINEL ALERTAS ── */}
        {showAlerts && (
          <div className="md:hidden fixed inset-0 z-[90]" onClick={() => setShowAlerts(false)}>
            <div className="fixed inset-0 bg-black/50" />
            <div className="absolute top-16 right-2 left-2 bg-dark-800 rounded-2xl border border-dark-500/50 shadow-elevated animate-fade-in max-h-[60vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b border-dark-500/50 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Alertas</h3>
                <button onClick={() => setShowAlerts(false)}><X className="w-4 h-4 text-gray-500" /></button>
              </div>
              <div className="p-3 space-y-2">
                {totalAlertas === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">Nenhum alerta ✅</p>
                ) : (
                  <>
                    {venceHoje.length > 0 && (
                      <div className="flex items-center gap-3 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                        <Clock className="w-5 h-5 text-amber-400 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-amber-300">{venceHoje.length} parcela{venceHoje.length > 1 ? 's' : ''} vence{venceHoje.length === 1 ? '' : 'm'} hoje</p>
                          <p className="text-xs text-gray-500 mt-0.5">{venceHoje.slice(0, 3).map(p => p.clienteNome).join(', ')}</p>
                        </div>
                      </div>
                    )}
                    {atrasadas.length > 0 && (
                      <div className="flex items-center gap-3 p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-red-300">{atrasadas.length} parcela{atrasadas.length > 1 ? 's' : ''} em atraso</p>
                          <p className="text-xs text-gray-500 mt-0.5">{atrasadas.slice(0, 3).map(p => p.clienteNome).join(', ')}</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── PAINEL BUSCA ── */}
        {showSearch && (
          <div className="md:hidden fixed inset-0 z-[90]" onClick={() => { setShowSearch(false); setSearchQuery('') }}>
            <div className="fixed inset-0 bg-black/50" />
            <div className="absolute top-16 right-2 left-2 bg-dark-800 rounded-2xl border border-dark-500/50 shadow-elevated animate-fade-in max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="p-3 border-b border-dark-500/50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Buscar cliente, contrato..."
                    className="w-full pl-10 pr-4 py-2.5 bg-dark-700 rounded-xl border border-dark-500 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-primary-500"
                    autoFocus />
                </div>
              </div>
              {searchResults ? (
                <div className="p-3 space-y-3">
                  {searchResults.clientes.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 font-semibold mb-2">CLIENTES</p>
                      {searchResults.clientes.map(c => (
                        <button key={c.id} onClick={() => { navigate('/clientes'); setShowSearch(false); setSearchQuery('') }}
                          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-dark-600 text-left">
                          <Users className="w-4 h-4 text-primary-400" />
                          <div>
                            <p className="text-sm text-gray-200">{c.nome}</p>
                            <p className="text-xs text-gray-500">{c.telefone}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {searchResults.contratos.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 font-semibold mb-2">CONTRATOS</p>
                      {searchResults.contratos.map(p => (
                        <button key={p.id} onClick={() => { navigate('/parcelamentos'); setShowSearch(false); setSearchQuery('') }}
                          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-dark-600 text-left">
                          <CreditCard className="w-4 h-4 text-pix-400" />
                          <div>
                            <p className="text-sm text-gray-200">{p.clienteNome}</p>
                            <p className="text-xs text-gray-500">{new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(p.valorTotal)}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {searchResults.clientes.length === 0 && searchResults.contratos.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">Nenhum resultado para "{searchQuery}"</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-6">Digite pelo menos 2 caracteres</p>
              )}
            </div>
          </div>
        )}

        {/* Banner plano expirando */}
        {diasRestantes !== null && diasRestantes >= 0 && diasRestantes <= 2 && (
          <div className="mx-3 mt-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-300">
                {diasRestantes === 0 ? 'Seu plano expira hoje!' : `Expira em ${diasRestantes} dia${diasRestantes > 1 ? 's' : ''}!`}
              </p>
            </div>
            <a href="https://wa.me/5516992383821?text=Olá!%20Quero%20renovar%20meu%20plano%20do%20Parcelyx."
              target="_blank" rel="noreferrer"
              className="px-3 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded-lg whitespace-nowrap">
              Renovar
            </a>
          </div>
        )}

        {/* ── PAGE CONTENT ── */}
        <main className="px-0 md:px-8 pt-2 max-w-7xl mx-auto w-full"
          style={{ paddingBottom: 'calc(7rem + env(safe-area-inset-bottom, 0px))', overflowX: 'hidden' }}>
          <div className="px-3 md:px-0 w-full" style={{ overflowX: 'hidden' }}>
            <Outlet />
          </div>
        </main>
      </div>

      {/* ── BOTTOM NAV MOBILE ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30">
        <div className="relative bg-dark-800 border-t border-dark-600/60"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}>

          {/* Recorte central decorativo */}
          <div className="absolute -top-px left-1/2 -translate-x-1/2 w-16 h-1 bg-dark-800" />

          <div className="flex items-end justify-around px-2 pt-2 pb-2">
            {bottomNavItems.map((item) => {
              if (item.center) {
                return (
                  <NavLink key={item.path} to={item.path} end={item.path === '/'}
                    className="flex flex-col items-center -mt-5 relative">
                    {({ isActive }) => (
                      <>
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${
                          isActive ? 'bg-pix-400' : 'bg-pix-500 hover:bg-pix-400'
                        }`}
                          style={{ boxShadow: '0 4px 20px rgba(16,185,129,0.5)' }}>
                          <item.icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                        </div>
                        <span className={`text-[10px] font-semibold mt-1 ${isActive ? 'text-pix-400' : 'text-gray-400'}`}>
                          {item.label}
                        </span>
                      </>
                    )}
                  </NavLink>
                )
              }
              return (
                <NavLink key={item.path} to={item.path} end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl transition-all min-w-[52px] ${
                      isActive ? 'text-pix-400' : 'text-gray-500 hover:text-gray-300'
                    }`
                  }>
                  {({ isActive }) => (
                    <>
                      <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-pix-500/15' : ''}`}>
                        <item.icon className="w-5 h-5" strokeWidth={2} />
                      </div>
                      <span className="text-[10px] font-medium">{item.label}</span>
                    </>
                  )}
                </NavLink>
              )
            })}
          </div>
        </div>
      </nav>
    </div>
  )
}
