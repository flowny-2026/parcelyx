import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Plus, Search, Phone, User, X, ChevronRight } from 'lucide-react'

export default function Clientes() {
  const { clientes, addCliente } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [filtro, setFiltro] = useState('todos')
  const [form, setForm] = useState({ nome: '', telefone: '', cpf: '', endereco: '', observacoes: '' })

  const filtered = clientes.filter(c =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    c.telefone.includes(search) ||
    c.cpf.includes(search)
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    addCliente(form)
    setForm({ nome: '', telefone: '', cpf: '', endereco: '', observacoes: '' })
    setShowForm(false)
  }

  const inputClass = "w-full px-4 py-3 rounded-xl bg-dark-700 border border-dark-500 focus:border-pix-500 focus:ring-2 focus:ring-pix-500/20 outline-none text-sm text-gray-200 placeholder-gray-500"

  return (
    <div className="space-y-5 pb-20 md:pb-0 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Clientes</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-xl transition-all">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span className="hidden sm:inline">{showForm ? 'Fechar' : 'Novo Cliente'}</span>
        </button>
      </div>

      {/* Card total de clientes */}
      <div className="bg-dark-700 rounded-2xl p-4 border border-primary-500/30">
        <div className="flex items-center gap-3 mb-2">
          <User className="w-5 h-5 text-primary-400" />
          <span className="text-sm text-gray-400">Total de clientes</span>
        </div>
        <p className="text-3xl font-bold text-primary-400">{clientes.length}</p>
        <p className="text-xs text-gray-500">cliente{clientes.length !== 1 ? 's' : ''} cadastrado{clientes.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input type="text" placeholder="Buscar por cliente..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-dark-700 rounded-xl border border-dark-500 focus:border-pix-500 focus:ring-2 focus:ring-pix-500/20 outline-none text-sm text-gray-200 placeholder-gray-500" />
      </div>

      {/* Filtros - badges */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'todos', label: 'Todos', count: clientes.length },
          { key: 'bom', label: 'Bom pagador', count: clientes.length },
          { key: 'neutro', label: 'Neutro', count: 0 },
          { key: 'mau', label: 'Mau pagador', count: 0 },
        ].map(f => (
          <button key={f.key} onClick={() => setFiltro(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filtro === f.key
                ? 'bg-primary-600 text-white'
                : 'bg-dark-700 text-gray-400 border border-dark-500 hover:border-primary-500/30'
            }`}>
            {f.label} {f.count > 0 && <span className="ml-1 font-bold">{f.count}</span>}
          </button>
        ))}
      </div>

      {/* Form expansível */}
      {showForm && (
        <div className="bg-dark-700 rounded-2xl p-4 md:p-6 border border-pix-500/30 animate-fade-in">
          <h2 className="text-lg font-bold text-white mb-4">Cadastrar novo cliente</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Nome completo *</label>
                <input type="text" required value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className={inputClass} placeholder="Digite o nome completo" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Telefone / WhatsApp *</label>
                <input type="tel" required value={form.telefone}
                  onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                  className={inputClass} placeholder="(00) 00000-0000" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">CPF (opcional)</label>
                <input type="text" value={form.cpf}
                  onChange={(e) => setForm({ ...form, cpf: e.target.value })}
                  className={inputClass} placeholder="000.000.000-00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Endereço (opcional)</label>
                <input type="text" value={form.endereco}
                  onChange={(e) => setForm({ ...form, endereco: e.target.value })}
                  className={inputClass} placeholder="Rua, número, bairro, cidade" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Observações</label>
              <textarea value={form.observacoes}
                onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                className={inputClass + " resize-none"} rows={2} placeholder="Anotações sobre o cliente" />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button type="submit" className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all">
                Cadastrar Cliente
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="sm:w-auto px-6 py-3 border border-dark-500 text-gray-400 font-semibold rounded-xl hover:bg-dark-600 transition-all">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Client list */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-8">Nenhum cliente encontrado</p>
        )}
        {filtered.map(cliente => (
          <div key={cliente.id} className="bg-dark-700 rounded-xl p-4 border border-dark-500/50 card-hover">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pix-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-pix-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white truncate">{cliente.nome}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-pix-500/10 text-pix-400 border border-pix-500/20">
                    ● Bom pagador
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <Phone className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-400">{cliente.telefone}</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </div>
          </div>
        ))}
      </div>

      {/* Botão flutuante mobile */}
      {!showForm && (
        <div className="md:hidden fixed bottom-20 left-4 right-4 z-40">
          <button onClick={() => setShowForm(true)}
            className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-glow-blue">
            <Plus className="w-5 h-5" /> Novo Cliente
          </button>
        </div>
      )}
    </div>
  )
}
