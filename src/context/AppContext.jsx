import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  getSession, 
  signOut,
  getClientes, 
  createCliente as createClienteSupabase,
  updateCliente as updateClienteSupabase,
  deleteCliente as deleteClienteSupabase,
  getParcelamentos,
  createParcelamento as createParcelamentoSupabase,
  updateParcelamento as updateParcelamentoSupabase,
  deleteParcelamento as deleteParcelamentoSupabase,
  getParcelas,
  marcarParcelaPaga as marcarParcelaPagaSupabase,
  getUserData,
  updateUserData,
  supabase,
} from '../lib/supabase'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [clientes, setClientes] = useState([])
  const [parcelamentos, setParcelamentos] = useState([])
  const [parcelas, setParcelas] = useState([])
  const [userData, setUserData] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    let timeoutId = null

    async function init() {
      try {
        // Timeout de segurança - garante que loading não fique infinito
        timeoutId = setTimeout(() => {
          if (mounted && loading) {
            console.warn('Loading timeout - forçando fim do loading')
            setLoading(false)
            setIsAuthenticated(false) // Força ir para login se demorar muito
          }
        }, 3000) // 3 segundos máximo

        // Verifica sessão inicial
        const session = await getSession()
        
        if (mounted) {
          if (session) {
            setIsAuthenticated(true)
            try {
              await loadAllData()
            } catch (error) {
              console.error('Erro ao carregar dados:', error)
            }
          }
          setLoading(false)
          if (timeoutId) clearTimeout(timeoutId)
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error)
        if (mounted) {
          setLoading(false)
          setIsAuthenticated(false)
          if (timeoutId) clearTimeout(timeoutId)
        }
      }
    }

    init()

    // Escuta mudanças de auth (login/logout/troca de conta)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      console.log('Auth state changed:', event)

      if (event === 'SIGNED_IN' && session) {
        setIsAuthenticated(true)
        try {
          await loadAllData()
        } catch (error) {
          console.error('Erro ao carregar dados após login:', error)
        }
      } else if (event === 'SIGNED_OUT') {
        // Limpa TODOS os dados ao fazer logout
        setIsAuthenticated(false)
        setClientes([])
        setParcelamentos([])
        setParcelas([])
        setUserData(null)
      }
    })

    return () => {
      mounted = false
      if (timeoutId) clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [])

  async function loadAllData() {
    try {
      // Verifica se há usuário logado antes de carregar dados
      const session = await getSession()
      if (!session) {
        console.log('Nenhuma sessão ativa, pulando loadAllData')
        return
      }

      // Limpa dados anteriores antes de carregar os do usuário atual
      setClientes([])
      setParcelamentos([])
      setParcelas([])
      setUserData(null)

      const [clientesRes, parcelamentosRes, parcelasRes, userRes] = await Promise.all([
        getClientes(),
        getParcelamentos(),
        getParcelas(),
        getUserData()
      ])

      if (clientesRes.data) setClientes(clientesRes.data)
      if (parcelamentosRes.data) setParcelamentos(parcelamentosRes.data)
      if (parcelasRes.data) setParcelas(parcelasRes.data)
      if (userRes.data) setUserData(userRes.data)
      
      console.log('Dados carregados com sucesso')
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
  }

  async function addCliente(cliente) {
    const { data, error } = await createClienteSupabase(cliente)
    if (!error && data) {
      setClientes([data, ...clientes])
      return { success: true, data }
    }
    return { success: false, error }
  }

  async function editCliente(id, updates) {
    const { data, error } = await updateClienteSupabase(id, updates)
    if (!error && data) {
      setClientes(clientes.map(c => c.id === id ? data : c))
      return { success: true, data }
    }
    return { success: false, error }
  }

  async function removeCliente(id) {
    const { error } = await deleteClienteSupabase(id)
    if (!error) {
      setClientes(clientes.filter(c => c.id !== id))
      return { success: true }
    }
    return { success: false, error }
  }

  async function addParcelamento(parcelamento) {
    const { data, error } = await createParcelamentoSupabase(parcelamento)
    if (!error && data) {
      setParcelamentos([data, ...parcelamentos])
      await loadAllData()
      return { success: true, data }
    }
    return { success: false, error }
  }

  async function editParcelamento(id, updates) {
    const { data, error } = await updateParcelamentoSupabase(id, updates)
    if (!error && data) {
      setParcelamentos(parcelamentos.map(p => p.id === id ? data : p))
      return { success: true, data }
    }
    return { success: false, error }
  }

  async function removeParcelamento(id) {
    const { error } = await deleteParcelamentoSupabase(id)
    if (!error) {
      setParcelamentos(parcelamentos.filter(p => p.id !== id))
      setParcelas(parcelas.filter(p => p.parcelamentoId !== id))
      return { success: true }
    }
    return { success: false, error }
  }

  async function marcarPago(parcelaId) {
    const { data, error } = await marcarParcelaPagaSupabase(parcelaId)
    if (!error && data) {
      setParcelas(parcelas.map(p => p.id === parcelaId ? data : p))
      return { success: true, data }
    }
    return { success: false, error }
  }

  async function updateSaldoCaixa(valor) {
    const { data, error } = await updateUserData({ saldo_caixa: valor })
    if (!error && data) {
      setUserData(data)
      return { success: true, data }
    }
    return { success: false, error }
  }

  async function logout() {
    await signOut()
    // onAuthStateChange cuida da limpeza dos dados
  }

  const getStats = () => {
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()

    const recebidoMes = parcelas
      .filter(p => p.status === 'pago' && p.dataPagamento)
      .filter(p => {
        const d = new Date(p.dataPagamento)
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear
      })
      .reduce((sum, p) => sum + p.valor, 0)

    const totalAtrasado = parcelas
      .filter(p => p.status === 'atrasado')
      .reduce((sum, p) => sum + p.valor, 0)

    const vencendoHoje = parcelas.filter(p => p.status === 'vence_hoje').length

    const totalParcelas = parcelas.filter(p => p.status !== 'pago').length
    const atrasadas = parcelas.filter(p => p.status === 'atrasado').length
    const inadimplencia = totalParcelas > 0 ? Math.round((atrasadas / totalParcelas) * 100) : 0

    return { recebidoMes, totalAtrasado, vencendoHoje, inadimplencia }
  }

  const getRecebimentosRecentes = () => {
    return parcelas
      .filter(p => p.status === 'pago' && p.dataPagamento)
      .sort((a, b) => new Date(b.dataPagamento) - new Date(a.dataPagamento))
      .slice(0, 5)
  }

  const getChartData = () => {
    const months = []
    const today = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const monthName = d.toLocaleDateString('pt-BR', { month: 'short' })
      const recebido = parcelas
        .filter(p => p.status === 'pago' && p.dataPagamento)
        .filter(p => {
          const pd = new Date(p.dataPagamento)
          return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear()
        })
        .reduce((sum, p) => sum + p.valor, 0)
      months.push({ mes: monthName, recebido: Math.round(recebido) })
    }
    return months
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center gap-4">
          <div className="inline-flex items-center justify-center bg-white rounded-2xl shadow-lg p-6 mb-2">
            <img 
              src="/img/180x120px.png" 
              alt="Parcelyx Logo" 
              className="h-20 w-auto object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/img/icon-192.png';
              }}
            />
          </div>
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-600 font-medium">Carregando aplicação...</p>
        </div>
      </div>
    )
  }

  return (
    <AppContext.Provider value={{
      clientes, 
      parcelamentos, 
      parcelas, 
      userData,
      isAuthenticated, 
      setIsAuthenticated,
      loading,
      addCliente,
      editCliente,
      removeCliente,
      addParcelamento,
      editParcelamento,
      removeParcelamento,
      marcarPago,
      updateSaldoCaixa,
      updateUserData,
      logout,
      loadAllData,
      getStats, 
      getRecebimentosRecentes, 
      getChartData,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within AppProvider')
  return context
}
