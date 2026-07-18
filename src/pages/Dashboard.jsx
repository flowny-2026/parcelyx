import React from 'react'
import { useApp } from '../context/AppContext'
import { TrendingUp, AlertTriangle, Clock, Percent, ArrowUpRight, ArrowDownRight, Users, CreditCard, DollarSign, Headphones, ChevronRight } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
  const { getStats, getRecebimentosRecentes, getChartData, userData } = useApp()
  const stats = getStats()
  const recentes = getRecebimentosRecentes()
  const chartData = getChartData()

  const nomeExibido = userData?.nome || userData?.negocio || 'Usuário'

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  return (
    <div className="space-y-5 pb-20 md:pb-0 animate-fade-in">
      {/* Header com saudação */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">Bem vindo,</p>
          <h1 className="text-xl font-bold text-white">{nomeExibido}</h1>
        </div>
      </div>

      {/* Card principal - Capital Exposto / Gradient */}
      <div className="gradient-card rounded-2xl p-5 relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-sm text-white/80 mb-1">Capital Exposto</p>
          <p className="text-3xl font-bold text-white">{formatCurrency(stats.totalAtrasado + stats.recebidoMes)}</p>
          <div className="mt-4 bg-white/15 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Minhas Finanças</p>
                <p className="text-xs text-white/70">Fluxo de caixa, lucro e transações em um toque</p>
              </div>
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <ChevronRight className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de resumo - estilo dark */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-dark-700 rounded-2xl p-4 border border-dark-500/50">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-pix-400" />
            <span className="text-lg font-bold text-white">{stats.vencendoHoje || 0}</span>
          </div>
          <p className="text-xs text-gray-400">Clientes</p>
        </div>
        <div className="bg-dark-700 rounded-2xl p-4 border border-dark-500/50">
          <div className="flex items-center justify-between mb-2">
            <CreditCard className="w-5 h-5 text-pix-400" />
            <span className="text-lg font-bold text-white">{stats.vencendoHoje || 0}</span>
          </div>
          <p className="text-xs text-gray-400">Contratos</p>
        </div>
      </div>

      {/* A Receber */}
      <div className="bg-dark-700 rounded-2xl p-4 border border-dark-500/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pix-500/10 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-pix-400" />
            </div>
            <span className="text-sm text-gray-400">A Receber</span>
          </div>
          <p className="text-xl font-bold text-white">{formatCurrency(stats.recebidoMes)}</p>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div>
        <h3 className="text-base font-semibold text-white mb-3">Ações Rápidas</h3>
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: CreditCard, label: 'Contratos', color: 'text-pix-400' },
            { icon: DollarSign, label: 'Receber', color: 'text-pix-400' },
            { icon: Users, label: 'Clientes', color: 'text-pix-400' },
            { icon: Headphones, label: 'Suporte', color: 'text-pix-400' },
          ].map((action, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 bg-dark-700 border border-dark-500/50 rounded-xl flex items-center justify-center">
                <action.icon className={`w-5 h-5 ${action.color}`} />
              </div>
              <span className="text-xs text-gray-400">{action.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats detalhados */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Recebido no mês', value: formatCurrency(stats.recebidoMes), icon: TrendingUp, color: 'text-pix-400', bg: 'bg-pix-500/10', trend: '+12%', trendUp: true },
          { label: 'Total em atraso', value: formatCurrency(stats.totalAtrasado), icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', trend: '-5%', trendUp: false },
          { label: 'Vencendo hoje', value: stats.vencendoHoje, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', trend: null },
          { label: 'Inadimplência', value: `${stats.inadimplencia}%`, icon: Percent, color: 'text-primary-400', bg: 'bg-primary-500/10', trend: '-2%', trendUp: false },
        ].map((card, i) => (
          <div key={i} className="bg-dark-700 rounded-2xl p-4 border border-dark-500/50 card-hover">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              {card.trend && (
                <span className={`flex items-center gap-0.5 text-xs font-medium ${card.trendUp ? 'text-pix-400' : 'text-red-400'}`}>
                  {card.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {card.trend}
                </span>
              )}
            </div>
            <p className="text-lg font-bold text-white">{card.value}</p>
            <p className="text-xs text-gray-400 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-dark-700 rounded-2xl p-5 border border-dark-500/50">
        <h3 className="text-base font-semibold text-white mb-4">Recebimentos</h3>
        <div className="h-48 md:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRecebido" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3042" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #1e3042', backgroundColor: '#141f2e', color: '#f1f5f9' }}
                formatter={(value) => [formatCurrency(value), 'Recebido']}
              />
              <Area type="monotone" dataKey="recebido" stroke="#10b981" strokeWidth={2.5} fill="url(#colorRecebido)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent payments */}
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
    </div>
  )
}
