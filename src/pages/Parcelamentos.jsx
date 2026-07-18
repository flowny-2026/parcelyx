import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Plus, X, CreditCard, Calendar, Percent as PercentIcon, User } from 'lucide-react'

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
      ativo: 'bg-primary-500/10 text-primary-400 border-primary-500/30',
      quitado: 'bg-pix-500/10 text-pix-400 border-pix-500/30',
      atrasado: 'bg-red-500/10 text-red-400 border-red-500/30',
    }
    const labels = { ativo: 'Em Aberto', quitado: 'Quitado', atrasado: 'Atrasado' }
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

  const inputClass = "w-full px-4 py-3 rounded-xl bg-dark-700 border border-dark-500 focus:border-pix-500 focus:ring-2 focus:ring-pix-500/20 outline-none text-sm text-gray-200 placeholder-gray-500"

  return (
    <div className="space-y-5 pb-20 md:pb-0 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Contratos</h1>
          <p className="text-sm text-gray-400 mt-1">{parcelamentos.length} contratos</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-xl transition-all">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span className="hidden sm:inline">{showForm ? 'Fechar' : 'Novo'}</span>
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-dark-700 rounded-2xl p-4 md:p-6 border border-pix-500/30 animate-fade-in">
          <h2 className="text-lg font-bold text-white mb-4">Novo contrato</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Cliente *</label>
              <select required value={form.clienteId}
                onChange={(e) => setForm({ ...form, clienteId: e.target.value })}
                className={inputClass + " bg-dark-700"}>
                <option value="">Selecione um cliente</option>
                {clientes.map(c => (<option key={c.id} value={c.id}>{c.nome}</option>))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Valor total *</label>
                <input type="number" required step="0.01" value={form.valorTotal}
                  onChange={(e) => setForm({ ...form, valorTotal: e.target.value })}
                  className={inputClass} placeholder="0,00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Entrada</label>
                <input type="number" step="0.01" value={form.entrada}
                  onChange={(e) => setForm({ ...form, entrada: e.target.value })}
                  className={inputClass} placeholder="0,00" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Parcelas *</label>
                <input type="number" required value={form.parcelas}
                  onChange={(e) => setForm({ ...form, parcelas: e.target.value })}
                  className={inputClass} placeholder="12" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Juros %</label>
                <input type="number" step="0.1" value={form.juros}
                  onChange={(e) => setForm({ ...form, juros: e.target.value })}
                  className={inputClass} placeholder="2" />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Dia venc. *</label>
                <input type="number" required min="1" max="31" value={form.vencimento}
                  onChange={(e) => setForm({ ...form, vencimento: e.target.value })}
                  className={inputClass} placeholder="15" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Observações</label>
              <textarea value={form.observacoes}
                onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                className={inputClass + " resize-none"} rows={2} placeholder="Detalhes do contrato" />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button type="submit" className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all">
                Criar contrato
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="sm:w-auto px-6 py-3 border border-dark-500 text-gray-400 font-semibold rounded-xl hover:bg-dark-600 transition-all">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {parcelamentos.map(p => (
          <div key={p.id} className="bg-dark-700 rounded-2xl p-4 md:p-5 border border-dark-500/50 card-hover">
            {/* Header do card */}
            <div className="flex items-start justify-between mb-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-500/10 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Cliente do contrato</p>
                  <h3 className="text-sm font-semibold text-white">{p.clienteNome}</h3>
                </div>
              </div>
              {getStatusBadge(p.status)}
            </div>

            <p className="text-xs text-gray-500 mt-2 mb-3">
              Contrato #{p.id} • {p.dataCriacao ? new Date(p.dataCriacao).toLocaleDateString('pt-BR') : ''}
            </p>

            {/* Info grid - estilo detalhes do contrato */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 pt-3 border-t border-dark-500/30">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Valor emprestado</p>
                <p className="text-sm font-semibold text-white">{formatCurrency(p.valorTotal)}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Taxa de juros</p>
                <p className="text-sm font-semibold text-white">{p.juros}%</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Parcelas</p>
                <p className="text-sm font-semibold text-white">{p.parcelas}x</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Dia vencimento</p>
                <p className="text-sm font-semibold text-white">Dia {p.vencimento}</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3 pt-3 border-t border-dark-500/30">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500">Progresso do contrato</span>
                <span className="text-xs font-medium text-primary-400">0%</span>
              </div>
              <div className="h-1.5 bg-dark-600 rounded-full overflow-hidden">
                <div className="h-full bg-primary-500 rounded-full" style={{ width: '0%' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
