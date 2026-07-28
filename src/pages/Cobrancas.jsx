import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { MessageSquare, Send, RefreshCw, CheckCircle, Copy, QrCode, Zap } from 'lucide-react'

export default function Cobrancas() {
  const { parcelas, clientes, userData } = useApp()
  const [selectedParcela, setSelectedParcela] = useState(null)
  const [showPix, setShowPix] = useState(false)
  const [copied, setCopied] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [enviadosCount, setEnviadosCount] = useState(0)
  const [logCobrancas, setLogCobrancas] = useState(() => {
    try { return JSON.parse(localStorage.getItem('parcelyx_log_cobrancas') || '{}') }
    catch { return {} }
  })

  const parcelasCobraveis = parcelas.filter(p => p.status === 'atrasado' || p.status === 'pendente' || p.status === 'vence_hoje')
  const parcelasHoje = parcelas.filter(p => p.status === 'vence_hoje')
  const parcelasAtrasadas = parcelas.filter(p => p.status === 'atrasado')

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const pixKey = userData?.chavePix || userData?.chave_pix || ''

  const gerarMensagemCobranca = (parcela) => {
    return `Olá ${parcela.clienteNome}! 👋\n\nEste é um lembrete sobre sua parcela ${parcela.numero}/${parcela.totalParcelas} no valor de ${formatCurrency(parcela.valor)}, com vencimento em ${new Date(parcela.vencimento).toLocaleDateString('pt-BR')}.\n\nPara facilitar, segue a chave PIX para pagamento:\n📱 PIX: ${pixKey || 'Não configurada'}\n\nQualquer dúvida, estou à disposição! 😊`
  }

  const gerarMensagemLembrete = (parcela) => {
    return `Oi ${parcela.clienteNome}! 😊\n\nPassando para lembrar que sua parcela ${parcela.numero}/${parcela.totalParcelas} de ${formatCurrency(parcela.valor)} vence em ${new Date(parcela.vencimento).toLocaleDateString('pt-BR')}.\n\nSe já pagou, pode desconsiderar! 🙏`
  }

  const gerarMensagemRenegociacao = (parcela) => {
    return `Olá ${parcela.clienteNome}! 👋\n\nNotei que sua parcela ${parcela.numero}/${parcela.totalParcelas} de ${formatCurrency(parcela.valor)} está pendente.\n\nGostaria de conversar sobre uma possível renegociação? Podemos encontrar uma condição que funcione melhor para você. 🤝\n\nMe avise quando puder conversar!`
  }

  const gerarMensagemConfirmacao = (parcela) => {
    return `Olá ${parcela.clienteNome}! ✅\n\nConfirmamos o recebimento do pagamento da parcela ${parcela.numero}/${parcela.totalParcelas} no valor de ${formatCurrency(parcela.valor)}.\n\nMuito obrigado! 🙏`
  }

  const enviarWhatsApp = (parcela, mensagem) => {
    const cliente = clientes.find(c => c.id === parcela.clienteId)
    if (cliente) {
      const phone = '55' + cliente.telefone.replace(/\D/g, '')
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(mensagem)}`
      window.open(url, '_blank')
      
      // Registra no log local
      const novoLog = { ...logCobrancas, [parcela.id]: new Date().toISOString() }
      setLogCobrancas(novoLog)
      localStorage.setItem('parcelyx_log_cobrancas', JSON.stringify(novoLog))
    }
  }

  // Verifica se parcela foi cobrada recentemente (últimas 4 horas)
  const foiCobradaRecente = (parcelaId) => {
    const ultimo = logCobrancas[parcelaId]
    if (!ultimo) return false
    const diff = Date.now() - new Date(ultimo).getTime()
    return diff < 4 * 60 * 60 * 1000 // 4 horas
  }

  // Cobrança em massa - abre WhatsApp pra cada cliente com intervalo
  const cobrarEmMassa = (listaParcelas, tipo) => {
    if (listaParcelas.length === 0) { alert('Nenhuma parcela pra cobrar!'); return }
    
    // Filtra parcelas cobradas recentemente
    const parcelasNaoCobradas = listaParcelas.filter(p => !foiCobradaRecente(p.id))
    
    if (parcelasNaoCobradas.length === 0) {
      alert('Todas as parcelas já foram cobradas nas últimas 4 horas.')
      return
    }

    // Agrupa por cliente (não mandar 2x pro mesmo cliente)
    const porCliente = {}
    parcelasNaoCobradas.forEach(p => {
      if (!porCliente[p.clienteId]) porCliente[p.clienteId] = []
      porCliente[p.clienteId].push(p)
    })

    const clienteIds = Object.keys(porCliente)
    setEnviando(true)
    setEnviadosCount(0)

    let index = 0
    const enviarProximo = () => {
      if (index >= clienteIds.length) {
        setEnviando(false)
        alert(`✅ ${clienteIds.length} mensagem(ns) enviada(s)!`)
        return
      }

      const clienteId = clienteIds[index]
      const parcelasCliente = porCliente[clienteId]
      const parcela = parcelasCliente[0] // pega a primeira parcela desse cliente
      const mensagem = tipo === 'cobranca' ? gerarMensagemCobranca(parcela) : gerarMensagemLembrete(parcela)
      
      enviarWhatsApp(parcela, mensagem)
      index++
      setEnviadosCount(index)

      // Intervalo de 2s entre cada envio pra não abrir tudo de uma vez
      if (index < clienteIds.length) {
        setTimeout(enviarProximo, 2000)
      } else {
        setEnviando(false)
      }
    }

    if (confirm(`Enviar cobrança para ${clienteIds.length} cliente(s)?`)) {
      enviarProximo()
    } else {
      setEnviando(false)
    }
  }

  const copyPix = () => {
    navigator.clipboard.writeText(pixKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-5 pb-20 md:pb-0 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-white">Cobranças</h1>
        <p className="text-sm text-gray-400 mt-1">Cobre seus clientes via WhatsApp e PIX</p>
      </div>

      {/* Cobrança em massa */}
      <div className="bg-dark-700 rounded-2xl p-4 border border-pix-500/30">
        <div className="flex items-center gap-3 mb-3">
          <Zap className="w-5 h-5 text-pix-400" />
          <h3 className="text-sm font-semibold text-white">Cobrança em massa</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button onClick={() => cobrarEmMassa(parcelasHoje, 'lembrete')} disabled={enviando || parcelasHoje.length === 0}
            className="flex items-center justify-center gap-2 py-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-sm font-medium rounded-xl border border-amber-500/20 disabled:opacity-40 transition-all">
            <Send className="w-4 h-4" />
            Vence hoje ({parcelasHoje.length})
          </button>
          <button onClick={() => cobrarEmMassa(parcelasAtrasadas, 'cobranca')} disabled={enviando || parcelasAtrasadas.length === 0}
            className="flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium rounded-xl border border-red-500/20 disabled:opacity-40 transition-all">
            <Send className="w-4 h-4" />
            Atrasadas ({parcelasAtrasadas.length})
          </button>
          <button onClick={() => cobrarEmMassa([...parcelasHoje, ...parcelasAtrasadas], 'cobranca')} disabled={enviando || (parcelasHoje.length + parcelasAtrasadas.length) === 0}
            className="flex items-center justify-center gap-2 py-3 bg-pix-500/10 hover:bg-pix-500/20 text-pix-400 text-sm font-medium rounded-xl border border-pix-500/20 disabled:opacity-40 transition-all">
            <Zap className="w-4 h-4" />
            Cobrar todos
          </button>
        </div>
        {enviando && (
          <p className="text-xs text-gray-400 mt-2 text-center">Enviando... {enviadosCount} mensagem(ns)</p>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setShowPix(true)}
          className="bg-dark-700 rounded-2xl p-4 border border-dark-500/50 card-hover text-left">
          <div className="w-10 h-10 bg-pix-500/10 rounded-xl flex items-center justify-center mb-3">
            <QrCode className="w-5 h-5 text-pix-400" />
          </div>
          <p className="text-sm font-semibold text-white">Gerar PIX</p>
          <p className="text-xs text-gray-500 mt-0.5">Copia e cola ou QR Code</p>
        </button>
        <div className="bg-dark-700 rounded-2xl p-4 border border-dark-500/50">
          <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center mb-3">
            <MessageSquare className="w-5 h-5 text-red-400" />
          </div>
          <p className="text-sm font-semibold text-white">{parcelasCobraveis.filter(p => p.status === 'atrasado').length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Parcelas atrasadas</p>
        </div>
      </div>

      {/* Parcelas to collect */}
      <div>
        <h3 className="text-base font-semibold text-white mb-3">Parcelas para cobrar</h3>
        <div className="space-y-3">
          {parcelasCobraveis.slice(0, 15).map(parcela => (
            <div key={parcela.id} className="bg-dark-700 rounded-2xl p-4 border border-dark-500/50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-white">{parcela.clienteNome}</p>
                  <p className="text-xs text-gray-400">
                    Parcela {parcela.numero}/{parcela.totalParcelas} • {formatCurrency(parcela.valor)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Venc: {new Date(parcela.vencimento).toLocaleDateString('pt-BR')}
                  </p>
                  {foiCobradaRecente(parcela.id) && (
                    <p className="text-[10px] text-pix-400 mt-0.5">✓ Cobrada às {new Date(logCobrancas[parcela.id]).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</p>
                  )}
                </div>
                <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${
                  parcela.status === 'atrasado' ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}>
                  {parcela.status === 'atrasado' ? 'Atrasado' : 'Pendente'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => enviarWhatsApp(parcela, gerarMensagemCobranca(parcela))}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-pix-500/10 hover:bg-pix-500/20 text-pix-400 text-xs font-medium rounded-xl transition-colors border border-pix-500/20">
                  <Send className="w-3.5 h-3.5" /> Cobrar
                </button>
                <button onClick={() => enviarWhatsApp(parcela, gerarMensagemLembrete(parcela))}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 text-xs font-medium rounded-xl transition-colors border border-primary-500/20">
                  <MessageSquare className="w-3.5 h-3.5" /> Lembrete
                </button>
                <button onClick={() => enviarWhatsApp(parcela, gerarMensagemRenegociacao(parcela))}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-medium rounded-xl transition-colors border border-amber-500/20">
                  <RefreshCw className="w-3.5 h-3.5" /> Renegociar
                </button>
                <button onClick={() => enviarWhatsApp(parcela, gerarMensagemConfirmacao(parcela))}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-pix-500/10 hover:bg-pix-500/20 text-pix-400 text-xs font-medium rounded-xl transition-colors border border-pix-500/20">
                  <CheckCircle className="w-3.5 h-3.5" /> Confirmar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PIX Modal */}
      {showPix && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowPix(false)} />
          <div className="relative bg-dark-800 rounded-2xl w-full max-w-sm border border-dark-500/50 animate-fade-in p-5 max-h-[70vh] overflow-y-auto shadow-elevated">
            <h2 className="text-lg font-semibold text-white mb-4 text-center">PIX Copia e Cola</h2>

            <div className="w-48 h-48 mx-auto bg-dark-700 rounded-2xl flex items-center justify-center mb-4 border border-dark-500/50">
              <div className="text-center">
                <QrCode className="w-16 h-16 text-gray-500 mx-auto mb-2" />
                <p className="text-xs text-gray-500">QR Code PIX</p>
              </div>
            </div>

            <div className="bg-dark-700 rounded-xl p-3 mb-4 border border-dark-500/50">
              <p className="text-xs text-gray-500 mb-1">Chave PIX:</p>
              <p className="text-xs text-gray-300 font-mono break-all">{pixKey || 'Nenhuma chave configurada. Vá em Configurações para adicionar.'}</p>
            </div>

            <button onClick={copyPix}
              className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                copied ? 'bg-pix-500 text-white' : 'bg-primary-600 hover:bg-primary-700 text-white'
              }`}>
              <Copy className="w-4 h-4" />
              {copied ? 'Copiado!' : 'Copiar código PIX'}
            </button>

            <button onClick={() => setShowPix(false)}
              className="w-full py-3 mt-2 text-gray-400 text-sm font-medium hover:text-gray-200">
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
