import React, { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { User, Building, CreditCard, Bell, Shield, Palette } from 'lucide-react'

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

  return (
    <div className="space-y-6 pb-20 md:pb-0 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Configurações</h1>
        <p className="text-sm text-neutral-500 mt-1">Personalize seu Parcelyx</p>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {/* Business info */}
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center">
              <Building className="w-4 h-4 text-primary-600" />
            </div>
            <h3 className="text-base font-semibold text-neutral-900">Dados do negócio</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Nome da empresa</label>
              <input
                type="text"
                value={config.nomeEmpresa}
                onChange={(e) => setConfig({ ...config, nomeEmpresa: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Telefone</label>
              <input
                type="tel"
                value={config.telefone}
                onChange={(e) => setConfig({ ...config, telefone: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">E-mail</label>
              <input
                type="email"
                value={config.email}
                onChange={(e) => setConfig({ ...config, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm"
              />
            </div>
          </div>
        </div>

        {/* PIX config */}
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-pix-50 rounded-xl flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-pix-600" />
            </div>
            <h3 className="text-base font-semibold text-neutral-900">Chave PIX</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Tipo de chave</label>
              <select
                value={config.tipoChavePix}
                onChange={(e) => setConfig({ ...config, tipoChavePix: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm bg-white"
              >
                <option value="cpf">CPF</option>
                <option value="cnpj">CNPJ</option>
                <option value="email">E-mail</option>
                <option value="telefone">Telefone</option>
                <option value="aleatoria">Chave aleatória</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Chave PIX</label>
              <input
                type="text"
                value={config.chavePix}
                onChange={(e) => setConfig({ ...config, chavePix: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
              <Bell className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="text-base font-semibold text-neutral-900">Notificações</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-900">Notificações push</p>
                <p className="text-xs text-neutral-500">Receba alertas de pagamentos</p>
              </div>
              <button
                onClick={() => setConfig({ ...config, notificacoes: !config.notificacoes })}
                className={`w-11 h-6 rounded-full transition-colors relative ${config.notificacoes ? 'bg-primary-600' : 'bg-neutral-300'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5 transition-transform ${config.notificacoes ? 'translate-x-5.5 right-0.5' : 'left-0.5'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-900">Lembrete automático</p>
                <p className="text-xs text-neutral-500">Lembrar clientes antes do vencimento</p>
              </div>
              <button
                onClick={() => setConfig({ ...config, lembreteAutomatico: !config.lembreteAutomatico })}
                className={`w-11 h-6 rounded-full transition-colors relative ${config.lembreteAutomatico ? 'bg-primary-600' : 'bg-neutral-300'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5 transition-transform ${config.lembreteAutomatico ? 'translate-x-5.5 right-0.5' : 'left-0.5'}`} />
              </button>
            </div>
            {config.lembreteAutomatico && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Dias antes do vencimento</label>
                <input
                  type="number"
                  min="1"
                  max="7"
                  value={config.diasAntesLembrete}
                  onChange={(e) => setConfig({ ...config, diasAntesLembrete: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm"
                />
              </div>
            )}
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={async () => {
            setSaving(true)
            setMessage('')
            const result = await updateUserData({
              negocio: config.nomeEmpresa,
              telefone: config.telefone,
              email: config.email,
              chave_pix: config.chavePix,
              tipo_chave_pix: config.tipoChavePix,
            })
            setSaving(false)
            if (result.success) {
              setMessage('Configurações salvas com sucesso.')
            } else {
              setMessage('Falha ao salvar. Verifique sua conexão e tente novamente.')
            }
          }}
          disabled={saving}
          className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-all shadow-sm"
        >
          {saving ? 'Salvando...' : 'Salvar configurações'}
        </button>

        {message && (
          <p className="text-center text-sm text-neutral-600 mt-3">{message}</p>
        )}

        {/* Version */}
        <p className="text-center text-xs text-neutral-400 pt-4">
          Parcelyx v1.0.0 • Feito com ❤️ para pequenos negócios
        </p>
      </div>
    </div>
  )
}
