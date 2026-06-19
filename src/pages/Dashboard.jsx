import React from 'react'
import { useApp } from '../context/AppContext'
import { TrendingUp, AlertTriangle, Clock, Percent, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
  const { getStats, getRecebimentosRecentes, getChartData } = useApp()
  const stats = getStats()
  const recentes = getRecebimentosRecentes()
  const chartData = getChartData()

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const statCards = [
    {
      label: 'Recebido no mês',
      value: formatCurrency(stats.recebidoMes),
      icon: TrendingUp,
      color: 'text-pix-600',
      bg: 'bg-pix-50',
      trend: '+12%',
      trendUp: true,
    },
    {
      label: 'Total em atraso',
      value: formatCurrency(stats.totalAtrasado),
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      trend: '-5%',
      trendUp: false,
    },
    {
      label: 'Vencendo hoje',
      value: stats.vencendoHoje,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      trend: null,
      trendUp: null,
    },
    {
      label: 'Inadimplência',
      value: `${stats.inadimplencia}%`,
      icon: Percent,
      color: 'text-primary-600',
      bg: 'bg-primary-50',
      trend: '-2%',
      trendUp: false,
    },
  ]

  return (
    <div className="space-y-6 pb-20 md:pb-0 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-sm text-neutral-500 mt-1">Visão geral do seu negócio</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 md:p-5 shadow-card card-hover">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              {card.trend && (
                <span className={`flex items-center gap-0.5 text-xs font-medium ${card.trendUp ? 'text-pix-600' : 'text-red-500'}`}>
                  {card.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {card.trend}
                </span>
              )}
            </div>
            <p className="text-lg md:text-xl font-bold text-neutral-900">{card.value}</p>
            <p className="text-xs text-neutral-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl p-5 md:p-6 shadow-card">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Recebimentos</h3>
        <div className="h-48 md:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRecebido" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#737373' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#737373' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(value) => [formatCurrency(value), 'Recebido']}
              />
              <Area type="monotone" dataKey="recebido" stroke="#2563eb" strokeWidth={2.5} fill="url(#colorRecebido)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent payments */}
      <div className="bg-white rounded-2xl p-5 md:p-6 shadow-card">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Recebimentos recentes</h3>
        <div className="space-y-3">
          {recentes.length === 0 ? (
            <p className="text-sm text-neutral-500 text-center py-4">Nenhum recebimento recente</p>
          ) : (
            recentes.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-pix-50 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-pix-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{item.clienteNome}</p>
                    <p className="text-xs text-neutral-500">Parcela {item.numero}/{item.totalParcelas}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-pix-600">{formatCurrency(item.valor)}</p>
                  <p className="text-xs text-neutral-400">{new Date(item.dataPagamento).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
