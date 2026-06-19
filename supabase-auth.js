// =====================================================
// SUPABASE - AUTENTICAÇÃO E INTEGRAÇÃO COM BANCO
// =====================================================

// ── AUTENTICAÇÃO ──────────────────────────────────────

// Cadastrar novo usuário
async function cadastrarUsuario(email, senha, nome, negocio, telefone) {
  try {
    // 1. Cria o usuário na auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: senha,
    });

    if (authError) throw authError;

    // 2. Insere dados extras na tabela users (incluindo email)
    const { error: userError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        nome: nome,
        email: email,
        negocio: negocio,
        telefone: telefone,
        saldo_caixa: 0
      }]);

    if (userError) throw userError;

    return { success: true, user: authData.user };
  } catch (error) {
    console.error('Erro ao cadastrar:', error);
    return { success: false, error: error.message };
  }
}

// Login
async function fazerLoginSupabase(email, senha) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: senha,
    });

    if (error) throw error;

    return { success: true, user: data.user };
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return { success: false, error: error.message };
  }
}

// Logout
async function fazerLogout() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    return { success: false, error: error.message };
  }
}

// Verificar se usuário está logado
async function verificarSessao() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// Pegar usuário atual
async function getUsuarioAtual() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// ── CLIENTES ──────────────────────────────────────────

// Buscar todos os clientes do usuário
async function buscarClientes() {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return { success: false, error: error.message };
  }
}

// Criar cliente
async function criarCliente(cliente) {
  try {
    const user = await getUsuarioAtual();
    const { data, error } = await supabase
      .from('clientes')
      .insert([{ ...cliente, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    return { success: false, error: error.message };
  }
}

// Atualizar cliente
async function atualizarCliente(id, updates) {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    return { success: false, error: error.message };
  }
}

// Deletar cliente
async function deletarCliente(id) {
  try {
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    return { success: false, error: error.message };
  }
}

// ── PARCELAMENTOS ─────────────────────────────────────

// Buscar todos os parcelamentos
async function buscarParcelamentos() {
  try {
    const { data, error } = await supabase
      .from('parcelamentos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao buscar parcelamentos:', error);
    return { success: false, error: error.message };
  }
}

// Criar parcelamento (e gerar parcelas automaticamente)
async function criarParcelamento(parcelamento) {
  try {
    const user = await getUsuarioAtual();
    
    // 1. Cria o parcelamento
    const { data: parcData, error: parcError } = await supabase
      .from('parcelamentos')
      .insert([{ ...parcelamento, user_id: user.id }])
      .select()
      .single();

    if (parcError) throw parcError;

    // 2. Gera as parcelas
    const parcelas = gerarParcelasArray(parcData);
    const { error: parcelasError } = await supabase
      .from('parcelas')
      .insert(parcelas.map(p => ({ ...p, user_id: user.id })));

    if (parcelasError) throw parcelasError;

    return { success: true, data: parcData };
  } catch (error) {
    console.error('Erro ao criar parcelamento:', error);
    return { success: false, error: error.message };
  }
}

// Atualizar parcelamento
async function atualizarParcelamento(id, updates) {
  try {
    const { data, error } = await supabase
      .from('parcelamentos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao atualizar parcelamento:', error);
    return { success: false, error: error.message };
  }
}

// Deletar parcelamento (parcelas deletam automaticamente por CASCADE)
async function deletarParcelamento(id) {
  try {
    const { error } = await supabase
      .from('parcelamentos')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar parcelamento:', error);
    return { success: false, error: error.message };
  }
}

// ── PARCELAS ──────────────────────────────────────────

// Buscar todas as parcelas
async function buscarParcelas() {
  try {
    const { data, error } = await supabase
      .from('parcelas')
      .select('*')
      .order('vencimento', { ascending: true });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao buscar parcelas:', error);
    return { success: false, error: error.message };
  }
}

// Marcar parcela como paga
async function marcarParcelaPaga(id) {
  try {
    const { data, error } = await supabase
      .from('parcelas')
      .update({ 
        status: 'pago',
        data_pagamento: new Date().toISOString().split('T')[0]
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao marcar parcela como paga:', error);
    return { success: false, error: error.message };
  }
}

// ── HELPER: GERAR PARCELAS ───────────────────────────

function gerarParcelasArray(parcelamento) {
  const parcelas = [];
  const valorParcela = ((parcelamento.valor_total - parcelamento.entrada) * (1 + parcelamento.juros / 100)) / parcelamento.parcelas;
  const today = new Date();

  for (let i = 1; i <= parcelamento.parcelas; i++) {
    const d = new Date(parcelamento.data_criacao);
    d.setMonth(d.getMonth() + i);
    d.setDate(parcelamento.vencimento);
    
    let status = 'pendente';
    if (d < today) status = 'atrasado';
    else if (d.toDateString() === today.toDateString()) status = 'vence_hoje';

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
    });
  }

  return parcelas;
}

// ── DADOS DO USUÁRIO ──────────────────────────────────

// Buscar dados extras do usuário
async function buscarDadosUsuario() {
  try {
    const user = await getUsuarioAtual();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    return { success: false, error: error.message };
  }
}

// Atualizar dados do usuário
async function atualizarDadosUsuario(updates) {
  try {
    const user = await getUsuarioAtual();
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao atualizar dados do usuário:', error);
    return { success: false, error: error.message };
  }
}
