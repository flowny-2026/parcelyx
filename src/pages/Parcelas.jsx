import React, { useState, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { Check, Clock, AlertTriangle, Upload, X, Image, Loader2 } from 'lucide-react'
import { supabase, updateParcelamento } from '../lib/supabase'

export default function Parcelas() {
  const { parcelas, parcelamentos, userData, loadAllData } = useApp()
  const [filter, setFilter] = useState('pendentes')
  const [showConfirm, setShowConfirm] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [comprovante, setComprovante] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [visivel, setVisivel] = useState(15)
  const [viewComprovante, setViewComprovante] = useState(null)
  const [tipoPagamento, setTipoPagamento] = useState('total')
  const [valorParcial, setValorParcial] = useState('')
  const [proximoVencimento, setProximoVencimento] = useState('')
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    // Validação: máximo 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert('Arquivo muito grande. Máximo permitido: 5MB.')
      e.target.value = ''
      return
    }
    // Validação: apenas imagens e PDF
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf']
    if (!tiposPermitidos.includes(file.type) && !file.type.startsWith('image/')) {
      alert('Formato não suportado. Use JPG, PNG, WebP ou PDF.')
      e.target.value = ''
      return
    }
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

    // Salva URL do comprovante
    if (comprovanteUrl) {
      await supabase.from('parcelas')
        .update({ comprovante_url: comprovanteUrl })
        .eq('id', showConfirm.id)
    }

    // Valor devido considerando multa por atraso (se houver). É a base de tudo.
    const valorDevido = calcularValorComMulta(showConfirm)

    if (tipoPagamento === 'parcial' && valorParcial) {
      const valorPago = parseFloat(valorParcial)
      if (valorPago <= 0 || isNaN(valorPago)) { setUploading(false); return }
      
      // Validação: não permitir valor absurdo (máx 10x o valor devido)
      if (valorPago > valorDevido * 10) {
        alert('Valor informado é muito superior ao valor da parcela. Verifique.')
        setUploading(false)
        return
      }
      
      const valorOriginal = valorDevido
      const diferenca = valorOriginal - valorPago

      // Se pagou menos e não há parcelas pendentes e não escolheu data, avisa
      const parcelasPendentesContrato = parcelas.filter(p =>
        p.parcelamentoId === showConfirm.parcelamentoId &&
        p.status !== 'pago' &&
        p.id !== showConfirm.id
      )
      if (diferenca > 0 && parcelasPendentesContrato.length === 0 && !proximoVencimento) {
        alert('Não há parcelas pendentes no contrato. Selecione a data do próximo vencimento para o valor restante.')
        setUploading(false)
        return
      }

      // VERIFICAÇÃO DE CONCORRÊNCIA: confirma que a parcela ainda está pendente
      const { data: parcelaAtual } = await supabase.from('parcelas')
        .select('status').eq('id', showConfirm.id).single()
      
      if (parcelaAtual?.status === 'pago') {
        alert('Esta parcela já foi paga por outra operação.')
        setUploading(false)
        setShowConfirm(null)
        await loadAllData()
        return
      }

      // Marca parcela atual como paga com o valor informado
      // .neq('status','pago') casa com qualquer status não-pago (pendente, atrasado, vence_hoje)
      // e previne double-pay. .select() permite conferir se alguma linha foi de fato atualizada.
      const { data: parcelaPagaData, error: updateError } = await supabase.from('parcelas')
        .update({ 
          status: 'pago', 
          data_pagamento: new Date().toISOString().split('T')[0],
          valor: valorPago
        })
        .eq('id', showConfirm.id)
        .neq('status', 'pago') // previne double-pay via condição WHERE
        .select()

      if (updateError) {
        alert('Erro ao processar pagamento. Tente novamente.')
        setUploading(false)
        return
      }

      // Se nenhuma linha foi atualizada, a parcela já estava paga — aborta sem redistribuir
      if (!parcelaPagaData || parcelaPagaData.length === 0) {
        alert('Esta parcela já foi paga por outra operação.')
        setUploading(false)
        setShowConfirm(null)
        await loadAllData()
        return
      }

      // Se pagou menos — redistribui o restante + juros nas parcelas pendentes existentes
      if (diferenca > 0) {
        const contrato = parcelamentos.find(p => p.id === showConfirm.parcelamentoId)
        const juros = contrato?.juros || 0

        // Busca as parcelas pendentes do contrato (exceto a atual, já paga)
        const parcelasPendentes = parcelas
          .filter(p =>
            p.parcelamentoId === showConfirm.parcelamentoId &&
            p.status !== 'pago' &&
            p.id !== showConfirm.id
          )
          .sort((a, b) => new Date(a.vencimento) - new Date(b.vencimento))

        if (parcelasPendentes.length > 0) {
          // Soma o total ainda devido nas parcelas pendentes + o restante com juros
          const totalPendenteAtual = parcelasPendentes.reduce((sum, p) => sum + p.valor, 0)
          const restanteComJuros = Math.round(diferenca * (1 + juros / 100) * 100) / 100
          const novoTotalADistribuir = Math.round((totalPendenteAtual + restanteComJuros) * 100) / 100

          // Divide igualmente entre as parcelas pendentes
          const novoValorPorParcela = Math.floor((novoTotalADistribuir / parcelasPendentes.length) * 100) / 100
          // O centavo sobrando vai para a primeira parcela
          const centavoExtra = Math.round((novoTotalADistribuir - novoValorPorParcela * parcelasPendentes.length) * 100) / 100

          // Recalcula as datas de vencimento a partir da nova data base (proximoVencimento)
          const frequencia = contrato?.frequencia || 'mensal'
          const novasDatasPorIndice = parcelasPendentes.map((_, i) => {
            if (!proximoVencimento) return null
            const base = new Date(proximoVencimento + 'T12:00:00')
            switch (frequencia) {
              case 'diario':
                base.setDate(base.getDate() + i)
                break
              case 'semanal':
                base.setDate(base.getDate() + i * 7)
                break
              case 'quinzenal':
                base.setDate(base.getDate() + i * 15)
                break
              case 'mensal':
              default: {
                const diaBase = new Date(proximoVencimento + 'T12:00:00').getDate()
                const novaData = new Date(proximoVencimento + 'T12:00:00')
                novaData.setMonth(novaData.getMonth() + i)
                // Corrige meses curtos (ex: 31 de fev vira 28/29)
                if (novaData.getDate() !== diaBase) novaData.setDate(0)
                return `${novaData.getFullYear()}-${String(novaData.getMonth() + 1).padStart(2, '0')}-${String(novaData.getDate()).padStart(2, '0')}`
              }
            }
            return `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, '0')}-${String(base.getDate()).padStart(2, '0')}`
          })

          for (let i = 0; i < parcelasPendentes.length; i++) {
            const p = parcelasPendentes[i]
            const valorFinal = Math.round((novoValorPorParcela + (i === 0 ? centavoExtra : 0)) * 100) / 100
            const updateData = { valor: valorFinal }
            // Atualiza o vencimento se tiver nova data base
            if (proximoVencimento && novasDatasPorIndice[i]) {
              updateData.vencimento = novasDatasPorIndice[i]
            }
            await supabase.from('parcelas')
              .update(updateData)
              .eq('id', p.id)
          }
        } else {
          // Não há parcelas pendentes — cria uma nova com o restante + juros
          const restanteComJuros = Math.round(diferenca * (1 + juros / 100) * 100) / 100
          const { data: { user } } = await supabase.auth.getUser()
          const { error: insertError } = await supabase.from('parcelas').insert({
            parcelamento_id: showConfirm.parcelamentoId,
            cliente_id: showConfirm.clienteId,
            cliente_nome: showConfirm.clienteNome,
            numero: showConfirm.totalParcelas + 1,
            total_parcelas: showConfirm.totalParcelas + 1,
            valor: restanteComJuros,
            vencimento: proximoVencimento,
            status: 'pendente',
            data_pagamento: null,
            user_id: user.id
          })

          if (insertError) {
            // ROLLBACK: desfaz o pagamento se não conseguiu criar a nova parcela.
            // Restaura o valor ORIGINAL armazenado (sem multa), pois a multa é recalculada na exibição.
            await supabase.from('parcelas')
              .update({ status: 'pendente', data_pagamento: null, valor: showConfirm.valor })
              .eq('id', showConfirm.id)
            alert('Erro ao criar parcela de restante. Pagamento foi revertido.')
            setUploading(false)
            await loadAllData()
            return
          }
        }

        // Renova o contrato: atualiza a data de vencimento para a data do próximo pagamento
        if (proximoVencimento) {
          await updateParcelamento(showConfirm.parcelamentoId, { vencimento: proximoVencimento })
        }

      } else if (diferenca < 0) {
        // Pagou a mais — abate das próximas parcelas
        const parcelasContrato = parcelas
          .filter(p => p.parcelamentoId === showConfirm.parcelamentoId && p.status !== 'pago' && p.id !== showConfirm.id)
          .sort((a, b) => new Date(a.vencimento) - new Date(b.vencimento))

        if (parcelasContrato.length > 0) {
          const abatePorParcela = Math.round((Math.abs(diferenca) / parcelasContrato.length) * 100) / 100
          for (const p of parcelasContrato) {
            const novoValor = Math.max(0, Math.round((p.valor - abatePorParcela) * 100) / 100)
            await supabase.from('parcelas')
              .update({ valor: novoValor })
              .eq('id', p.id)
          }
        }
      }

      // Recarrega todos os dados
      await loadAllData()
    } else {
      // Pagamento total — grava o valor devido (com multa por atraso, se houver).
      // .neq('status','pago') previne double-pay e casa com qualquer status não-pago.
      const { data: parcelaPagaData, error: updateError } = await supabase.from('parcelas')
        .update({
          status: 'pago',
          data_pagamento: new Date().toISOString().split('T')[0],
          valor: valorDevido
        })
        .eq('id', showConfirm.id)
        .neq('status', 'pago')
        .select()

      if (updateError) {
        alert('Erro ao processar pagamento. Tente novamente.')
        setUploading(false)
        return
      }

      if (!parcelaPagaData || parcelaPagaData.length === 0) {
        alert('Esta parcela já foi paga.')
        setUploading(false)
        setShowConfirm(null)
        await loadAllData()
        return
      }

      await loadAllData()
    }

    setUploading(false)
    setShowConfirm(null)
    setComprovante(null)
    setPreviewUrl(null)
    setTipoPagamento('total')
    setValorParcial('')
    setProximoVencimento('')
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  // Calcula multa por atraso (com limite máximo de 100% do valor original)
  const multaDiaria = userData?.multaDiaria || userData?.multa_diaria || 0
  const calcularValorComMulta = (parcela) => {
    if (parcela.status !== 'atrasado' || !multaDiaria) return parcela.valor
    const venc = new Date(parcela.vencimento + 'T12:00:00')
    const hoje = new Date()
    const diasAtraso = Math.max(0, Math.floor((hoje - venc) / (1000 * 60 * 60 * 24)))
    const multaCalculada = (multaDiaria / 100) * diasAtraso
    const multaFinal = Math.min(multaCalculada, 1.0) // teto de 100% do valor
    return Math.round(parcela.valor * (1 + multaFinal) * 100) / 100
  }

  const hojeDate = new Date()
  hojeDate.setHours(0,0,0,0)

  const filtered = parcelas.filter(p => {
    if (filter === 'todas') return true
    if (filter === 'pendentes') return p.status === 'pendente' || p.status === 'vence_hoje'
    if (filter === 'futuras') {
      const venc = new Date(p.vencimento + 'T12:00:00')
      return p.status !== 'pago' && venc > hojeDate
    }
    if (filter === 'pagas') return p.status === 'pago'
    if (filter === 'atrasadas') return p.status === 'atrasado'
    return true
  }).sort((a, b) => new Date(a.vencimento) - new Date(b.vencimento))

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
    { key: 'futuras', label: 'Futuras' },
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
      <div className="grid grid-cols-3 gap-2 md:gap-3">
        <div className="bg-dark-700 rounded-xl p-2 md:p-3 border border-dark-500/50 text-center">
          <p className="text-base md:text-lg font-bold text-amber-400">{parcelas.filter(p => p.status === 'pendente' || p.status === 'vence_hoje').length}</p>
          <p className="text-[10px] md:text-xs text-gray-500">Pendentes</p>
        </div>
        <div className="bg-dark-700 rounded-xl p-2 md:p-3 border border-dark-500/50 text-center">
          <p className="text-base md:text-lg font-bold text-red-400">{parcelas.filter(p => p.status === 'atrasado').length}</p>
          <p className="text-[10px] md:text-xs text-gray-500">Atrasadas</p>
        </div>
        <div className="bg-dark-700 rounded-xl p-2 md:p-3 border border-dark-500/50 text-center">
          <p className="text-base md:text-lg font-bold text-pix-400">{parcelas.filter(p => p.status === 'pago').length}</p>
          <p className="text-[10px] md:text-xs text-gray-500">Pagas</p>
        </div>
      </div>

      {/* Parcelas list */}
      <div className="space-y-2">
        {filtered.slice(0, visivel).map(parcela => (
          <div key={parcela.id} className="bg-dark-700 rounded-2xl p-3 md:p-4 border border-dark-500/50">
            <div className="flex items-start gap-3">
              {/* Ícone status */}
              <div className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                parcela.status === 'pago' ? 'bg-pix-500/10' :
                parcela.status === 'atrasado' ? 'bg-red-500/10' : 'bg-amber-500/10'
              }`}>
                {getStatusIcon(parcela.status)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-200 truncate">{parcela.clienteNome}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Parcela {parcela.numero}/{parcela.totalParcelas} • {new Date(parcela.vencimento + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-white">{formatCurrency(calcularValorComMulta(parcela))}</p>
                    {parcela.status === 'atrasado' && multaDiaria > 0 && calcularValorComMulta(parcela) > parcela.valor && (
                      <p className="text-[9px] text-red-400 line-through">{formatCurrency(parcela.valor)}</p>
                    )}
                  </div>
                </div>

                {/* Status badge + ações */}
                <div className="flex items-center justify-between mt-2">
                  <span className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded-full border ${getStatusStyle(parcela.status)}`}>
                    {getStatusLabel(parcela.status)}
                  </span>
                  <div className="flex items-center gap-2">
                    {parcela.status !== 'pago' && (
                      <button onClick={() => setShowConfirm(parcela)}
                        className="p-1.5 md:p-2 bg-pix-500/10 hover:bg-pix-500/20 rounded-lg transition-colors border border-pix-500/20"
                        title="Marcar como pago">
                        <Check className="w-4 h-4 text-pix-400" />
                      </button>
                    )}
                    {parcela.status === 'pago' && (parcela.comprovanteUrl || parcela.comprovante_url) && (
                      <button onClick={() => setViewComprovante(parcela.comprovanteUrl || parcela.comprovante_url)}
                        className="p-1.5 md:p-2 bg-primary-500/10 hover:bg-primary-500/20 rounded-lg transition-colors border border-primary-500/20"
                        title="Ver comprovante">
                        <Image className="w-4 h-4 text-primary-400" />
                      </button>
                    )}
                  </div>
                </div>
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
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4" onClick={() => { setShowConfirm(null); setComprovante(null); setPreviewUrl(null); setTipoPagamento('total'); setValorParcial('') }}>
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative bg-dark-800 w-full max-w-sm rounded-2xl border border-dark-500/50 animate-fade-in p-5 max-h-[70vh] overflow-y-auto shadow-elevated" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Confirmar pagamento</h3>
              <button onClick={() => { setShowConfirm(null); setComprovante(null); setPreviewUrl(null); setTipoPagamento('total'); setValorParcial('') }}
                className="p-1 rounded-lg hover:bg-dark-600 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-dark-700 rounded-xl p-4 border border-dark-500/50 mb-4">
              <p className="text-sm text-gray-400">Cliente</p>
              <p className="text-base font-semibold text-white">{showConfirm.clienteNome}</p>
              <div className="flex justify-between mt-2">
                <span className="text-sm text-gray-400">Parcela {showConfirm.numero}/{showConfirm.totalParcelas}</span>
                <span className="text-sm font-bold text-pix-400">{formatCurrency(calcularValorComMulta(showConfirm))}</span>
              </div>
              {calcularValorComMulta(showConfirm) > showConfirm.valor && (
                <div className="flex justify-between mt-1 text-xs">
                  <span className="text-gray-500">Valor original {formatCurrency(showConfirm.valor)} + multa por atraso</span>
                  <span className="text-red-400">+{formatCurrency(calcularValorComMulta(showConfirm) - showConfirm.valor)}</span>
                </div>
              )}
            </div>

            {/* Tipo de pagamento */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-300 mb-2">Tipo de pagamento</p>
              <div className="flex gap-2">
                <button onClick={() => { setTipoPagamento('total'); setValorParcial('') }}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${tipoPagamento === 'total' ? 'bg-pix-500 text-white' : 'bg-dark-600 text-gray-400 border border-dark-500'}`}>
                  Total
                </button>
                <button onClick={() => {
                  setTipoPagamento('parcial')
                  // Preenche automaticamente com a data de hoje
                  if (!proximoVencimento) {
                    setProximoVencimento(new Date().toISOString().split('T')[0])
                  }
                }}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${tipoPagamento === 'parcial' ? 'bg-primary-600 text-white' : 'bg-dark-600 text-gray-400 border border-dark-500'}`}>
                  Parcial
                </button>
              </div>
              {tipoPagamento === 'parcial' && (
                <div className="mt-3 space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Valor pago pelo cliente</label>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm">R$</span>
                      <input type="number" step="0.01" value={valorParcial}
                        onChange={e => setValorParcial(e.target.value)}
                        placeholder={calcularValorComMulta(showConfirm).toFixed(2)}
                        className="flex-1 px-3 py-2 rounded-lg bg-dark-600 border border-dark-500 text-white outline-none focus:border-primary-500 text-sm" />
                    </div>
                  </div>
                  {valorParcial && parseFloat(valorParcial) < calcularValorComMulta(showConfirm) && (
                    <>
                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                        <p className="text-xs text-amber-400">
                          Restante: {formatCurrency(calcularValorComMulta(showConfirm) - parseFloat(valorParcial))} — será somado com juros e redistribuído nas parcelas pendentes do contrato.
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Próximo vencimento (opcional — usado se não houver parcelas pendentes)</label>
                        <input type="date" value={proximoVencimento}
                          onChange={e => setProximoVencimento(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-dark-600 border border-dark-500 text-white outline-none focus:border-primary-500 text-sm" />
                      </div>
                    </>
                  )}
                  {valorParcial && parseFloat(valorParcial) > calcularValorComMulta(showConfirm) && (
                    <p className="text-xs text-pix-400">
                      Excedente de {formatCurrency(parseFloat(valorParcial) - calcularValorComMulta(showConfirm))} será abatido nas próximas parcelas.
                    </p>
                  )}
                </div>
              )}
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
              <button onClick={() => { setShowConfirm(null); setComprovante(null); setPreviewUrl(null); setTipoPagamento('total'); setValorParcial('') }}
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
