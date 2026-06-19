import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

const ADMIN_EMAIL = 'admin@parcelyx.com'
const ADMIN_SENHA = 'admin123'

export default function Admin() {
  const [autenticado, setAutenticado] = useState(false)
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [secao, setSecao] = useState('dashboard')
  const [contas, setContas] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = (e) => {
    e.preventDefault()
    if (email === ADMIN_EMAIL && senha === ADMIN_SENHA) {
      setAutenticado(true)
      carregarContas()
    } else {
      setErro('E-mail ou senha incorretos')
      setTimeout(() => setErro(''), 3000)
    }
  }

  const carregarContas = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      const contasFormatadas = data.map((u, i) => ({
        id: i + 1,
        nome: u.nome || 'Sem nome',
        email: u.email || 'Não informado',
        telefone: u.telefone || 'Não informado',
        negocio: u.negocio || 'Sem negócio',
        plano: u.plano === 'teste' ? 'Trial' : 'Mensal',
        status: calcularStatus(u.data_expiracao, u.plano),
        vencimento: u.data_expiracao ? new Date(u.data_expiracao).toLocaleDateString('pt-BR') : 'Não definido',
        criado: u.created_at ? new Date(u.created_at).toLocaleDateString('pt-BR') : 'Não definido'
      }))
      
      setContas(contasFormatadas)
    } catch (error) {
      console.error('Erro ao carregar contas:', error)
      // Dados de exemplo se falhar
      setContas([
        { id: 1, nome: 'João Silva', email: 'joao@exemplo.com', telefone: '(11) 99999-1111', negocio: 'Loja João', plano: 'Mensal', status: 'Ativo', vencimento: '15/07/2025', criado: '01/06/2025' },
        { id: 2, nome: 'Maria Santos', email: 'maria@exemplo.com', telefone: '(11) 99999-2222', negocio: 'Maria Confeitaria', plano: 'Trial', status: 'Trial', vencimento: '26/06/2025', criado: '19/06/2025' }
      ])
    }
    setLoading(false)
  }

  const calcularStatus = (dataExpiracao, plano) => {
    if (!dataExpiracao) return 'Ativo'
    const hoje = new Date()
    const expira = new Date(dataExpiracao)
    if (plano === 'teste' && expira > hoje) return 'Trial'
    if (expira < hoje) return 'Suspenso'
    return 'Ativo'
  }

  const sair = () => {
    setAutenticado(false)
    setEmail('')
    setSenha('')
  }

  // Tela de Login
  if (!autenticado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center bg-white rounded-2xl shadow-lg p-4 mb-4">
              <img src="/img/180x120px.png" alt="Parcelyx" className="h-16" />
            </div>
            <div className="inline-block bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              ⚙️ PAINEL ADMINISTRATIVO
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso Restrito</h2>
            <p className="text-sm text-gray-500 mb-6">Somente administradores autorizados</p>

            {erro && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {erro}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail admin</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@parcelyx.com"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Senha</label>
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Entrar no painel
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              <button onClick={() => navigate('/login')} className="text-blue-600 hover:underline">
                ← Voltar ao sistema
              </button>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Painel Admin
  const stats = {
    ativos: contas.filter(c => c.status === 'Ativo').length,
    trial: contas.filter(c => c.status === 'Trial').length,
    suspensos: contas.filter(c => c.status === 'Suspenso').length,
    total: contas.length
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src="/img/140x93px.png" alt="Parcelyx" className="h-10" />
              <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">ADMIN</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900">Super Admin</div>
                <div className="text-xs text-gray-500">admin@parcelyx.com</div>
              </div>
              <button
                onClick={sair}
                className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Visão geral da plataforma</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-600">Contas Ativas</div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">👥</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.ativos}</div>
            <div className="text-xs text-green-600 mt-1">↑ Funcionando</div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-600">Em Trial</div>
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">⏱️</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.trial}</div>
            <div className="text-xs text-amber-600 mt-1">Período teste</div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-600">Suspensos</div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">⚠️</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.suspensos}</div>
            <div className="text-xs text-red-600 mt-1">Requer atenção</div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-600">Total</div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-500 mt-1">Todas as contas</div>
          </div>
        </div>

        {/* Tabela de Contas */}
        <div className="bg-white rounded-xl shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Todas as Contas</h2>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-gray-500">Carregando...</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuário</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Negócio</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plano</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vencimento</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Criado em</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {contas.map((conta) => (
                    <tr key={conta.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">{conta.nome[0]}</span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{conta.nome}</div>
                            <div className="text-sm text-gray-500">{conta.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{conta.negocio}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          conta.plano === 'Mensal' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {conta.plano}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          conta.status === 'Ativo' ? 'bg-green-100 text-green-800' :
                          conta.status === 'Trial' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {conta.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{conta.vencimento}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{conta.criado}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
