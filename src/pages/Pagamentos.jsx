import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Check, X, Clock, ExternalLink, RefreshCw } from 'lucide-react'

export default function Pagamentos() {
  const [pagamentos, setPagamentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pendente')

  const fetchPagamentos = async () => {
    setLoading(true)
    let query = supabase
      .from('pagamentos')
      .select('*, users(negocio, email)')
      .order('created_at', { ascending: false })
    if (filter !== 'todos') {
      query = query.eq('status', filter)
    }
    const { data, error } = await query
    if (!error && data) setPagamentos(data)
    setLoading(false)
  }

  useEffect(() => { fetchPagamentos() }, [filter])

  const aprovarPagamento = async (pagamentoId) => {
    const confirmacao = window.confirm('Tem certeza que deseja APROVAR este pagamento?')
    if (!confirmacao) return
    const { error } = await supabase.from('pagamentos')
      .update({ status: 'aprovado', data_pagamento: new Date().toISOString().split('T')[0] })
      .eq('id', pagamentoId)
    if (!error) { alert('✅ Pagamento aprovado!'); fetchPagamentos() }
    else alert('❌ Erro: ' + error.message)
  }

  const recusarPagamento = async (pagamentoId) => {
    const motivo = window.prompt('Motivo da recusa (opcional):')
    const { error } = await supabase.from('pagamentos')
      .update({ status: 'recusado', observacoes: motivo || 'Recusado pelo administrador' })
      .eq('id', pagamentoId)
    if (!error) { alert('❌ Pagamento recusado.'); fetchPagamentos() }
    else alert('❌ Erro: ' + error.message)
  }

  const formatCurrency = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR') : '—'

  const getStatusBadge = (status) => {
    const styles = {
      pendente: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      aprovado: 'bg-pix-500/10 text-pix-400 border-pix-500/30',
      recusado: 'bg-red-500/10 text-red-400 border-red-500/30',
    }
    const labels = { pendente: 'Pendente', aprovado: 'Aprovado', recusado: 'Recusado' }
    const icons = {
      pendente: <Clock className="w-3 h-3" />,
      aprovado: <Check className="w-3 h-3" />,
      recusado: <X className="w-3 h-3" />,
    }
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${styles[status]}`}>
        {icons[status]} {labels[status]}
      </span>
    )
  }

  return (
    <div className="space-y-5 pb-20 md:pb-0 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Gerenciar Pagamentos</h1>
          <p className="text-sm text-gray-400 mt-1">Aprove ou recuse solicitações de assinatura</p>
        </div>
        <button onClick={fetchPagamentos}
          className="flex items-center gap-2 px-4 py-2.5 bg-dark-700 hover:bg-dark-600 text-gray-300 text-sm font-medium rounded-xl transition-all border border-dark-500">
          <RefreshCw className="w-4 h-4" /> Atualizar
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { value: 'pendente', label: 'Pendentes' },
          { value: 'aprovado', label: 'Aprovados' },
          { value: 'todos', label: 'Todos' }
        ].map(({ value, label }) => (
          <button key={value} onClick={() => setFilter(value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              filter === value
                ? 'bg-pix-500 text-white'
                : 'bg-dark-700 text-gray-400 border border-dark-500 hover:border-pix-500/30'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 text-pix-400 animate-spin" />
        </div>
      ) : pagamentos.length === 0 ? (
        <div className="text-center py-12 bg-dark-700 rounded-2xl border border-dark-500/50">
          <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500">Nenhum pagamento encontrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pagamentos.map(pag => (
            <div key={pag.id} className="bg-dark-700 rounded-2xl p-4 md:p-5 border border-dark-500/50">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-base font-bold text-white">{pag.nome_cliente}</h3>
                    {getStatusBadge(pag.status)}
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-400"><span className="font-medium text-gray-300">E-mail:</span> {pag.email_cliente}</p>
                    {pag.telefone_cliente && <p className="text-gray-400"><span className="font-medium text-gray-300">Tel:</span> {pag.telefone_cliente}</p>}
                    {pag.users?.negocio && <p className="text-gray-400"><span className="font-medium text-gray-300">Negócio:</span> {pag.users.negocio}</p>}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-3 bg-dark-600 rounded-xl border border-dark-500/30">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Plano</p>
                  <p className="text-sm font-semibold text-white capitalize">{pag.plano}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Valor</p>
                  <p className="text-sm font-semibold text-white">{formatCurrency(pag.valor)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Solicitado</p>
                  <p className="text-sm font-semibold text-white">{formatDate(pag.created_at)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Expira</p>
                  <p className="text-sm font-semibold text-white">{formatDate(pag.data_expiracao)}</p>
                </div>
              </div>

              {pag.observacoes && (
                <div className="mb-4 p-3 bg-primary-500/10 border border-primary-500/20 rounded-xl">
                  <p className="text-xs font-medium text-primary-300 mb-1">Observações:</p>
                  <p className="text-sm text-primary-200">{pag.observacoes}</p>
                </div>
              )}

              {pag.comprovante_url && (
                <a href={pag.comprovante_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mb-4 px-3 py-2 bg-dark-600 hover:bg-dark-500 text-gray-300 text-sm rounded-lg transition-colors border border-dark-500">
                  <ExternalLink className="w-4 h-4" /> Ver comprovante
                </a>
              )}

              {pag.status === 'pendente' && (
                <div className="flex gap-3">
                  <button onClick={() => aprovarPagamento(pag.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-pix-500 hover:bg-pix-600 text-white text-sm font-semibold rounded-xl transition-all">
                    <Check className="w-4 h-4" /> Aprovar
                  </button>
                  <button onClick={() => recusarPagamento(pag.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-all">
                    <X className="w-4 h-4" /> Recusar
                  </button>
                </div>
              )}

              {pag.status === 'aprovado' && pag.data_pagamento && (
                <div className="p-3 bg-pix-500/10 border border-pix-500/20 rounded-xl text-center">
                  <p className="text-sm text-pix-400">✅ Aprovado em {formatDate(pag.data_pagamento)}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
