import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Plus, Search, Phone, User, X, ChevronRight, Edit3, Trash2, MessageSquare, ArrowLeft } from 'lucide-react'

export default function Clientes() {
  const { clientes, addCliente, editCliente, removeCliente } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [filtro, setFiltro] = useState('todos')
  const [form, setForm] = useState({ nome: '', telefone: '', cpf: '', endereco: '', observacoes: '' })
  const [selectedClient, setSelectedClient] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState({})

  const filtered = clientes.filter(c =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    c.telefone.includes(search) ||
    (c.cpf && c.cpf.includes(search))
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    addCliente(form)
    setForm({ nome: '', telefone: '', cpf: '', endereco: '', observacoes: '' })
    setShowForm(false)
  }

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      removeCliente(id)
      setSelectedClient(null)
    }
  }

  const handleEdit = () => {
    editCliente(selectedClient.id, editForm)
    setSelectedClient({ ...selectedClient, ...editForm })
    setEditMode(false)
  }

  const inputClass = "w-full px-4 py-3 rounded-xl bg-dark-700 border border-dark-500 focus:border-pix-500 focus:ring-2 focus:ring-pix-500/20 outline-none text-sm text-gray-200 placeholder-gray-500"

  // ══════════════════════════════════════════════════════
  // TELA DE DETALHES DO CLIENTE
  // ══════════════════════════════════════════════════════
  if (selectedClient) return (
    <div className="space-y-5 pb-20 md:pb-0 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => { setSelectedClient(null); setEditMode(false) }}
          className="p-2 rounded-lg hover:bg-dark-600 text-gray-400">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-white">Cliente</h1>
      </div>

      {/* Card info do cliente */}
      <div className="bg-dark-700 rounded-2xl p-5 border border-dark-500/50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-500/10 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-primary-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">{selectedClient.nome}</h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-pix-500/10 text-pix-400 border border-pix-500/20 mt-1">
              ● Bom pagador
            </span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setEditMode(true); setEditForm({ nome: selectedClient.nome, telefone: selectedClient.telefone, cpf: selectedClient.cpf || '', endereco: selectedClient.endereco || '', observacoes: selectedClient.observacoes || '' }) }}
              className="p-2 rounded-lg bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 border border-primary-500/20">
              <Edit3 className="w-4 h-4" />
            </button>
            <button onClick={() => handleDelete(selectedClient.id)}
              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Editar cliente */}
      {editMode && (
        <div className="bg-dark-700 rounded-2xl p-5 border border-primary-500/30 animate-fade-in">
          <h3 className="text-base font-semibold text-white mb-4">Editar cliente</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Nome</label>
              <input type="text" value={editForm.nome || ''} onChange={e => setEditForm({...editForm, nome: e.target.value})} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Telefone</label>
              <input type="tel" value={editForm.telefone || ''} onChange={e => setEditForm({...editForm, telefone: e.target.value})} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">CPF</label>
              <input type="text" value={editForm.cpf || ''} onChange={e => setEditForm({...editForm, cpf: e.target.value})} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Endereço</label>
              <input type="text" value={editForm.endereco || ''} onChange={e => setEditForm({...editForm, endereco: e.target.value})} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Observações</label>
              <textarea value={editForm.observacoes || ''} onChange={e => setEditForm({...editForm, observacoes: e.target.value})} className={inputClass + " resize-none"} rows={2} />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleEdit} className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl">Salvar</button>
              <button onClick={() => setEditMode(false)} className="px-6 py-3 border border-dark-500 text-gray-400 rounded-xl hover:bg-dark-600">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Informações */}
      {!editMode && (
        <div className="bg-dark-700 rounded-2xl p-5 border border-dark-500/50 space-y-4">
          <h3 className="text-base font-semibold text-white">Informações</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Telefone</span>
              <span className="text-sm text-gray-200">{selectedClient.telefone || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">CPF</span>
              <span className="text-sm text-gray-200">{selectedClient.cpf || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Endereço</span>
              <span className="text-sm text-gray-200">{selectedClient.endereco || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Observações</span>
              <span className="text-sm text-gray-200">{selectedClient.observacoes || '—'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Ações */}
      <div className="flex flex-col gap-3">
        <a href={`https://wa.me/55${(selectedClient.telefone || '').replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
          className="w-full py-3.5 bg-pix-500 hover:bg-pix-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all">
          <MessageSquare className="w-4 h-4" /> Enviar WhatsApp
        </a>
        <button onClick={() => handleDelete(selectedClient.id)}
          className="w-full py-3 border border-red-500/30 text-red-400 font-semibold rounded-xl hover:bg-red-500/10 transition-all">
          Excluir cliente
        </button>
      </div>
    </div>
  )

  // ══════════════════════════════════════════════════════
  // LISTA DE CLIENTES
  // ══════════════════════════════════════════════════════
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
          <div key={cliente.id} onClick={() => setSelectedClient(cliente)}
            className="bg-dark-700 rounded-xl p-4 border border-dark-500/50 card-hover cursor-pointer">
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
