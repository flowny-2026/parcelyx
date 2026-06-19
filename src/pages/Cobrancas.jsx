import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { MessageSquare, Send, RefreshCw, CheckCircle, Copy, QrCode } from 'lucide-react'

export default function Cobrancas() {
  const { parcelas, clientes } = useApp()
  const [selectedParcela, setSelectedParcela] = useState(null)
  const [showPix, setShowPix] = useState(false)
  const [copied, setCopied] = useState(false)

  const parcelasCobraveis = parcelas.filter(p => p.status === 'atrasado' || p.status === 'pendente' || p.status === 'vence_hoje')

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const gerarMensagemCobranca = (parcela) => {
    return `Olá ${parcela.clienteNome}! 👋\n\nEste é um lembrete sobre sua parcela ${parcela.numero}/${parcela.totalParcelas} no valor de ${formatCurrency(parcela.valor)}, com vencimento em ${new Date(parcela.vencimento).toLocaleDateString('pt-BR')}.\n\nPara facilitar, segue a chave PIX para pagamento:\n📱 PIX: pagamentos@parcelyx.com\n\nQualquer dúvida, estou à disposição! 😊`
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
    }
  }

  const pixCode = '00020126580014br.gov.bcb.pix0136pagamentos@parcelyx.com5204000053039865802BR5913PARCELYX LTDA6008SAOPAULO62070503***6304'

  const copyPix = () => {
    navigator.clipboard.writeText(pixCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Cobranças</h1>
        <p className="text-sm text-neutral-500 mt-1">Cobre seus clientes via WhatsApp e PIX</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setShowPix(true)}
          className="bg-white rounded-2xl p-4 shadow-card card-hover text-left"
        >
          <div className="w-10 h-10 bg-pix-50 rounded-xl flex items-center justify-center mb-3">
            <QrCode className="w-5 h-5 text-pix-600" />
          </div>
          <p className="text-sm font-semibold text-neutral-900">Gerar PIX</p>
          <p className="text-xs text-neutral-500 mt-0.5">Copia e cola ou QR Code</p>
        </button>
        <div className="bg-white rounded-2xl p-4 shadow-card">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center mb-3">
            <MessageSquare className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-sm font-semibold text-neutral-900">{parcelasCobraveis.filter(p => p.status === 'atrasado').length}</p>
          <p className="text-xs text-neutral-500 mt-0.5">Parcelas atrasadas</p>
        </div>
      </div>

      {/* Parcelas to collect */}
      <div>
        <h3 className="text-base font-semibold text-neutral-900 mb-3">Parcelas para cobrar</h3>
        <div className="space-y-3">
          {parcelasCobraveis.slice(0, 15).map(parcela => (
            <div key={parcela.id} className="bg-white rounded-2xl p-4 shadow-card">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-neutral-900">{parcela.clienteNome}</p>
                  <p className="text-xs text-neutral-500">
                    Parcela {parcela.numero}/{parcela.totalParcelas} • {formatCurrency(parcela.valor)}
                  </p>
                  <p className="text-xs text-neutral-400">
                    Venc: {new Date(parcela.vencimento).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${
                  parcela.status === 'atrasado' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {parcela.status === 'atrasado' ? 'Atrasado' : 'Pendente'}
                </span>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => enviarWhatsApp(parcela, gerarMensagemCobranca(parcela))}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-pix-50 hover:bg-pix-100 text-pix-700 text-xs font-medium rounded-xl transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  Cobrar
                </button>
                <button
                  onClick={() => enviarWhatsApp(parcela, gerarMensagemLembrete(parcela))}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium rounded-xl transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Lembrete
                </button>
                <button
                  onClick={() => enviarWhatsApp(parcela, gerarMensagemRenegociacao(parcela))}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-medium rounded-xl transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Renegociar
                </button>
                <button
                  onClick={() => enviarWhatsApp(parcela, gerarMensagemConfirmacao(parcela))}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-medium rounded-xl transition-colors"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Confirmar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PIX Modal */}
      {showPix && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowPix(false)} />
          <div className="relative bg-white rounded-t-3xl md:rounded-3xl w-full max-w-md shadow-elevated p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4 text-center">PIX Copia e Cola</h2>

            {/* QR Code placeholder */}
            <div className="w-48 h-48 mx-auto bg-neutral-100 rounded-2xl flex items-center justify-center mb-4">
              <div className="text-center">
                <QrCode className="w-16 h-16 text-neutral-400 mx-auto mb-2" />
                <p className="text-xs text-neutral-500">QR Code PIX</p>
              </div>
            </div>

            {/* PIX code */}
            <div className="bg-neutral-50 rounded-xl p-3 mb-4">
              <p className="text-xs text-neutral-500 mb-1">Código PIX:</p>
              <p className="text-xs text-neutral-700 font-mono break-all">{pixCode.slice(0, 60)}...</p>
            </div>

            <button
              onClick={copyPix}
              className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                copied
                  ? 'bg-pix-600 text-white'
                  : 'bg-primary-600 hover:bg-primary-700 text-white'
              }`}
            >
              <Copy className="w-4 h-4" />
              {copied ? 'Copiado!' : 'Copiar código PIX'}
            </button>

            <button
              onClick={() => setShowPix(false)}
              className="w-full py-3 mt-2 text-neutral-600 text-sm font-medium"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
