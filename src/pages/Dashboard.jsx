import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import {
  TrendingUp, AlertTriangle, Clock, Users, CreditCard,
  DollarSign, Headphones, Wallet, Edit3, Check, ChevronRight,
  ArrowDownLeft, PieChart, Receipt, MessageSquare
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export default function Dashboard() {
  const navigate  = useNavigate()
  const {
    getStats, getRecebimentosRecentes, getChartData,
    userData, updateUserData, loadAllData,
    parcelas, parcelamentos, clientes
  } = useApp()

  const stats    = getStats()
  const recentes = getRecebimentosRecentes()
  const chartData = getChartData()

  const [editandoCapital, setEditandoCapital] = useState(false)
  const [capitalValue,    setCapitalValue]    = useState('')

  const capitalInicial      = userData?.capitalDisponivel || userData?.capital_disponivel || 0
  const totalEmprestadoBruto = parcelamentos.reduce((s, p) => s + ((p.valorTotal || 0) - (p.entrada || 0)), 0)
  const totalRecebido       = parcelas.filter(p => p.status === 'pago').reduce((s, p) => s + (p.valor || 0), 0)
  const totalEmprestado     = Math.max(0, totalEmprestadoBruto - totalRecebido)
  const capitalDisponivel   = capitalInicial - totalEmprestadoBruto + totalRecebido

  // A Receber (pendentes + atrasadas)
  const aReceber = parcelas
    .filter(p => p.status !== 'pago')
    .reduce((s, p) => s + (p.valor || 0), 0)

  const totalClientes  = clientes?.length || 0
  const totalContratos = parcelamentos?.length || 0
  const venceHoje      = parcelas.filter(p => p.status === 'vence_hoje').length
  const atrasadas      = parcelas.filter(p => p.status === 'atrasado').length

  const salvarCapital = async () => {
    const valor = parseFloat(capitalValue) || 0
    await updateUserData({ capital_disponivel: valor })
    await loadAllData()
    setEditandoCapital(false)
    setCapitalValue('')
  }

  // Alertas
  const hoje   = new Date(); hoje.setHours(0,0,0,0)
  const amanha = new Date(hoje); amanha.setDate(amanha.getDate() + 1)
  const parcelasHoje    = parcelas.filter(p => p.status === 'vence_hoje')
  const parcelasAmanha  = parcelas.filter(p => {
    if (p.status === 'pago') return false
    const v = new Date(p.vencimento + 'T12:00:00'); v.setHours(0,0,0,0)
    return v.getTime() === amanha.getTime()
  })
  const parcelasAtrasadasList = parcelas.filter(p => p.status === 'atrasado').slice(0, 5)

  return (
    <div className="space-y-4 animate-fade-in">

      {/* ── CARD PRINCIPAL — Capital Exposto ── */}
      <div className="relative rounded-3xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0d9f6e 0%, #10b981 40%, #059669 100%)' }}>
        {/* Decoração de fundo */}
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

        <div className="relative p-5 pb-4">
          {/* Título + ícone editar */}
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-white/80">Capital Exposto</p>
            <button
              onClick={() => { setEditandoCapital(true); setCapitalValue(capitalInicial.toString()) }}
              className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center active:scale-95">
              <Edit3 className="w-3.5 h-3.5 text-white" />
            </button>
          </div>

          {/* Valor principal */}
          {editandoCapital ? (
            <div className="flex items-center gap-2 mt-1 mb-3">
              <span className="text-white/70 text-sm">R$</span>
              <input
                type="number" step="0.01" value={capitalValue}
                onChange={e => setCapitalValue(e.target.value)}
                className="flex-1 bg-white/20 border border-white/30 rounded-xl px-3 py-2 text-white text-xl font-bold outline-none placeholder-white/50"
                placeholder="0,00" autoFocus />
              <button onClick={salvarCapital}
                className="w-9 h-9 bg-white/25 rounded-xl flex items-center justify-center active:scale-95">
                <Check className="w-5 h-5 text-white" />
              </button>
            </div>
          ) : (
            <p className={`text-3xl font-extrabold text-white mt-1 mb-3 tracking-tight ${capitalDisponivel < 0 ? 'text-red-200' : ''}`}>
              {fmt(capitalDisponivel)}
            </p>
          )}

          {/* Sub-métricas */}
          {!editandoCapital && (
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 bg-white/15 rounded-2xl px-3 py-2">
                <p className="text-[10px] text-white/60 mb-0.5">Emprestado</p>
                <p className="text-sm font-bold text-white">{fmt(totalEmprestado)}</p>
              </div>
              <div className="flex-1 bg-white/15 rounded-2xl px-3 py-2">
                <p className="text-[10px] text-white/60 mb-0.5">Recebido</p>
                <p className="text-sm font-bold text-white">+{fmt(totalRecebido)}</p>
              </div>
            </div>
          )}

          {/* Banner Minhas Finanças */}
          <button
            onClick={() => navigate('/financeiro')}
            className="w-full flex items-center justify-between bg-dark-800/50 backdrop-blur-sm rounded-2xl px-4 py-3 active:scale-[0.98] transition-transform">
            <div>
              <p className="text-sm font-bold text-white">Minhas Finanças</p>
              <p className="text-xs text-white/60 mt-0.5">Fluxo de caixa, lucro e transações em um toque</p>
            </div>
            <div className="w-9 h-9 bg-pix-500 rounded-full flex items-center justify-center flex-shrink-0">
              <ChevronRight className="w-5 h-5 text-white" />
            </div>
          </button>
        </div>
      </div>

      {/* ── ALERTAS ── */}
      {parcelasHoje.length > 0 && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-semibold text-amber-300">
              {parcelasHoje.length} parcela{parcelasHoje.length > 1 ? 's' : ''} vence{parcelasHoje.length === 1 ? '' : 'm'} hoje
            </span>
          </div>
          <p className="text-xs text-gray-400 ml-6">
            {parcelasHoje.slice(0, 3).map(p => `${p.clienteNome} (${fmt(p.valor)})`).join(' • ')}
            {parcelasHoje.length > 3 ? ` e mais ${parcelasHoje.length - 3}...` : ''}
          </p>
        </div>
      )}
      {parcelasAtrasadasList.length > 0 && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-sm font-semibold text-red-300">
              {atrasadas} parcela{atrasadas > 1 ? 's' : ''} em atraso
            </span>
          </div>
          <p className="text-xs text-gray-400 ml-6">
            {parcelasAtrasadasList.slice(0, 3).map(p => `${p.clienteNome} (${fmt(p.valor)})`).join(' • ')}
            {atrasadas > 3 ? ` e mais ${atrasadas - 3}...` : ''}
          </p>
        </div>
      )}

      {/* ── GRID MÉTRICAS ── */}
      <div className="grid grid-cols-3 gap-3">
        {/* Clientes */}
        <button onClick={() => navigate('/clientes')}
          className="bg-dark-700 rounded-2xl p-4 border border-dark-500/50 flex flex-col items-center gap-1 active:scale-95 transition-transform">
          <div className="w-9 h-9 bg-primary-500/15 rounded-xl flex items-center justify-center mb-1">
            <Users className="w-5 h-5 text-primary-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">{totalClientes}</p>
          <p className="text-[11px] text-gray-400">Clientes</p>
        </button>

        {/* Contratos */}
        <button onClick={() => navigate('/parcelamentos')}
          className="bg-dark-700 rounded-2xl p-4 border border-dark-500/50 flex flex-col items-center gap-1 active:scale-95 transition-transform">
          <div className="w-9 h-9 bg-pix-500/15 rounded-xl flex items-center justify-center mb-1">
            <CreditCard className="w-5 h-5 text-pix-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">{totalContratos}</p>
          <p className="text-[11px] text-gray-400">Contratos</p>
        </button>

        {/* A Receber */}
        <button onClick={() => navigate('/parcelas')}
          className="bg-dark-700 rounded-2xl p-4 border border-dark-500/50 flex flex-col items-center gap-1 active:scale-95 transition-transform">
          <div className="w-9 h-9 bg-amber-500/15 rounded-xl flex items-center justify-center mb-1">
            <ArrowDownLeft className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-base font-extrabold text-white leading-tight">{fmt(aReceber)}</p>
          <p className="text-[11px] text-gray-400">A Receber</p>
        </button>
      </div>

      {/* ── GRÁFICO ── */}
      <div className="bg-dark-700 rounded-2xl p-4 border border-dark-500/50">
        <h3 className="text-sm font-semibold text-white mb-3">Recebimentos</h3>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3042" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #1e3042', backgroundColor: '#141f2e', color: '#f1f5f9', fontSize: 12 }}
                formatter={v => [fmt(v), 'Recebido']} />
              <Area type="monotone" dataKey="recebido" stroke="#10b981" strokeWidth={2.5} fill="url(#colorGreen)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── AÇÕES RÁPIDAS ── */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Ações Rápidas</h3>
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: CreditCard,    label: 'Contratos',  path: '/parcelamentos',  color: 'bg-primary-500/10 text-primary-400' },
            { icon: Receipt,       label: 'Receber',    path: '/parcelas',       color: 'bg-pix-500/10 text-pix-400' },
            { icon: Users,         label: 'Clientes',   path: '/clientes',       color: 'bg-amber-500/10 text-amber-400' },
            { icon: Headphones,    label: 'Suporte',    path: 'https://wa.me/5516992383821?text=Olá!%20Preciso%20de%20suporte%20no%20Parcelyx.', color: 'bg-pix-500/10 text-pix-400', external: true },
          ].map((action, i) => (
            <button key={i}
              onClick={() => action.external ? window.open(action.path, '_blank') : navigate(action.path)}
              className="flex flex-col items-center gap-2 active:scale-95 transition-transform">
              <div className={`w-14 h-14 ${action.color} border border-dark-500/30 bg-dark-700 rounded-2xl flex items-center justify-center`}>
                <action.icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] text-gray-400 font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── RECEBIMENTOS RECENTES ── */}
      <div className="bg-dark-700 rounded-2xl p-4 border border-dark-500/50">
        <h3 className="text-sm font-semibold text-white mb-3">Recebimentos recentes</h3>
        <div className="space-y-3">
          {recentes.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">Nenhum recebimento recente</p>
          ) : (
            recentes.map(item => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-dark-500/30 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-pix-500/10 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-pix-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-200">{item.clienteNome}</p>
                    <p className="text-xs text-gray-500">Parcela {item.numero}/{item.totalParcelas}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-pix-400">{fmt(item.valor)}</p>
                  <p className="text-xs text-gray-500">{new Date(item.dataPagamento).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  )
}
