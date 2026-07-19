import React, { useState, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { Check, Clock, AlertTriangle, Upload, X, Image, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Parcelas() {
  const { parcelas, marcarPago } = useApp()
  const [filter, setFilter] = useState('pendentes')
  const [showConfirm, setShowConfirm] = useState(null) // parcela selecionada
  const [uploading, setUploading] = useState(false)
  const [comprovante, setComprovante] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [visivel, setVisivel] = useState(15)
  const [viewComprovante, setViewComprovante] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setComprovante(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleConfirmarPagamento = async () => {
    if (!showConfirm) return
    setUploading(true)

    let comprovanteUrl = null

    // Upload do comprovante se tiver
    if (comprovante) {
      const ext = comprovante.name.split('.').pop()
      const fileName = `${showConfirm.id}_${Date.now()}.${ext}`
      const { data, error } = await supabase.storage
        .from('comprovantes')
        .upload(fileName, comprovante)

      if (!error && data) {
        const { data: urlData } = supabase.storage.from('comprovantes').getPublicUrl(fileName)
        comprovanteUrl = urlData?.publicUrl
      }
    }

    // Salva URL do comprovante na parcela ANTES de marcar como pago
    if (comprovanteUrl) {
      await supabase.from('parcelas')
        .update({ comprovante_url: comprovanteUrl })
        .eq('id', showConfirm.id)
    }

    // Marca como pago (recarrega dados do contexto)
    await marcarPago(showConfirm.id)

    setUploading(false)
    setShowConfirm(null)
    setComprovante(null)
    setPreviewUrl(null)
  }

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
          <button key={f.key} onClick={() => { setFilter(f.key); setVisivel(15) }}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              filter === f.key
                ? 'bg-primary-600 text-white'
                : 'bg-dark-700 text-gray-400 border border-dark-500 hover:border-primary-500/30'
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
        {filtered.slice(0, visivel).map(parcela => (
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
                  <button onClick={() => setShowConfirm(parcela)}
                    className="p-2 bg-pix-500/10 hover:bg-pix-500/20 rounded-lg transition-colors border border-pix-500/20"
                    title="Marcar como pago">
                    <Check className="w-4 h-4 text-pix-400" />
                  </button>
                )}
                {parcela.status === 'pago' && (parcela.comprovanteUrl || parcela.comprovante_url) && (
                  <button onClick={() => setViewComprovante(parcela.comprovanteUrl || parcela.comprovante_url)}
                    className="p-2 bg-primary-500/10 hover:bg-primary-500/20 rounded-lg transition-colors border border-primary-500/20"
                    title="Ver comprovante">
                    <Image className="w-4 h-4 text-primary-400" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length > visivel && (
        <button onClick={() => setVisivel(visivel + 15)}
          className="w-full py-3 bg-dark-700 hover:bg-dark-600 text-gray-400 font-medium rounded-xl border border-dark-500/50 transition-all">
          Carregar mais ({filtered.length - visivel} restantes)
        </button>
      )}

      {/* Modal visualizar comprovante */}
      {viewComprovante && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setViewComprovante(null)}>
          <div className="fixed inset-0 bg-black/80" />
          <div className="relative max-w-lg w-full animate-fade-in" onClick={e => e.stopPropagation()}>
            <button onClick={() => setViewComprovante(null)}
              className="absolute -top-10 right-0 p-2 text-white/70 hover:text-white">
              <X className="w-6 h-6" />
            </button>
            <img src={viewComprovante} alt="Comprovante" className="w-full rounded-2xl shadow-lg" />
            <a href={viewComprovante} target="_blank" rel="noreferrer"
              className="block text-center mt-3 text-sm text-primary-400 hover:text-primary-300">
              Abrir em nova aba
            </a>
          </div>
        </div>
      )}

      {/* Modal confirmar pagamento */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" onClick={() => { setShowConfirm(null); setComprovante(null); setPreviewUrl(null) }}>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-dark-800 w-full md:max-w-md md:rounded-2xl rounded-t-2xl border-t md:border border-dark-500/50 animate-slide-up p-5 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Confirmar pagamento</h3>
              <button onClick={() => { setShowConfirm(null); setComprovante(null); setPreviewUrl(null) }}
                className="p-1 rounded-lg hover:bg-dark-600 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-dark-700 rounded-xl p-4 border border-dark-500/50 mb-4">
              <p className="text-sm text-gray-400">Cliente</p>
              <p className="text-base font-semibold text-white">{showConfirm.clienteNome}</p>
              <div className="flex justify-between mt-2">
                <span className="text-sm text-gray-400">Parcela {showConfirm.numero}/{showConfirm.totalParcelas}</span>
                <span className="text-sm font-bold text-pix-400">{formatCurrency(showConfirm.valor)}</span>
              </div>
            </div>

            {/* Upload comprovante */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-300 mb-2">Comprovante (opcional)</p>
              {previewUrl ? (
                <div className="relative">
                  <img src={previewUrl} alt="Comprovante" className="w-full h-36 object-cover rounded-xl border border-dark-500/50" />
                  <button onClick={() => { setComprovante(null); setPreviewUrl(null) }}
                    className="absolute top-2 right-2 p-1.5 bg-dark-800/90 rounded-full text-gray-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button onClick={() => fileInputRef.current?.click()}
                  className="w-full py-6 border-2 border-dashed border-dark-500 rounded-xl flex flex-col items-center gap-2 hover:border-pix-500/50 transition-colors active:bg-dark-700">
                  <Image className="w-7 h-7 text-gray-500" />
                  <span className="text-sm text-gray-500">Anexar comprovante</span>
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileChange} />
            </div>

            {/* Botões */}
            <div className="flex gap-3">
              <button onClick={handleConfirmarPagamento} disabled={uploading}
                className="flex-1 py-3.5 bg-pix-500 hover:bg-pix-600 disabled:opacity-60 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {uploading ? 'Salvando...' : 'Confirmar'}
              </button>
              <button onClick={() => { setShowConfirm(null); setComprovante(null); setPreviewUrl(null) }}
                className="px-5 py-3.5 border border-dark-500 text-gray-400 rounded-xl hover:bg-dark-700">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
