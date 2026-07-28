import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { TrendingUp, TrendingDown, DollarSign, AlertCircle, ChevronLeft, ChevronRight, FileText } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { jsPDF } from 'jspdf'

export default function Financeiro() {
  const { parcelas, parcelamentos, clientes, getChartData, userData } = useApp()
  const chartData = getChartData()
  const [periodo, setPeriodo] = useState('mensal')

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const totalRecebido = parcelas
    .filter(p => p.status === 'pago')
    .reduce((sum, p) => sum + p.valor, 0)

  const totalPendente = parcelas
    .filter(p => p.status === 'pendente' || p.status === 'vence_hoje')
    .reduce((sum, p) => sum + p.valor, 0)

  const totalAtrasado = parcelas
    .filter(p => p.status === 'atrasado')
    .reduce((sum, p) => sum + p.valor, 0)

  const totalGeral = totalRecebido + totalPendente + totalAtrasado
  const lucro = totalRecebido - totalAtrasado

  const transactions = parcelas
    .filter(p => p.status === 'pago' && p.dataPagamento)
    .sort((a, b) => new Date(b.dataPagamento) - new Date(a.dataPagamento))
    .slice(0, 10)

  const gerarRelatorioPDF = () => {
    const doc = new jsPDF()
    const hoje = new Date()
    const mesAtual = hoje.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    const nomeNegocio = userData?.negocio || userData?.nome || 'Parcelyx'

    // Parcelas do mês atual
    const mesNum = hoje.getMonth()
    const anoNum = hoje.getFullYear()
    const parcelasMes = parcelas.filter(p => {
      const d = new Date(p.vencimento)
      return d.getMonth() === mesNum && d.getFullYear() === anoNum
    })
    const recebidoMes = parcelasMes.filter(p => p.status === 'pago').reduce((s, p) => s + p.valor, 0)
    const pendenteMes = parcelasMes.filter(p => p.status === 'pendente' || p.status === 'vence_hoje').reduce((s, p) => s + p.valor, 0)
    const atrasadoMes = parcelasMes.filter(p => p.status === 'atrasado').reduce((s, p) => s + p.valor, 0)
    const totalEmprestadoMes = parcelamentos.filter(p => {
      const d = new Date(p.dataCriacao)
      return d.getMonth() === mesNum && d.getFullYear() === anoNum
    }).reduce((s, p) => s + (p.valorTotal || 0), 0)
    const lucroMes = recebidoMes - totalEmprestadoMes

    // Header
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text(nomeNegocio, 20, 25)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(`Relatório Financeiro - ${mesAtual}`, 20, 35)
    doc.text(`Gerado em: ${hoje.toLocaleDateString('pt-BR')} às ${hoje.toLocaleTimeString('pt-BR')}`, 20, 42)

    // Linha separadora
    doc.setDrawColor(200)
    doc.line(20, 47, 190, 47)

    // Resumo
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Resumo do Mês', 20, 57)

    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    let y = 67
    const addLine = (label, value, color) => {
      doc.text(label, 25, y)
      doc.text(value, 140, y)
      y += 8
    }

    addLine('Total emprestado no mês:', formatCurrency(totalEmprestadoMes))
    addLine('Total recebido no mês:', formatCurrency(recebidoMes))
    addLine('Pendente no mês:', formatCurrency(pendenteMes))
    addLine('Em atraso no mês:', formatCurrency(atrasadoMes))
    y += 4
    doc.setFont('helvetica', 'bold')
    addLine('Lucro do mês:', formatCurrency(lucroMes))

    // Resumo geral
    y += 10
    doc.setFontSize(14)
    doc.text('Resumo Geral', 20, y)
    y += 12
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    addLine('Total clientes:', `${clientes?.length || 0}`)
    addLine('Total contratos:', `${parcelamentos?.length || 0}`)
    addLine('Total recebido (histórico):', formatCurrency(totalRecebido))
    addLine('Total pendente:', formatCurrency(totalPendente))
    addLine('Total em atraso:', formatCurrency(totalAtrasado))

    // Últimos pagamentos
    if (transactions.length > 0) {
      y += 12
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Últimos Pagamentos Recebidos', 20, y)
      y += 10
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')

      transactions.slice(0, 8).forEach(t => {
        if (y > 270) { doc.addPage(); y = 20 }
        doc.text(`${t.clienteNome} - Parcela ${t.numero}/${t.totalParcelas}`, 25, y)
        doc.text(formatCurrency(t.valor), 140, y)
        doc.text(new Date(t.dataPagamento).toLocaleDateString('pt-BR'), 170, y)
        y += 7
      })
    }

    // Footer
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text('Parcelyx - Gestão de Cobranças e Parcelamentos', 20, 285)

    doc.save(`relatorio-${anoNum}-${String(mesNum + 1).padStart(2, '0')}.pdf`)
  }

  return (
    <div className="space-y-5 pb-20 md:pb-0 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Minhas Finanças</h1>
        <button onClick={gerarRelatorioPDF}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-xl transition-all">
          <FileText className="w-4 h-4" /> Relatório PDF
        </button>
      </div>

      {/* Card principal - Recebido x Emprestado */}
      <div className="bg-dark-700 rounded-2xl p-5 border border-dark-500/50">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-pix-500/10 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-pix-400" />
          </div>
          <span className="text-sm text-gray-400">Recebido x Emprestado</span>
        </div>
        <p className="text-3xl font-bold text-pix-400">{formatCurrency(lucro)}</p>
        <p className="text-xs text-gray-500 mt-1">{transactions.length} movimentações no período</p>
      </div>

      {/* Cards Recebido / Emprestado */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-dark-700 rounded-2xl p-4 border border-dark-500/50">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-pix-400 rounded-full"></div>
            <span className="text-xs text-gray-400">Recebido</span>
          </div>
          <p className="text-lg font-bold text-white">{formatCurrency(totalRecebido)}</p>
        </div>
        <div className="bg-dark-700 rounded-2xl p-4 border border-dark-500/50">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
            <span className="text-xs text-gray-400">Emprestado</span>
          </div>
          <p className="text-lg font-bold text-white">{formatCurrency(totalGeral)}</p>
        </div>
      </div>

      {/* Tendência financeira */}
      <div className="bg-dark-700 rounded-2xl p-5 border border-dark-500/50">
        <h3 className="text-base font-semibold text-white mb-1">Tendência financeira</h3>
        <p className="text-xs text-gray-500 mb-4">Comparativo de recebido x emprestado por período</p>

        {/* Período selector */}
        <div className="flex items-center justify-center gap-1 mb-4">
          {['semanal', 'mensal', 'anual'].map(p => (
            <button key={p} onClick={() => setPeriodo(p)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                periodo === p ? 'bg-primary-600 text-white' : 'bg-dark-600 text-gray-400 hover:text-gray-200'
              }`}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        <div className="h-48 md:h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3042" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #1e3042', backgroundColor: '#141f2e', color: '#f1f5f9' }}
                formatter={(value) => [formatCurrency(value), 'Recebido']}
              />
              <Bar dataKey="recebido" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legenda */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-pix-400 rounded-full"></div>
            <span className="text-xs text-gray-400">Recebido</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
            <span className="text-xs text-gray-400">Emprestado</span>
          </div>
        </div>
      </div>

      {/* Distribuição */}
      <div className="bg-dark-700 rounded-2xl p-5 border border-dark-500/50">
        <h3 className="text-base font-semibold text-white mb-3">Distribuição</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Recebido</span>
              <span className="font-medium text-pix-400">{totalGeral > 0 ? Math.round((totalRecebido / totalGeral) * 100) : 0}%</span>
            </div>
            <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
              <div className="h-full bg-pix-500 rounded-full transition-all" style={{ width: `${totalGeral > 0 ? (totalRecebido / totalGeral) * 100 : 0}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">A receber</span>
              <span className="font-medium text-primary-400">{totalGeral > 0 ? Math.round((totalPendente / totalGeral) * 100) : 0}%</span>
            </div>
            <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
              <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${totalGeral > 0 ? (totalPendente / totalGeral) * 100 : 0}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Em atraso</span>
              <span className="font-medium text-red-400">{totalGeral > 0 ? Math.round((totalAtrasado / totalGeral) * 100) : 0}%</span>
            </div>
            <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${totalGeral > 0 ? (totalAtrasado / totalGeral) * 100 : 0}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Últimas entradas */}
      <div className="bg-dark-700 rounded-2xl p-5 border border-dark-500/50">
        <h3 className="text-base font-semibold text-white mb-4">Últimas entradas</h3>
        <div className="space-y-2">
          {transactions.map(t => (
            <div key={t.id} className="flex items-center justify-between py-2 border-b border-dark-500/30 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-pix-500/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5 text-pix-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-200">{t.clienteNome}</p>
                  <p className="text-xs text-gray-500">{new Date(t.dataPagamento).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-pix-400">+{formatCurrency(t.valor)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
