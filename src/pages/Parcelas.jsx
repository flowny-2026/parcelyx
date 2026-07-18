import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Check, Clock, AlertTriangle } from 'lucide-react'

export default function Parcelas() {
  const { parcelas, marcarPago } = useApp()
  const [filter, setFilter] = useState('todas')

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const filtered = parcelas.filter(p => {
    if (filter === 'todas') return true
    if (filter === 'pendentes') return p.status === 'pendente' || p.status === 'vence_hoje'
    if (filter === 'pagas') return p.status === 'pago'
    if (filter === 'atrasadas') return p.status === 'atrasado'
    return true
  })

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pago': return <Check className="w-4 h-4 text-pix-400" />
      case 'pendente': return <Clock className="w-4 h-4 text-amber-400" />
      case 'vence_hoje': return <Clock className="w-4 h-4 text-orange-400" />
      case 'atrasado': return <AlertTriangle className="w-4 h-4 text-red-400" />
      default: return null
    }
  }

  const getStatusLabel = (status) => {
    const labels = { pago: 'Pago', pendente: 'Pendente', vence_hoje: 'Vence hoje', atrasado: 'Atrasado' }
    return labels[status] || status
  }

  const getStatusStyle = (status) => {
    const styles = {
      pago: 'bg-pix-500/10 text-pix-400 border-pix-500/30',
      pendente: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      vence_hoje: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      atrasado: 'bg-red-500/10 text-red-400 border-red-500/30',
    }
    return styles[status] || ''
  }

  const filters = [
    { key: 'todas', label: 'Todas' },
    { key: 'pendentes', label: 'Pendentes' },
    { key: 'atrasadas', label: 'Atrasadas' },
    { key: 'pagas', label: 'Pagas' },
  ]

  return (
    <div className="space-y-5 pb-20 md:pb-0 animate-fade-in">
      <h1 className="text-xl font-bold text-white">Parcelas</h1>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {filters.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              filter === f.key
                ? 'bg-pix-500 text-white'
                : 'bg-dark-700 text-gray-400 border border-dark-500 hover:border-pix-500/30'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-dark-700 rounded-xl p-3 border border-dark-500/50 text-center">
          <p className="text-lg font-bold text-amber-400">{parcelas.filter(p => p.status === 'pendente' || p.status === 'vence_hoje').length}</p>
          <p className="text-xs text-gray-500">Pendentes</p>
        </div>
        <div className="bg-dark-700 rounded-xl p-3 border border-dark-500/50 text-center">
          <p className="text-lg font-bold text-red-400">{parcelas.filter(p => p.status === 'atrasado').length}</p>
          <p className="text-xs text-gray-500">Atrasadas</p>
        </div>
        <div className="bg-dark-700 rounded-xl p-3 border border-dark-500/50 text-center">
          <p className="text-lg font-bold text-pix-400">{parcelas.filter(p => p.status === 'pago').length}</p>
          <p className="text-xs text-gray-500">Pagas</p>
        </div>
      </div>

      {/* Parcelas list */}
      <div className="space-y-2">
        {filtered.slice(0, 30).map(parcela => (
          <div key={parcela.id} className="bg-dark-700 rounded-2xl p-4 border border-dark-500/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  parcela.status === 'pago' ? 'bg-pix-500/10' :
                  parcela.status === 'atrasado' ? 'bg-red-500/10' : 'bg-amber-500/10'
                }`}>
                  {getStatusIcon(parcela.status)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-200 truncate">{parcela.clienteNome}</p>
                  <p className="text-xs text-gray-500">
                    Parcela {parcela.numero}/{parcela.totalParcelas} • Venc: {new Date(parcela.vencimento).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">{formatCurrency(parcela.valor)}</p>
                  <span className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded-full border ${getStatusStyle(parcela.status)}`}>
                    {getStatusLabel(parcela.status)}
                  </span>
                </div>
                {parcela.status !== 'pago' && (
                  <button onClick={() => marcarPago(parcela.id)}
                    className="p-2 bg-pix-500/10 hover:bg-pix-500/20 rounded-lg transition-colors border border-pix-500/20"
                    title="Marcar como pago">
                    <Check className="w-4 h-4 text-pix-400" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length > 30 && (
        <p className="text-center text-sm text-gray-500">Mostrando 30 de {filtered.length} parcelas</p>
      )}
    </div>
  )
}
