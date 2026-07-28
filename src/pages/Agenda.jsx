import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { ChevronLeft, ChevronRight, Check, Clock, AlertTriangle } from 'lucide-react'

export default function Agenda() {
  const { parcelas } = useApp()
  const [mesAtual, setMesAtual] = useState(new Date())

  const formatCurrency = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

  // Navegação de meses
  const mesAnterior = () => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1, 1))
  const mesProximo = () => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 1))

  // Gera dias do mês
  const ano = mesAtual.getFullYear()
  const mes = mesAtual.getMonth()
  const primeiroDia = new Date(ano, mes, 1).getDay()
  const totalDias = new Date(ano, mes + 1, 0).getDate()
  const hoje = new Date()
  hoje.setHours(0,0,0,0)

  // Parcelas do mês
  const parcelasMes = parcelas.filter(p => {
    const d = new Date(p.vencimento + 'T12:00:00')
    return d.getMonth() === mes && d.getFullYear() === ano
  })

  // Agrupa parcelas por dia
  const parcelasPorDia = {}
  parcelasMes.forEach(p => {
    const dia = new Date(p.vencimento + 'T12:00:00').getDate()
    if (!parcelasPorDia[dia]) parcelasPorDia[dia] = []
    parcelasPorDia[dia].push(p)
  })

  const nomeMes = mesAtual.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  const [diaSelecionado, setDiaSelecionado] = useState(null)

  return (
    <div className="space-y-5 pb-20 md:pb-0 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Agenda</h1>
        <div className="flex items-center gap-2">
          <button onClick={mesAnterior} className="p-2 rounded-lg hover:bg-dark-600 text-gray-400">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-white capitalize min-w-[140px] text-center">{nomeMes}</span>
          <button onClick={mesProximo} className="p-2 rounded-lg hover:bg-dark-600 text-gray-400">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendário */}
      <div className="bg-dark-700 rounded-2xl p-4 border border-dark-500/50">
        {/* Dias da semana */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
            <div key={d} className="text-center text-xs text-gray-500 font-medium py-1">{d}</div>
          ))}
        </div>

        {/* Grid de dias */}
        <div className="grid grid-cols-7 gap-1">
          {/* Espaços vazios antes do primeiro dia */}
          {[...Array(primeiroDia)].map((_, i) => (
            <div key={`empty-${i}`} className="h-12" />
          ))}

          {/* Dias do mês */}
          {[...Array(totalDias)].map((_, i) => {
            const dia = i + 1
            const parcelasDia = parcelasPorDia[dia] || []
            const temAtrasada = parcelasDia.some(p => p.status === 'atrasado')
            const temHoje = parcelasDia.some(p => p.status === 'vence_hoje')
            const temPaga = parcelasDia.some(p => p.status === 'pago') && !temAtrasada && !temHoje
            const ehHoje = new Date(ano, mes, dia).getTime() === hoje.getTime()

            return (
              <button key={dia} onClick={() => setDiaSelecionado(dia === diaSelecionado ? null : dia)}
                className={`h-12 rounded-lg flex flex-col items-center justify-center relative transition-all ${
                  ehHoje ? 'bg-primary-600 text-white' :
                  diaSelecionado === dia ? 'bg-dark-500 text-white' :
                  'hover:bg-dark-600 text-gray-300'
                }`}>
                <span className="text-sm">{dia}</span>
                {parcelasDia.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {temAtrasada && <div className="w-1.5 h-1.5 rounded-full bg-red-400" />}
                    {temHoje && <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                    {temPaga && <div className="w-1.5 h-1.5 rounded-full bg-pix-400" />}
                    {!temAtrasada && !temHoje && !temPaga && <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Legenda */}
      <div className="flex items-center justify-center gap-4">
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-400" /><span className="text-xs text-gray-400">Atrasada</span></div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-400" /><span className="text-xs text-gray-400">Vence hoje</span></div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-pix-400" /><span className="text-xs text-gray-400">Paga</span></div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-gray-400" /><span className="text-xs text-gray-400">Pendente</span></div>
      </div>

      {/* Detalhes do dia selecionado */}
      {diaSelecionado && parcelasPorDia[diaSelecionado] && (
        <div className="bg-dark-700 rounded-2xl p-4 border border-dark-500/50 animate-fade-in">
          <h3 className="text-sm font-semibold text-white mb-3">
            {diaSelecionado}/{String(mes + 1).padStart(2, '0')}/{ano}
          </h3>
          <div className="space-y-2">
            {parcelasPorDia[diaSelecionado].map(p => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-dark-500/20 last:border-0">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    p.status === 'pago' ? 'bg-pix-500/10' : p.status === 'atrasado' ? 'bg-red-500/10' : 'bg-amber-500/10'
                  }`}>
                    {p.status === 'pago' ? <Check className="w-3 h-3 text-pix-400" /> :
                     p.status === 'atrasado' ? <AlertTriangle className="w-3 h-3 text-red-400" /> :
                     <Clock className="w-3 h-3 text-amber-400" />}
                  </div>
                  <div>
                    <p className="text-sm text-gray-200">{p.clienteNome}</p>
                    <p className="text-xs text-gray-500">Parcela {p.numero}/{p.totalParcelas}</p>
                  </div>
                </div>
                <p className={`text-sm font-semibold ${p.status === 'pago' ? 'text-pix-400' : 'text-gray-300'}`}>{formatCurrency(p.valor)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resumo do mês */}
      <div className="bg-dark-700 rounded-2xl p-4 border border-dark-500/50">
        <h3 className="text-sm font-semibold text-white mb-3">Resumo de {nomeMes}</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-pix-500/10 rounded-xl">
            <p className="text-lg font-bold text-pix-400">{parcelasMes.filter(p => p.status === 'pago').length}</p>
            <p className="text-xs text-gray-500">Recebidas</p>
          </div>
          <div className="text-center p-3 bg-amber-500/10 rounded-xl">
            <p className="text-lg font-bold text-amber-400">{parcelasMes.filter(p => p.status !== 'pago').length}</p>
            <p className="text-xs text-gray-500">Pendentes</p>
          </div>
          <div className="text-center p-3 bg-dark-600 rounded-xl">
            <p className="text-sm font-bold text-pix-400">{formatCurrency(parcelasMes.filter(p => p.status === 'pago').reduce((s,p) => s + p.valor, 0))}</p>
            <p className="text-xs text-gray-500">Total recebido</p>
          </div>
          <div className="text-center p-3 bg-dark-600 rounded-xl">
            <p className="text-sm font-bold text-gray-300">{formatCurrency(parcelasMes.filter(p => p.status !== 'pago').reduce((s,p) => s + p.valor, 0))}</p>
            <p className="text-xs text-gray-500">A receber</p>
          </div>
        </div>
      </div>
    </div>
  )
}
