import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Check, Clock, AlertTriangle, Filter } from 'lucide-react'

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
      case 'pago': return <Check className="w-4 h-4 text-green-600" />
      case 'pendente': return <Clock className="w-4 h-4 text-amber-500" />
      case 'vence_hoje': return <Clock className="w-4 h-4 text-orange-500" />
      case 'atrasado': return <AlertTriangle className="w-4 h-4 text-red-500" />
      default: return null
    }
  }

  const getStatusLabel = (status) => {
    const labels = {
      pago: 'Pago',
      pendente: 'Pendente',
      vence_hoje: 'Vence hoje',
      atrasado: 'Atrasado',
    }
    return labels[status] || status
  }

  const getStatusStyle = (status) => {
    const styles = {
      pago: 'bg-green-50 text-green-700 border-green-200',
      pendente: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      vence_hoje: 'bg-orange-50 text-orange-700 border-orange-200',
      atrasado: 'bg-red-50 text-red-700 border-red-200',
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
    <div className="space-y-6 pb-20 md:pb-0 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Parcelas</h1>
        <p className="text-sm text-neutral-500 mt-1">Gerencie todas as parcelas</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              filter === f.key
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white text-neutral-600 border border-neutral-200 hover:border-primary-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-3 shadow-card text-center">
          <p className="text-lg font-bold text-amber-600">{parcelas.filter(p => p.status === 'pendente' || p.status === 'vence_hoje').length}</p>
          <p className="text-xs text-neutral-500">Pendentes</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-card text-center">
          <p className="text-lg font-bold text-red-600">{parcelas.filter(p => p.status === 'atrasado').length}</p>
          <p className="text-xs text-neutral-500">Atrasadas</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-card text-center">
          <p className="text-lg font-bold text-green-600">{parcelas.filter(p => p.status === 'pago').length}</p>
          <p className="text-xs text-neutral-500">Pagas</p>
        </div>
      </div>

      {/* Parcelas list */}
      <div className="space-y-2">
        {filtered.slice(0, 30).map(parcela => (
          <div key={parcela.id} className="bg-white rounded-2xl p-4 shadow-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  parcela.status === 'pago' ? 'bg-green-50' :
                  parcela.status === 'atrasado' ? 'bg-red-50' : 'bg-amber-50'
                }`}>
                  {getStatusIcon(parcela.status)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">{parcela.clienteNome}</p>
                  <p className="text-xs text-neutral-500">
                    Parcela {parcela.numero}/{parcela.totalParcelas} • Venc: {new Date(parcela.vencimento).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-right">
                  <p className="text-sm font-semibold text-neutral-900">{formatCurrency(parcela.valor)}</p>
                  <span className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded-full border ${getStatusStyle(parcela.status)}`}>
                    {getStatusLabel(parcela.status)}
                  </span>
                </div>
                {parcela.status !== 'pago' && (
                  <button
                    onClick={() => marcarPago(parcela.id)}
                    className="p-2 bg-pix-50 hover:bg-pix-100 rounded-lg transition-colors"
                    title="Marcar como pago"
                  >
                    <Check className="w-4 h-4 text-pix-600" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length > 30 && (
        <p className="text-center text-sm text-neutral-500">Mostrando 30 de {filtered.length} parcelas</p>
      )}
    </div>
  )
}
