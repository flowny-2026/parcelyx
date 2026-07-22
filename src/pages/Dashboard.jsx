import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { TrendingUp, AlertTriangle, Clock, Users, CreditCard, DollarSign, Headphones, ChevronRight, Wallet, Edit3, Check } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
  const navigate = useNavigate()
  const { getStats, getRecebimentosRecentes, getChartData, userData, updateUserData, loadAllData, parcelas, parcelamentos, clientes } = useApp()
  const stats = getStats()
  const recentes = getRecebimentosRecentes()
  const chartData = getChartData()
  const [editandoCapital, setEditandoCapital] = useState(false)
  const [capitalValue, setCapitalValue] = useState('')

  const nomeExibido = userData?.nome || userData?.negocio || 'Usuário'
  const capitalInicial = userData?.capitalDisponivel || userData?.capital_disponivel || 0

  const totalEmprestado = parcelamentos.reduce((sum, p) => sum + (p.valorTotal || 0), 0)
  const totalRecebido = parcelas.filter(p => p.status === 'pago').reduce((sum, p) => sum + (p.valor || 0), 0)
  const capitalDisponivel = capitalInicial - totalEmprestado + totalRecebido

  const totalClientes = clientes?.length || 0
  const totalContratos = parcelamentos?.length || 0
  const venceHoje = parcelas.filter(p => p.status === 'vence_hoje').length
  const atrasadas = parcelas.filter(p => p.status === 'atrasado').length

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const salvarCapital = async () => {
    const valor = parseFloat(capitalValue) || 0
    await updateUserData({ capital_disponivel: valor })
    await loadAllData()
    setEditandoCapital(false)
    setCapitalValue('')
  }

  // Parcelas que vencem hoje ou amanhã
  const hoje = new Date()
  hoje.setHours(0,0,0,0)
  const amanha = new Date(hoje)
  amanha.setDate(amanha.getDate() + 1)
  
  const parcelasHoje = parcelas.filter(p => p.status === 'vence_hoje')
  const parcelasAmanha = parcelas.filter(p => {
    if (p.status === 'pago') return false
    const venc = new Date(p.vencimento + 'T12:00:00')
    venc.setHours(0,0,0,0)
    return venc.getTime() === amanha.getTime()
  })
  const parcelasAtrasadasList = parcelas.filter(p => p.status === 'atrasado').slice(0, 5)

  return (
    <div className="space-y-5 pb-20 md:pb-0 animate-fade-in">
      {/* Header */}
      <h1 className="text-xl font-bold text-white text-center md:text-left">Início</h1>

      {/* Alertas de vencimento de contratos */}
      {parcelasHoje.length > 0 && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-semibold text-amber-300">
              {parcelasHoje.length} parcela{parcelasHoje.length > 1 ? 's' : ''} vence{parcelasHoje.length === 1 ? '' : 'm'} hoje
            </span>
          </div>
          <p className="text-xs text-gray-400 ml-6">
            {parcelasHoje.slice(0, 5).map(p => `${p.clienteNome} (${formatCurrency(p.valor)})`).join(' • ')}
            {parcelasHoje.length > 5 ? ` e mais ${parcelasHoje.length - 5}...` : ''}
          </p>
        </div>
      )}

      {parcelasAmanha.length > 0 && (
        <div className="p-3 bg-primary-500/10 border border-primary-500/30 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-primary-400" />
            <span className="text-sm font-semibold text-primary-300">
              {parcelasAmanha.length} parcela{parcelasAmanha.length > 1 ? 's' : ''} vence{parcelasAmanha.length === 1 ? '' : 'm'} amanhã
            </span>
          </div>
          <p className="text-xs text-gray-400 ml-6">
            {parcelasAmanha.slice(0, 5).map(p => `${p.clienteNome} (${formatCurrency(p.valor)})`).join(' • ')}
            {parcelasAmanha.length > 5 ? ` e mais ${parcelasAmanha.length - 5}...` : ''}
          </p>
        </div>
      )}

      {parcelasAtrasadasList.length > 0 && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-sm font-semibold text-red-300">
              {atrasadas} parcela{atrasadas > 1 ? 's' : ''} em atraso
            </span>
          </div>
          <p className="text-xs text-gray-400 ml-6">
            {parcelasAtrasadasList.map(p => `${p.clienteNome} (${formatCurrency(p.valor)})`).join(' • ')}
            {atrasadas > 5 ? ` e mais ${atrasadas - 5}...` : ''}
          </p>
        </div>
      )}

      {/* Cards principais - Hoje e Atrasadas */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-dark-700 rounded-2xl p-4 border border-dark-500/50 cursor-pointer" onClick={() => navigate('/parcelas')}>
          <div className="w-9 h-9 bg-amber-500/10 rounded-xl flex items-center justify-center mb-3">
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-sm text-gray-400">Hoje</p>
          <p className="text-3xl font-bold text-white">{venceHoje}</p>
        </div>
        <div className="bg-dark-700 rounded-2xl p-4 border border-dark-500/50 cursor-pointer" onClick={() => navigate('/parcelas')}>
          <div className="w-9 h-9 bg-red-500/10 rounded-xl flex items-center justify-center mb-3">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <p className="text-sm text-gray-400">Atrasadas</p>
          <p className="text-3xl font-bold text-white">{atrasadas}</p>
        </div>
      </div>

      {/* Cards Clientes e Contratos */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-dark-700 rounded-2xl p-4 border border-dark-500/50 cursor-pointer" onClick={() => navigate('/clientes')}>
          <div className="w-9 h-9 bg-primary-500/10 rounded-xl flex items-center justify-center mb-3">
            <Users className="w-5 h-5 text-primary-400" />
          </div>
          <p className="text-sm text-gray-400">Clientes</p>
          <p className="text-3xl font-bold text-white">{totalClientes}</p>
        </div>
        <div className="bg-dark-700 rounded-2xl p-4 border border-dark-500/50 cursor-pointer" onClick={() => navigate('/parcelamentos')}>
          <div className="w-9 h-9 bg-pix-500/10 rounded-xl flex items-center justify-center mb-3">
            <CreditCard className="w-5 h-5 text-pix-400" />
          </div>
          <p className="text-sm text-gray-400">Contratos</p>
          <p className="text-3xl font-bold text-white">{totalContratos}</p>
        </div>
      </div>

      {/* Gráfico de Clientes */}
      <div className="bg-dark-700 rounded-2xl p-5 border border-dark-500/50">
        <h3 className="text-base font-semibold text-white mb-4">Clientes</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorClientes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3042" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #1e3042', backgroundColor: '#141f2e', color: '#f1f5f9' }} />
              <Area type="monotone" dataKey="recebido" stroke="#10b981" strokeWidth={2.5} fill="url(#colorClientes)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Capital disponível */}
      <div className="bg-dark-700 rounded-2xl p-5 border border-primary-500/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Capital disponível</p>
              {!editandoCapital && (
                <p className={`text-2xl font-bold ${capitalDisponivel >= 0 ? 'text-white' : 'text-red-400'}`}>{formatCurrency(capitalDisponivel)}</p>
              )}
            </div>
          </div>
          {!editandoCapital && (
            <button onClick={() => { setEditandoCapital(true); setCapitalValue(capitalInicial.toString()) }}
              className="p-2 rounded-lg bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 border border-primary-500/20">
              <Edit3 className="w-4 h-4" />
            </button>
          )}
        </div>
        {editandoCapital && (
          <div className="mt-2">
            <p className="text-xs text-gray-500 mb-2">Capital total inicial</p>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">R$</span>
              <input type="number" step="0.01" value={capitalValue}
                onChange={e => setCapitalValue(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-dark-600 border border-dark-500 text-white text-lg font-bold outline-none focus:border-primary-500"
                placeholder="0,00" autoFocus />
              <button onClick={salvarCapital}
                className="p-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white">
                <Check className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
        {!editandoCapital && (
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-dark-500/30">
            <div className="text-center">
              <p className="text-xs text-gray-500">Inicial</p>
              <p className="text-sm font-semibold text-gray-300">{formatCurrency(capitalInicial)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Emprestado</p>
              <p className="text-sm font-semibold text-red-400">-{formatCurrency(totalEmprestado)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Recebido</p>
              <p className="text-sm font-semibold text-pix-400">+{formatCurrency(totalRecebido)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Recebimentos recentes */}
      <div className="bg-dark-700 rounded-2xl p-5 border border-dark-500/50">
        <h3 className="text-base font-semibold text-white mb-4">Recebimentos recentes</h3>
        <div className="space-y-3">
          {recentes.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">Nenhum recebimento recente</p>
          ) : (
            recentes.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-dark-500/30 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-pix-500/10 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-pix-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-200">{item.clienteNome}</p>
                    <p className="text-xs text-gray-500">Parcela {item.numero}/{item.totalParcelas}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-pix-400">{formatCurrency(item.valor)}</p>
                  <p className="text-xs text-gray-500">{new Date(item.dataPagamento).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Ações Rápidas */}
      <div>
        <h3 className="text-base font-semibold text-white mb-3">Ações Rápidas</h3>
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: CreditCard, label: 'Contratos', path: '/parcelamentos' },
            { icon: DollarSign, label: 'Receber', path: '/parcelas' },
            { icon: Users, label: 'Clientes', path: '/clientes' },
            { icon: Headphones, label: 'Suporte', path: 'https://wa.me/5516992383821?text=Olá!%20Preciso%20de%20suporte%20no%20Parcelyx.' },
          ].map((action, i) => (
            <a key={i} href={action.path.startsWith('http') ? action.path : undefined}
              target={action.path.startsWith('http') ? '_blank' : undefined}
              rel={action.path.startsWith('http') ? 'noreferrer' : undefined}
              onClick={(e) => { if (!action.path.startsWith('http')) { e.preventDefault(); navigate(action.path) } }}
              className="flex flex-col items-center gap-2 cursor-pointer">
              <div className="w-14 h-14 bg-dark-700 border border-dark-500/50 rounded-xl flex items-center justify-center hover:border-pix-500/30 transition-colors">
                <action.icon className="w-5 h-5 text-pix-400" />
              </div>
              <span className="text-xs text-gray-400">{action.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
