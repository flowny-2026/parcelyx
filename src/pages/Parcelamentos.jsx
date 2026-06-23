import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Plus, X, CreditCard, Calendar, Percent as PercentIcon } from 'lucide-react'

export default function Parcelamentos() {
  const { parcelamentos, clientes, addParcelamento } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    clienteId: '', valorTotal: '', entrada: '', parcelas: '', juros: '', vencimento: '', observacoes: ''
  })

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const getStatusBadge = (status) => {
    const styles = {
      ativo: 'bg-blue-50 text-blue-700 border-blue-200',
      quitado: 'bg-green-50 text-green-700 border-green-200',
      atrasado: 'bg-red-50 text-red-700 border-red-200',
    }
    const labels = { ativo: 'Ativo', quitado: 'Quitado', atrasado: 'Atrasado' }
    return (
      <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const cliente = clientes.find(c => c.id === parseInt(form.clienteId))
    addParcelamento({
      ...form,
      clienteNome: cliente?.nome || '',
      valorTotal: parseFloat(form.valorTotal),
      entrada: parseFloat(form.entrada) || 0,
      parcelas: parseInt(form.parcelas),
      juros: parseFloat(form.juros) || 0,
      vencimento: parseInt(form.vencimento),
      status: 'ativo',
      dataCriacao: new Date().toISOString().split('T')[0],
    })
    setForm({ clienteId: '', valorTotal: '', entrada: '', parcelas: '', juros: '', vencimento: '', observacoes: '' })
    setShowForm(false)
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Parcelamentos</h1>
          <p className="text-sm text-neutral-500 mt-1">{parcelamentos.length} parcelamentos</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-xl transition-all shadow-sm"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span className="hidden sm:inline">{showForm ? 'Fechar' : 'Novo'}</span>
        </button>
      </div>

      {/* Form expansível */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-card animate-fade-in border-2 border-primary-200">
          <h2 className="text-lg font-bold text-neutral-900 mb-4">Criar novo parcelamento</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Cliente *</label>
              <select
                required
                value={form.clienteId}
                onChange={(e) => setForm({ ...form, clienteId: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm bg-white"
              >
                <option value="">Selecione um cliente</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Valor total *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={form.valorTotal}
                  onChange={(e) => setForm({ ...form, valorTotal: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm"
                  placeholder="0,00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Entrada</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.entrada}
                  onChange={(e) => setForm({ ...form, entrada: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm"
                  placeholder="0,00"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Parcelas *</label>
                <input
                  type="number"
                  required
                  value={form.parcelas}
                  onChange={(e) => setForm({ ...form, parcelas: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm"
                  placeholder="12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Juros %</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.juros}
                  onChange={(e) => setForm({ ...form, juros: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm"
                  placeholder="2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Dia venc. *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="31"
                  value={form.vencimento}
                  onChange={(e) => setForm({ ...form, vencimento: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm"
                  placeholder="15"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Observações</label>
              <textarea
                value={form.observacoes}
                onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm resize-none"
                rows={2}
                placeholder="Detalhes do parcelamento"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all shadow-sm"
              >
                Criar parcelamento
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 border border-neutral-200 text-neutral-600 font-semibold rounded-xl hover:bg-neutral-50 transition-all"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {parcelamentos.map(p => (
          <div key={p.id} className="bg-white rounded-2xl p-4 md:p-5 shadow-card card-hover">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900">{p.clienteNome}</h3>
                <p className="text-xs text-neutral-500 mt-0.5">{p.observacoes || 'Sem observações'}</p>
              </div>
              {getStatusBadge(p.status)}
            </div>
            <div className="grid grid-cols-3 gap-3 mt-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-neutral-400" />
                <div>
                  <p className="text-xs text-neutral-500">Valor</p>
                  <p className="text-sm font-semibold text-neutral-900">{formatCurrency(p.valorTotal)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-neutral-400" />
                <div>
                  <p className="text-xs text-neutral-500">Parcelas</p>
                  <p className="text-sm font-semibold text-neutral-900">{p.parcelas}x</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <PercentIcon className="w-4 h-4 text-neutral-400" />
                <div>
                  <p className="text-xs text-neutral-500">Juros</p>
                  <p className="text-sm font-semibold text-neutral-900">{p.juros}%</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
