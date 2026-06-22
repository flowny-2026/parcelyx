import { createClient } from '@supabase/supabase-js'

// Configuração usando variáveis de ambiente com fallback
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://rflwwbzqfpivezcnhbum.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmbHd3YnpxZnBpdmV6Y25oYnVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3Mjg0MzAsImV4cCI6MjA5NzMwNDQzMH0.NZyqEyACBGlB7Ckywa0Cci4d4AFq2eQdDycx1OfRoo0'

// Validação de configuração (apenas warning, não bloqueia)
if (!import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn(
    '⚠️ Credenciais do Supabase não configuradas no ambiente. ' +
    'Usando credenciais padrão. Configure as variáveis VITE_SUPABASE_URL ' +
    'e VITE_SUPABASE_ANON_KEY no Vercel.'
  )
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ====== MAPEADOR snake_case → camelCase ======
// O Supabase retorna "cliente_nome", mas o React espera "clienteNome"
// Esta função converte automaticamente as chaves dos objetos

function toCamel(str) {
  return str.replace(/_([a-z])/g, (_, l) => l.toUpperCase())
}

function toSnake(str) {
  return str.replace(/[A-Z]/g, l => '_' + l.toLowerCase())
}

function mapKeys(obj, converter) {
  if (obj === null || obj === undefined) return obj
  if (Array.isArray(obj)) return obj.map(item => mapKeys(item, converter))
  if (typeof obj !== 'object') return obj
  const result = {}
  for (const [key, value] of Object.entries(obj)) {
    result[converter(key)] = value
  }
  return result
}

// ====== AUTENTICAÇÃO ======

export async function signUp(email, password, userData) {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) throw authError

    // Calcula data de expiração (7 dias de trial)
    const dataExpiracao = new Date()
    dataExpiracao.setDate(dataExpiracao.getDate() + 7)

    const { error: userError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        email: email,
        nome: userData.nome,
        negocio: userData.negocio,
        telefone: userData.telefone,
        saldo_caixa: 0,
        plano: 'teste',
        data_expiracao: dataExpiracao.toISOString().split('T')[0]
      }])

    if (userError) throw userError

    return { data: authData.user, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return { data: data.user, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// ====== CLIENTES ======

export async function getClientes() {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .order('created_at', { ascending: false })
  
  return { data: data ? mapKeys(data, toCamel) : data, error }
}

export async function createCliente(cliente) {
  const user = await getCurrentUser()
  const { data, error } = await supabase
    .from('clientes')
    .insert([{ ...mapKeys(cliente, toSnake), user_id: user.id }])
    .select()
    .single()
  
  return { data: data ? mapKeys(data, toCamel) : data, error }
}

export async function updateCliente(id, updates) {
  const { data, error } = await supabase
    .from('clientes')
    .update(mapKeys(updates, toSnake))
    .eq('id', id)
    .select()
    .single()
  
  return { data: data ? mapKeys(data, toCamel) : data, error }
}

export async function deleteCliente(id) {
  const { error } = await supabase
    .from('clientes')
    .delete()
    .eq('id', id)
  
  return { error }
}

// ====== PARCELAMENTOS ======

export async function getParcelamentos() {
  const { data, error } = await supabase
    .from('parcelamentos')
    .select('*')
    .order('created_at', { ascending: false })
  
  return { data: data ? mapKeys(data, toCamel) : data, error }
}

export async function createParcelamento(parcelamento) {
  try {
    const user = await getCurrentUser()
    
    // Converte camelCase do React para snake_case do Supabase
    const parcelamentoSnake = mapKeys(parcelamento, toSnake)
    
    // Criar parcelamento
    const { data: parcData, error: parcError } = await supabase
      .from('parcelamentos')
      .insert([{ ...parcelamentoSnake, user_id: user.id }])
      .select()
      .single()

    if (parcError) throw parcError

    // Gera parcelas - usa o objeto retornado (snake_case) + os dados do form
    const dadosCompletos = { ...parcData, ...parcelamentoSnake }
    const parcelas = generateParcelas(dadosCompletos)
    const { error: parcelasError } = await supabase
      .from('parcelas')
      .insert(parcelas.map(p => ({ ...p, user_id: user.id })))

    if (parcelasError) throw parcelasError

    return { data: mapKeys(parcData, toCamel), error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function updateParcelamento(id, updates) {
  const { data, error } = await supabase
    .from('parcelamentos')
    .update(mapKeys(updates, toSnake))
    .eq('id', id)
    .select()
    .single()
  
  return { data: data ? mapKeys(data, toCamel) : data, error }
}

export async function deleteParcelamento(id) {
  const { error } = await supabase
    .from('parcelamentos')
    .delete()
    .eq('id', id)
  
  return { error }
}

// ====== PARCELAS ======

export async function getParcelas() {
  const { data, error } = await supabase
    .from('parcelas')
    .select('*')
    .order('vencimento', { ascending: true })
  
  return { data: data ? mapKeys(data, toCamel) : data, error }
}

export async function marcarParcelaPaga(id) {
  const { data, error } = await supabase
    .from('parcelas')
    .update({ 
      status: 'pago',
      data_pagamento: new Date().toISOString().split('T')[0]
    })
    .eq('id', id)
    .select()
    .single()
  
  return { data: data ? mapKeys(data, toCamel) : data, error }
}

// ====== USUÁRIO ======

export async function getUserData() {
  const user = await getCurrentUser()
  if (!user) return { data: null, error: new Error('Usuário não autenticado') }
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()
  
  return { data: data ? mapKeys(data, toCamel) : data, error }
}

export async function updateUserData(updates) {
  const user = await getCurrentUser()
  if (!user) return { data: null, error: new Error('Usuário não autenticado') }
  
  const { data, error } = await supabase
    .from('users')
    .update(mapKeys(updates, toSnake))
    .eq('id', user.id)
    .select()
    .single()
  
  return { data: data ? mapKeys(data, toCamel) : data, error }
}

// ====== HELPER ======

function generateParcelas(parcelamento) {
  const parcelas = []
  const valorParcela = ((parcelamento.valor_total - parcelamento.entrada) * (1 + parcelamento.juros / 100)) / parcelamento.parcelas
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Normaliza para comparação

  for (let i = 1; i <= parcelamento.parcelas; i++) {
    // Cria data base a partir da data de criação
    const d = new Date(parcelamento.data_criacao)
    
    // Primeiro define o dia do vencimento
    d.setDate(parcelamento.vencimento)
    
    // Depois adiciona os meses
    d.setMonth(d.getMonth() + i)
    
    // Ajusta caso o dia não exista no mês (ex: 31 em fevereiro)
    // Se ultrapassou o dia desejado, volta para o último dia do mês anterior
    if (d.getDate() !== parcelamento.vencimento) {
      d.setDate(0) // Vai para o último dia do mês anterior
    }
    
    // Normaliza para comparação
    const dNormalized = new Date(d)
    dNormalized.setHours(0, 0, 0, 0)
    
    // Define status baseado na data
    let status = 'pendente'
    if (dNormalized < today) {
      status = 'atrasado'
    } else if (dNormalized.getTime() === today.getTime()) {
      status = 'vence_hoje'
    }

    parcelas.push({
      parcelamento_id: parcelamento.id,
      cliente_id: parcelamento.cliente_id,
      cliente_nome: parcelamento.cliente_nome,
      numero: i,
      total_parcelas: parcelamento.parcelas,
      valor: Math.round(valorParcela * 100) / 100,
      vencimento: d.toISOString().split('T')[0],
      status: status,
      data_pagamento: null
    })
  }

  return parcelas
}
