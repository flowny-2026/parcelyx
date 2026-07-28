import React, { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { Building, CreditCard, Bell, Download, Upload, Database, X } from 'lucide-react'

export default function Configuracoes() {
  const { userData, updateUserData, clientes, parcelamentos, parcelas } = useApp()
  const fileInputRef = useRef(null)
  const [config, setConfig] = useState({
    nomeEmpresa: 'Meu Negócio',
    telefone: '',
    email: '',
    chavePix: '',
    tipoChavePix: 'email',
    notificacoes: true,
    lembreteAutomatico: true,
    diasAntesLembrete: 3,
    multaDiaria: '',
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [showChangelog, setShowChangelog] = useState(false)

  useEffect(() => {
    if (!userData) return
    setConfig(prev => ({
      ...prev,
      nomeEmpresa: userData.negocio || userData.nome || prev.nomeEmpresa,
      telefone: userData.telefone || prev.telefone,
      email: userData.email || prev.email,
      chavePix: userData.chavePix || userData.chave_pix || prev.chavePix,
      tipoChavePix: userData.tipoChavePix || userData.tipo_chave_pix || prev.tipoChavePix,
      multaDiaria: userData.multaDiaria || userData.multa_diaria || prev.multaDiaria,
    }))
  }, [userData])

  const inputClass = "w-full px-4 py-3 rounded-xl bg-dark-700 border border-dark-500 focus:border-pix-500 focus:ring-2 focus:ring-pix-500/20 outline-none text-sm text-gray-200 placeholder-gray-500"

  return (
    <div className="space-y-5 pb-20 md:pb-0 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-white">Configurações</h1>
        <p className="text-sm text-gray-400 mt-1">Personalize seu Parcelyx</p>
      </div>

      <div className="space-y-4">
        {/* Business info */}
        <div className="bg-dark-700 rounded-2xl p-5 border border-dark-500/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-primary-500/10 rounded-xl flex items-center justify-center">
              <Building className="w-4 h-4 text-primary-400" />
            </div>
            <h3 className="text-base font-semibold text-white">Dados do negócio</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Nome da empresa</label>
              <input type="text" value={config.nomeEmpresa}
                onChange={(e) => setConfig({ ...config, nomeEmpresa: e.target.value })}
                className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Telefone</label>
              <input type="tel" value={config.telefone}
                onChange={(e) => setConfig({ ...config, telefone: e.target.value })}
                className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">E-mail</label>
              <input type="email" value={config.email}
                onChange={(e) => setConfig({ ...config, email: e.target.value })}
                className={inputClass} />
            </div>
          </div>
        </div>

        {/* PIX config */}
        <div className="bg-dark-700 rounded-2xl p-5 border border-dark-500/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-pix-500/10 rounded-xl flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-pix-400" />
            </div>
            <h3 className="text-base font-semibold text-white">Chave PIX</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Tipo de chave</label>
              <select value={config.tipoChavePix}
                onChange={(e) => setConfig({ ...config, tipoChavePix: e.target.value })}
                className={inputClass}>
                <option value="cpf">CPF</option>
                <option value="cnpj">CNPJ</option>
                <option value="email">E-mail</option>
                <option value="telefone">Telefone</option>
                <option value="aleatoria">Chave aleatória</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Chave PIX</label>
              <input type="text" value={config.chavePix}
                onChange={(e) => setConfig({ ...config, chavePix: e.target.value })}
                className={inputClass} />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-dark-700 rounded-2xl p-5 border border-dark-500/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-amber-500/10 rounded-xl flex items-center justify-center">
              <Bell className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="text-base font-semibold text-white">Notificações</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-200">Notificações push</p>
                <p className="text-xs text-gray-500">Receba alertas de pagamentos</p>
              </div>
              <button onClick={() => setConfig({ ...config, notificacoes: !config.notificacoes })}
                className={`w-12 h-7 rounded-full transition-colors relative flex-shrink-0 p-1 flex ${config.notificacoes ? 'bg-primary-600 justify-end' : 'bg-dark-500 justify-start'}`}>
                <div className="w-5 h-5 bg-white rounded-full shadow-md" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-200">Lembrete automático</p>
                <p className="text-xs text-gray-500">Lembrar clientes antes do vencimento</p>
              </div>
              <button onClick={() => setConfig({ ...config, lembreteAutomatico: !config.lembreteAutomatico })}
                className={`w-12 h-7 rounded-full transition-colors relative flex-shrink-0 p-1 flex ${config.lembreteAutomatico ? 'bg-primary-600 justify-end' : 'bg-dark-500 justify-start'}`}>
                <div className="w-5 h-5 bg-white rounded-full shadow-md" />
              </button>
            </div>
            {config.lembreteAutomatico && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Dias antes do vencimento</label>
                <input type="number" min="1" max="7" value={config.diasAntesLembrete}
                  onChange={(e) => setConfig({ ...config, diasAntesLembrete: parseInt(e.target.value) })}
                  className={inputClass} />
              </div>
            )}
          </div>
        </div>

        {/* Multa por atraso */}
        <div className="bg-dark-700 rounded-2xl p-5 border border-dark-500/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-red-500/10 rounded-xl flex items-center justify-center">
              <span className="text-red-400 text-sm font-bold">%</span>
            </div>
            <h3 className="text-base font-semibold text-white">Multa por atraso</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Percentual de multa por dia de atraso</label>
              <div className="flex items-center gap-2">
                <input type="number" step="0.1" min="0" max="10" value={config.multaDiaria || ''}
                  onChange={(e) => setConfig({ ...config, multaDiaria: e.target.value })}
                  className={inputClass} placeholder="0.5" />
                <span className="text-gray-400 text-sm">% ao dia</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Ex: 0.5% ao dia = parcela de R$100 com 10 dias de atraso → R$105,00</p>
            </div>
          </div>
        </div>

        {/* Importar / Exportar Dados */}
        <div className="bg-dark-700 rounded-2xl p-5 border border-dark-500/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-primary-500/10 rounded-xl flex items-center justify-center">
              <Database className="w-4 h-4 text-primary-400" />
            </div>
            <h3 className="text-base font-semibold text-white">Dados</h3>
          </div>
          <p className="text-xs text-gray-500 mb-4">Exporte seus dados para backup ou importe de um arquivo.</p>
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <button onClick={() => {
                const dados = {
                  exportadoEm: new Date().toISOString(),
                  usuario: userData,
                  clientes: clientes || [],
                  parcelamentos: parcelamentos || [],
                  parcelas: parcelas || [],
                }
                const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `parcelyx-backup-${new Date().toISOString().split('T')[0]}.json`
                a.click()
                URL.revokeObjectURL(url)
                setMessage('✅ Dados exportados em JSON!')
              }}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-pix-500/10 hover:bg-pix-500/20 text-pix-400 font-semibold rounded-xl transition-all border border-pix-500/20 text-sm">
                <Download className="w-4 h-4" /> JSON
              </button>
              <button onClick={() => {
                if (!clientes || clientes.length === 0) { setMessage('⚠️ Nenhum dado para exportar.'); return }
                const headers = ['Nome', 'Telefone', 'CPF', 'Endereço', 'Observações']
                const rows = clientes.map(c => [c.nome, c.telefone, c.cpf || '', c.endereco || '', c.observacoes || ''].map(v => `"${v}"`).join(','))
                const csv = [headers.join(','), ...rows].join('\n')
                const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `parcelyx-clientes-${new Date().toISOString().split('T')[0]}.csv`
                a.click()
                URL.revokeObjectURL(url)
                setMessage('✅ Clientes exportados em CSV!')
              }}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-pix-500/10 hover:bg-pix-500/20 text-pix-400 font-semibold rounded-xl transition-all border border-pix-500/20 text-sm">
                <Download className="w-4 h-4" /> CSV
              </button>
            </div>
            <button onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 font-semibold rounded-xl transition-all border border-primary-500/20">
              <Upload className="w-4 h-4" /> Importar dados
            </button>
            <input ref={fileInputRef} type="file" accept=".json,.csv,.xls,.xlsx,.txt" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0]
              if (!file) return
              const ext = file.name.split('.').pop().toLowerCase()

              if (ext === 'json') {
                const reader = new FileReader()
                reader.onload = (ev) => {
                  try {
                    const dados = JSON.parse(ev.target.result)
                    if (dados.clientes || dados.parcelamentos) {
                      setMessage(`✅ JSON carregado: ${dados.clientes?.length || 0} clientes, ${dados.parcelamentos?.length || 0} contratos.`)
                    } else {
                      setMessage('⚠️ JSON inválido. Use um backup gerado pelo Parcelyx.')
                    }
                  } catch (err) {
                    setMessage('❌ Erro ao ler JSON. Verifique o formato.')
                  }
                }
                reader.readAsText(file)
              } else if (ext === 'csv' || ext === 'txt') {
                const reader = new FileReader()
                reader.onload = (ev) => {
                  try {
                    const text = ev.target.result
                    const lines = text.split('\n').filter(l => l.trim())
                    const headers = lines[0].split(/[,;\t]/).map(h => h.trim().toLowerCase())
                    const rows = lines.slice(1).map(line => {
                      const values = line.split(/[,;\t]/)
                      const obj = {}
                      headers.forEach((h, i) => { obj[h] = values[i]?.trim() || '' })
                      return obj
                    })
                    setMessage(`✅ CSV carregado: ${rows.length} registros encontrados. Colunas: ${headers.join(', ')}`)
                  } catch (err) {
                    setMessage('❌ Erro ao ler CSV.')
                  }
                }
                reader.readAsText(file)
              } else if (ext === 'xls' || ext === 'xlsx') {
                setMessage('📊 Arquivo Excel detectado. Para importar planilhas, exporte como CSV primeiro (Salvar como → CSV) e importe novamente.')
              } else {
                setMessage('⚠️ Formato não suportado. Use JSON, CSV ou TXT.')
              }
              e.target.value = ''
            }} />
          </div>
          <p className="text-xs text-gray-600 mt-3">Formatos aceitos: JSON, CSV, TXT, XLS, XLSX</p>
        </div>

        {/* Save button */}
        <button onClick={async () => {
            setSaving(true); setMessage('')
            const result = await updateUserData({
              negocio: config.nomeEmpresa, telefone: config.telefone,
              chave_pix: config.chavePix, tipo_chave_pix: config.tipoChavePix,
              multa_diaria: parseFloat(config.multaDiaria) || 0,
            })
            setSaving(false)
            if (result && !result.error) {
              setMessage('Configurações salvas com sucesso.')
            } else {
              setMessage('Falha ao salvar. Verifique sua conexão.')
            }
          }} disabled={saving}
          className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-all">
          {saving ? 'Salvando...' : 'Salvar configurações'}
        </button>

        {message && <p className="text-center text-sm text-gray-400 mt-3">{message}</p>}

        <p className="text-center text-xs text-gray-600 pt-4">
          Parcelyx v2.0.0 • © 2026 Todos os direitos reservados
        </p>
        <button onClick={() => setShowChangelog(true)}
          className="w-full mt-3 py-2.5 bg-dark-600 hover:bg-dark-500 text-gray-300 text-sm font-medium rounded-xl border border-dark-500/50 transition-all">
          🆕 Ver novidades da atualização
        </button>
      </div>

      {/* Modal Changelog */}
      {showChangelog && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-10 px-4" onClick={() => setShowChangelog(false)}>
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative bg-dark-800 w-full max-w-md rounded-2xl border border-dark-500/50 shadow-elevated max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-dark-800 p-5 pb-3 border-b border-dark-500/50 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">🚀 Novidades v2.0</h2>
                <button onClick={() => setShowChangelog(false)} className="p-1 rounded-lg hover:bg-dark-600 text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Julho 2026</p>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <span className="text-lg">🎨</span>
                  <div>
                    <p className="text-sm font-semibold text-white">Novo design dark</p>
                    <p className="text-xs text-gray-400">Interface moderna com tema escuro, cards vibrantes e navegação otimizada para mobile.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-lg">📅</span>
                  <div>
                    <p className="text-sm font-semibold text-white">Agenda / Calendário</p>
                    <p className="text-xs text-gray-400">Visualize todos os vencimentos do mês em um calendário interativo.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-lg">⚡</span>
                  <div>
                    <p className="text-sm font-semibold text-white">Cobrança em massa</p>
                    <p className="text-xs text-gray-400">Envie cobrança via WhatsApp para todos os clientes com parcelas vencendo hoje ou atrasadas com 1 clique.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-lg">💰</span>
                  <div>
                    <p className="text-sm font-semibold text-white">Pagamento parcial</p>
                    <p className="text-xs text-gray-400">Registre pagamentos com valor diferente. O restante é redistribuído nas próximas parcelas com juros.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-lg">📎</span>
                  <div>
                    <p className="text-sm font-semibold text-white">Comprovante de pagamento</p>
                    <p className="text-xs text-gray-400">Anexe foto do comprovante ao confirmar pagamento. Visualize depois na lista de parcelas pagas.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-lg">📊</span>
                  <div>
                    <p className="text-sm font-semibold text-white">Relatório PDF</p>
                    <p className="text-xs text-gray-400">Gere um resumo financeiro mensal em PDF com empréstimos, recebimentos e lucro.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-lg">🏷️</span>
                  <div>
                    <p className="text-sm font-semibold text-white">Classificação automática</p>
                    <p className="text-xs text-gray-400">Clientes são classificados como Bom pagador, Neutro ou Mau pagador baseado no histórico.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-lg">💸</span>
                  <div>
                    <p className="text-sm font-semibold text-white">Multa por atraso</p>
                    <p className="text-xs text-gray-400">Configure % de multa por dia de atraso. O valor é calculado automaticamente na lista de parcelas.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-lg">🔄</span>
                  <div>
                    <p className="text-sm font-semibold text-white">Renovar contrato</p>
                    <p className="text-xs text-gray-400">Renove um contrato com 1 clique — preenche tudo automaticamente pro mesmo cliente.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-lg">📱</span>
                  <div>
                    <p className="text-sm font-semibold text-white">Frequência flexível</p>
                    <p className="text-xs text-gray-400">Parcelas diárias, semanais, quinzenais ou mensais. Com opção de dias úteis.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-lg">🔍</span>
                  <div>
                    <p className="text-sm font-semibold text-white">Busca global</p>
                    <p className="text-xs text-gray-400">Encontre clientes e contratos rapidamente pelo ícone de busca no topo.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-lg">🔔</span>
                  <div>
                    <p className="text-sm font-semibold text-white">Alertas inteligentes</p>
                    <p className="text-xs text-gray-400">Notificações de parcelas vencendo hoje, amanhã e atrasadas direto no Dashboard e no sino.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-lg">💼</span>
                  <div>
                    <p className="text-sm font-semibold text-white">Capital disponível</p>
                    <p className="text-xs text-gray-400">Acompanhe quanto tem disponível para emprestar com cálculo automático.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-lg">📤</span>
                  <div>
                    <p className="text-sm font-semibold text-white">Importar / Exportar</p>
                    <p className="text-xs text-gray-400">Exporte dados em JSON ou CSV. Importe de JSON, CSV ou TXT.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
