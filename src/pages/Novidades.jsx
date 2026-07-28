import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Novidades() {
  const navigate = useNavigate()

  const updates = [
    { icon: '🎨', title: 'Novo design dark', desc: 'Interface moderna com tema escuro, cards vibrantes e navegação otimizada para mobile.' },
    { icon: '📅', title: 'Agenda / Calendário', desc: 'Visualize todos os vencimentos do mês em um calendário interativo.' },
    { icon: '⚡', title: 'Cobrança em massa', desc: 'Envie cobrança via WhatsApp para todos os clientes com parcelas vencendo hoje ou atrasadas com 1 clique.' },
    { icon: '💰', title: 'Pagamento parcial', desc: 'Registre pagamentos com valor diferente. O restante é redistribuído nas próximas parcelas com juros.' },
    { icon: '📎', title: 'Comprovante de pagamento', desc: 'Anexe foto do comprovante ao confirmar pagamento. Visualize depois na lista de parcelas pagas.' },
    { icon: '📊', title: 'Relatório PDF', desc: 'Gere um resumo financeiro mensal em PDF com empréstimos, recebimentos e lucro.' },
    { icon: '🏷️', title: 'Classificação automática', desc: 'Clientes são classificados como Bom pagador, Neutro ou Mau pagador baseado no histórico.' },
    { icon: '💸', title: 'Multa por atraso', desc: 'Configure % de multa por dia de atraso. O valor é calculado automaticamente.' },
    { icon: '🔄', title: 'Renovar contrato', desc: 'Renove um contrato com 1 clique — preenche tudo automaticamente pro mesmo cliente.' },
    { icon: '📱', title: 'Frequência flexível', desc: 'Parcelas diárias, semanais, quinzenais ou mensais. Com opção de dias úteis.' },
    { icon: '🔍', title: 'Busca global', desc: 'Encontre clientes e contratos rapidamente pelo ícone de busca no topo.' },
    { icon: '🔔', title: 'Alertas inteligentes', desc: 'Notificações de parcelas vencendo hoje, amanhã e atrasadas direto no Dashboard e no sino.' },
    { icon: '💼', title: 'Capital disponível', desc: 'Acompanhe quanto tem disponível para emprestar com cálculo automático.' },
    { icon: '📤', title: 'Importar / Exportar', desc: 'Exporte dados em JSON ou CSV. Importe de JSON, CSV ou TXT.' },
    { icon: '🔒', title: 'Controle de plano', desc: 'Alerta quando o plano está pra vencer e bloqueio automático ao expirar.' },
  ]

  return (
    <div className="space-y-5 pb-20 md:pb-0 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/configuracoes')} className="p-2 rounded-lg hover:bg-dark-600 text-gray-400">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Novidades v2.0</h1>
          <p className="text-sm text-gray-400">Julho 2026</p>
        </div>
      </div>

      <div className="space-y-3">
        {updates.map((item, i) => (
          <div key={i} className="bg-dark-700 rounded-xl p-4 border border-dark-500/50 flex gap-3">
            <span className="text-xl">{item.icon}</span>
            <div>
              <p className="text-sm font-semibold text-white">{item.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
