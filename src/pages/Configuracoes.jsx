import React, { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { Building, CreditCard, Bell } from 'lucide-react'

export default function Configuracoes() {
  const { userData, updateUserData } = useApp()
  const [config, setConfig] = useState({
    nomeEmpresa: 'Meu Negócio',
    telefone: '',
    email: '',
    chavePix: '',
    tipoChavePix: 'email',
    notificacoes: true,
    lembreteAutomatico: true,
    diasAntesLembrete: 3,
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!userData) return
    setConfig(prev => ({
      ...prev,
      nomeEmpresa: userData.negocio || userData.nome || prev.nomeEmpresa,
      telefone: userData.telefone || prev.telefone,
      email: userData.email || prev.email,
      chavePix: userData.chave_pix || prev.chavePix,
      tipoChavePix: userData.tipo_chave_pix || prev.tipoChavePix,
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
                className={`w-11 h-6 rounded-full transition-colors relative ${config.notificacoes ? 'bg-pix-500' : 'bg-dark-500'}`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5 transition-transform ${config.notificacoes ? 'right-0.5' : 'left-0.5'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-200">Lembrete automático</p>
                <p className="text-xs text-gray-500">Lembrar clientes antes do vencimento</p>
              </div>
              <button onClick={() => setConfig({ ...config, lembreteAutomatico: !config.lembreteAutomatico })}
                className={`w-11 h-6 rounded-full transition-colors relative ${config.lembreteAutomatico ? 'bg-pix-500' : 'bg-dark-500'}`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5 transition-transform ${config.lembreteAutomatico ? 'right-0.5' : 'left-0.5'}`} />
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

        {/* Save button */}
        <button onClick={async () => {
            setSaving(true); setMessage('')
            const result = await updateUserData({
              negocio: config.nomeEmpresa, telefone: config.telefone, email: config.email,
              chave_pix: config.chavePix, tipo_chave_pix: config.tipoChavePix,
            })
            setSaving(false)
            setMessage(result.success ? 'Configurações salvas com sucesso.' : 'Falha ao salvar.')
          }} disabled={saving}
          className="w-full py-3.5 bg-pix-500 hover:bg-pix-600 disabled:opacity-60 text-white font-semibold rounded-xl transition-all">
          {saving ? 'Salvando...' : 'Salvar configurações'}
        </button>

        {message && <p className="text-center text-sm text-gray-400 mt-3">{message}</p>}

        <p className="text-center text-xs text-gray-600 pt-4">
          Parcelyx v1.0.0 • © 2026 Todos os direitos reservados
        </p>
      </div>
    </div>
  )
}
