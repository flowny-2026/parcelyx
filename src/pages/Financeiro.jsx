import React from 'react'
import { useApp } from '../context/AppContext'
import { TrendingUp, TrendingDown, DollarSign, AlertCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function Financeiro() {
  const { parcelas, getChartData } = useApp()
  const chartData = getChartData()

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const totalRecebido = parcelas
    .filter(p => p.status === 'pago')
    .reduce((sum, p) => sum + p.valor, 0)

  const totalPendente = parcelas
    .filter(p => p.status === 'pendente' || p.status === 'vence_hoje')
    .reduce((sum, p) => sum + p.valor, 0)

  const totalAtrasado = parcelas
    .filter(p => p.status === 'atrasado')
    .reduce((sum, p) => sum + p.valor, 0)

  const totalGeral = totalRecebido + totalPendente + totalAtrasado

  const cards = [
    { label: 'Total recebido', value: totalRecebido, icon: TrendingUp, color: 'text-pix-600', bg: 'bg-pix-50' },
    { label: 'A receber', value: totalPendente, icon: DollarSign, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'Em atraso', value: totalAtrasado, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Total geral', value: totalGeral, icon: TrendingDown, color: 'text-neutral-700', bg: 'bg-neutral-100' },
  ]

  // Recent transactions
  const transactions = parcelas
    .filter(p => p.status === 'pago' && p.dataPagamento)
    .sort((a, b) => new Date(b.dataPagamento) - new Date(a.dataPagamento))
    .slice(0, 10)

  return (
    <div className="space-y-6 pb-20 md:pb-0 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Financeiro</h1>
        <p className="text-sm text-neutral-500 mt-1">Controle financeiro simplificado</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 gap-3">
        {cards.map((card, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-card">
            <div className={`w-9 h-9 ${card.bg} rounded-xl flex items-center justify-center mb-2`}>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <p className="text-base md:text-lg font-bold text-neutral-900">{formatCurrency(card.value)}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl p-5 shadow-card">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Fluxo de caixa</h3>
        <div className="h-48 md:h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#737373' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#737373' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(value) => [formatCurrency(value), 'Recebido']}
              />
              <Bar dataKey="recebido" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-2xl p-5 shadow-card">
        <h3 className="text-base font-semibold text-neutral-900 mb-3">Distribuição</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-neutral-600">Recebido</span>
              <span className="font-medium text-pix-600">{totalGeral > 0 ? Math.round((totalRecebido / totalGeral) * 100) : 0}%</span>
            </div>
            <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
              <div className="h-full bg-pix-500 rounded-full transition-all" style={{ width: `${totalGeral > 0 ? (totalRecebido / totalGeral) * 100 : 0}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-neutral-600">A receber</span>
              <span className="font-medium text-primary-600">{totalGeral > 0 ? Math.round((totalPendente / totalGeral) * 100) : 0}%</span>
            </div>
            <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${totalGeral > 0 ? (totalPendente / totalGeral) * 100 : 0}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-neutral-600">Em atraso</span>
              <span className="font-medium text-red-600">{totalGeral > 0 ? Math.round((totalAtrasado / totalGeral) * 100) : 0}%</span>
            </div>
            <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${totalGeral > 0 ? (totalAtrasado / totalGeral) * 100 : 0}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-2xl p-5 shadow-card">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Últimas entradas</h3>
        <div className="space-y-2">
          {transactions.map(t => (
            <div key={t.id} className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-pix-50 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5 text-pix-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">{t.clienteNome}</p>
                  <p className="text-xs text-neutral-500">{new Date(t.dataPagamento).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-pix-600">+{formatCurrency(t.valor)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
