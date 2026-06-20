
// ── TOGGLE SENHA ─────────────────────────────────────
function toggleSenhaAdmin(inputId, btn) {
  const input = document.getElementById(inputId);
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  btn.style.color = isHidden ? '#0729F5' : '#a3a3a3';
  btn.querySelector('svg').innerHTML = isHidden
    ? '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>'
    : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
}

// ── CREDENCIAIS ADMIN ─────────────────────────────────
const ADMIN_EMAIL = 'admin@parcelyx.com';
const ADMIN_SENHA = 'admin123';

// ── DADOS ────────────────────────────────────────────
let contas = [
  // Dados de exemplo caso o Supabase não esteja disponível
  { id: 1, nome: 'João Silva', email: 'joao@exemplo.com', telefone: '(11) 99999-1111', negocio: 'Loja João', plano: 'Mensal', status: 'Ativo', vencimento: '2025-07-15', criado: '2025-06-01', obs: '' },
  { id: 2, nome: 'Maria Santos', email: 'maria@exemplo.com', telefone: '(11) 99999-2222', negocio: 'Maria Confeitaria', plano: 'Trial', status: 'Trial', vencimento: '2025-06-26', criado: '2025-06-19', obs: 'Período de teste' },
];

// Função para carregar usuários reais do Supabase
async function carregarUsuariosReais() {
  try {
    console.log('🔍 Iniciando carregamento de usuários...');
    
    // Verifica se o Supabase está disponível
    if (typeof supabase === 'undefined') {
      console.warn('⚠️ Supabase não disponível, usando dados de exemplo');
      return contas;
    }
    
    console.log('✅ Supabase disponível, buscando usuários da tabela users...');
    
    // Busca todos os usuários da tabela users
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Erro ao carregar usuários do Supabase:', error);
      console.log('ℹ️ Usando dados de exemplo');
      return contas;
    }
    
    console.log(`✅ ${users?.length || 0} usuários encontrados na tabela users`);
    
    // Se houver usuários, converte para o formato esperado
    if (users && users.length > 0) {
      contas = users.map((u, index) => ({
        id: u.id || index + 1,
        nome: u.nome || u.email?.split('@')[0] || 'Sem nome',
        email: u.email || 'Não informado',
        telefone: u.telefone || 'Não informado',
        negocio: u.negocio || 'Sem negócio',
        plano: u.plano === 'teste' ? 'Trial' : 'Mensal',
        status: calcularStatus(u.data_expiracao, u.plano),
        vencimento: u.data_expiracao ? new Date(u.data_expiracao).toLocaleDateString('pt-BR') : 'Não definido',
        criado: u.created_at ? new Date(u.created_at).toLocaleDateString('pt-BR') : 'Não definido',
        obs: u.plano === 'teste' ? 'Período de teste' : ''
      }));
      console.log('✅ Contas formatadas:', contas.length);
    } else {
      console.log('ℹ️ Nenhum usuário na tabela users, usando dados de exemplo');
    }
    
    return contas;
  } catch (error) {
    console.error('❌ Erro ao carregar usuários:', error);
    console.log('ℹ️ Usando dados de exemplo');
    return contas;
  }
}

function calcularStatus(dataExpiracao, plano) {
  if (!dataExpiracao) return 'Ativo';
  const hoje = new Date();
  const expira = new Date(dataExpiracao);
  if (plano === 'teste' && expira > hoje) return 'Trial';
  if (expira < hoje) return 'Suspenso';
  return 'Ativo';
}

const planos = [
  { nome:'Mensal', preco:29, cor:'#0729F5', destaque:true, features:['Clientes ilimitados','Parcelas ilimitadas','WhatsApp integrado','PIX copia e cola','Cobranças automáticas','Suporte por WhatsApp'], usuarios: 0 },
];

const pagamentos = [
  { usuario:'João Silva', plano:'Mensal', valor:29, data:'2025-05-01', status:'Pago' },
  { usuario:'Carlos Ferreira', plano:'Mensal', valor:29, data:'2025-05-01', status:'Pago' },
  { usuario:'Pedro Costa', plano:'Mensal', valor:29, data:'2025-05-01', status:'Pago' },
  { usuario:'Lucia Mendes', plano:'Mensal', valor:29, data:'2025-05-01', status:'Pago' },
  { usuario:'Ana Oliveira', plano:'Mensal', valor:29, data:'2025-04-30', status:'Atrasado' },
  { usuario:'João Silva', plano:'Mensal', valor:29, data:'2025-04-01', status:'Pago' },
  { usuario:'Carlos Ferreira', plano:'Mensal', valor:29, data:'2025-04-01', status:'Pago' },
  { usuario:'Roberto Lima', plano:'Mensal', valor:29, data:'2025-03-01', status:'Estornado' },
];

const tickets = [
  { usuario:'Ana Oliveira', assunto:'Não consigo gerar PIX', status:'Aberto', data:'2025-05-08', prioridade:'Alta' },
  { usuario:'Maria Santos', assunto:'Como cadastrar cliente?', status:'Respondido', data:'2025-05-07', prioridade:'Baixa' },
  { usuario:'Roberto Lima', assunto:'Quero cancelar minha conta', status:'Fechado', data:'2025-05-01', prioridade:'Média' },
  { usuario:'Fernanda Rocha', assunto:'Erro ao marcar parcela como paga', status:'Aberto', data:'2025-05-09', prioridade:'Alta' },
];

// ── UTILS ─────────────────────────────────────────────
const fmt = v => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v);
const fmtDate = s => s ? new Date(s+'T12:00:00').toLocaleDateString('pt-BR') : '';

function showAdmToast(msg) {
  const t = document.getElementById('adm-toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// ── AUTH ──────────────────────────────────────────────
async function adminLogin() {
  const email = document.getElementById('adm-email').value.trim();
  const senha = document.getElementById('adm-senha').value.trim();
  const err = document.getElementById('login-error');
  
  console.log('Tentando login com:', email); // Debug
  
  if (email === ADMIN_EMAIL && senha === ADMIN_SENHA) {
    console.log('Credenciais corretas!'); // Debug
    document.getElementById('admin-login').classList.add('hidden');
    document.getElementById('admin-app').classList.remove('hidden');
    
    // Carrega usuários reais do Supabase (ou usa dados de exemplo)
    try {
      await carregarUsuariosReais();
      console.log('Contas carregadas:', contas.length); // Debug
    } catch (error) {
      console.error('Erro ao carregar contas:', error);
    }
    
    renderAdmDashboard();
  } else {
    console.log('Credenciais incorretas'); // Debug
    err.classList.remove('hidden');
    setTimeout(() => err.classList.add('hidden'), 3000);
  }
}

function adminLogout() {
  document.getElementById('admin-app').classList.add('hidden');
  document.getElementById('admin-login').classList.remove('hidden');
}

// Permitir Enter no login
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !document.getElementById('admin-login').classList.contains('hidden')) {
    adminLogin();
  }
});

// ── NAVEGAÇÃO ─────────────────────────────────────────
function adminNav(page, el) {
  document.querySelectorAll('.adm-section').forEach(s => s.classList.remove('active'));
  document.getElementById('adm-sec-' + page).classList.add('active');
  document.querySelectorAll('.admin-nav-item').forEach(n => n.classList.remove('active'));
  if (el) el.classList.add('active');
  else document.querySelectorAll(`.admin-nav-item[onclick*="'${page}'"]`).forEach(n => n.classList.add('active'));

  const titles = {
    dashboard: { h:'Dashboard', p:'Visão geral da plataforma' },
    contas: { h:'Contas', p:'Gerencie todos os usuários' },
    planos: { h:'Planos', p:'Configure os planos de assinatura' },
    financeiro: { h:'Financeiro', p:'Receitas e pagamentos' },
    suporte: { h:'Suporte', p:'Tickets e atendimento' },
    configuracoes: { h:'Configurações', p:'Configurações da plataforma' },
  };
  const t = titles[page];
  if (t) {
    document.querySelector('#admin-page-title h1').textContent = t.h;
    document.querySelector('#admin-page-title p').textContent = t.p;
  }

  if (page === 'dashboard') renderAdmDashboard();
  if (page === 'contas') renderContas();
  if (page === 'planos') renderPlanos();
  if (page === 'financeiro') renderAdmFinanceiro();
  if (page === 'suporte') renderSuporte();
}

// ── DASHBOARD ─────────────────────────────────────────
function renderAdmDashboard() {
  const ativos = contas.filter(c=>c.status==='Ativo').length;
  const trial = contas.filter(c=>c.status==='Trial').length;
  const suspensos = contas.filter(c=>c.status==='Suspenso').length;
  const mrr = contas.filter(c=>c.status==='Ativo').reduce((s,c)=>{
    const p = planos.find(pl=>pl.nome===c.plano);
    return s + (p?.preco||0);
  }, 0);

  document.getElementById('adm-stats').innerHTML = [
    { label:'Contas ativas', value:ativos, icon:'users', color:'blue', trend:'+3 este mês', up:true },
    { label:'Em trial', value:trial, icon:'clock', color:'amber', trend:`${trial} novos`, up:true },
    { label:'MRR', value:fmt(mrr), icon:'dollar', color:'green', trend:'+12%', up:true },
    { label:'Suspensos', value:suspensos, icon:'alert', color:'red', trend:suspensos > 0 ? 'Atenção' : 'OK', up:false },
  ].map(s => {
    const icons = {
      users:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
      clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
      dollar:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
      alert:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    };
    const bg = { blue:'background:#eef0ff;color:#0729F5', amber:'background:#fffbeb;color:#d97706', green:'background:#ecfdf5;color:#059669', red:'background:#fef2f2;color:#dc2626' };
    return `<div class="adm-stat-card">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <div class="adm-stat-icon" style="${bg[s.color]}">${icons[s.icon]}</div>
      </div>
      <div class="adm-stat-value">${s.value}</div>
      <div class="adm-stat-label">${s.label}</div>
      <div class="adm-stat-trend ${s.up?'up':'down'}">${s.trend}</div>
    </div>`;
  }).join('');

  // Distribuição por plano
  const total = contas.filter(c=>c.status==='Ativo'||c.status==='Trial').length || 1;
  const distData = planos.map(p => ({
    nome: p.nome, cor: p.cor,
    qtd: contas.filter(c=>c.plano===p.nome).length,
  }));
  document.getElementById('adm-dist-planos').innerHTML = distData.map(d => `
    <div class="dist-item">
      <div class="dist-header">
        <span style="font-weight:600">${d.nome}</span>
        <span style="font-weight:700;color:${d.cor}">${d.qtd} contas</span>
      </div>
      <div class="dist-bar"><div class="dist-fill" style="width:${Math.round((d.qtd/contas.length)*100)}%;background:${d.cor}"></div></div>
    </div>
  `).join('');

  // Últimas contas
  const ultimas = [...contas].sort((a,b)=>new Date(b.criado)-new Date(a.criado)).slice(0,5);
  console.log(`📊 Dashboard: Mostrando ${ultimas.length} de ${contas.length} contas (últimas 5)`);
  console.log('📋 Todas as contas:', contas);
  document.getElementById('adm-ultimas-contas').innerHTML = `
    <table class="adm-table">
      <thead><tr><th>Nome</th><th>Negócio</th><th>Plano</th><th>Status</th><th>Criado em</th></tr></thead>
      <tbody>${ultimas.map(c=>`
        <tr>
          <td><div style="font-weight:600">${c.nome}</div><div style="font-size:11px;color:#737373">${c.email}</div></td>
          <td>${c.negocio}</td>
          <td><span class="badge badge-${c.plano.toLowerCase()}">${c.plano}</span></td>
          <td><span class="badge badge-${c.status.toLowerCase()}">${c.status}</span></td>
          <td>${fmtDate(c.criado)}</td>
        </tr>`).join('')}
      </tbody>
    </table>`;
}

// ── CONTAS ────────────────────────────────────────────
function renderContas() {
  const q = (document.getElementById('adm-search-contas')?.value||'').toLowerCase();
  const fp = document.getElementById('adm-filter-plano')?.value||'';
  const fs = document.getElementById('adm-filter-status')?.value||'';

  const list = contas.filter(c =>
    (!q || c.nome.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.negocio.toLowerCase().includes(q)) &&
    (!fp || c.plano === fp) &&
    (!fs || c.status === fs)
  );

  document.getElementById('adm-contas-tbody').innerHTML = list.map(c => `
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:34px;height:34px;border-radius:50%;background:#eef0ff;color:#0729F5;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0">${c.nome[0]}</div>
          <div><div style="font-weight:600;font-size:13px">${c.nome}</div><div style="font-size:11px;color:#737373">${c.email}</div></div>
        </div>
      </td>
      <td style="font-size:13px">${c.negocio}</td>
      <td><span class="badge badge-${c.plano.toLowerCase()}">${c.plano}</span></td>
      <td><span class="badge badge-${c.status.toLowerCase()}">${c.status}</span></td>
      <td style="font-size:13px">${fmtDate(c.vencimento)}</td>
      <td style="font-size:13px">${fmtDate(c.criado)}</td>
      <td>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <button class="btn-sm edit" onclick="editarConta(${c.id})">Editar</button>
          ${c.status==='Ativo'||c.status==='Trial' ? `<button class="btn-sm suspend" onclick="alterarStatus(${c.id},'Suspenso')">Suspender</button>` : ''}
          ${c.status==='Suspenso' ? `<button class="btn-sm activate" onclick="alterarStatus(${c.id},'Ativo')">Ativar</button>` : ''}
          ${c.status!=='Cancelado' ? `<button class="btn-sm cancel" onclick="alterarStatus(${c.id},'Cancelado')">Cancelar</button>` : ''}
        </div>
      </td>
    </tr>
  `).join('') || `<tr><td colspan="7" style="text-align:center;padding:24px;color:#737373">Nenhuma conta encontrada</td></tr>`;
}

function alterarStatus(id, novoStatus) {
  const c = contas.find(x=>x.id===id);
  if (!c) return;
  const confirmMsg = { Suspenso:'Suspender esta conta?', Cancelado:'Cancelar esta conta? Esta ação não pode ser desfeita.', Ativo:'Reativar esta conta?' };
  if (!confirm(confirmMsg[novoStatus])) return;
  c.status = novoStatus;
  renderContas();
  renderAdmDashboard();
  showAdmToast(`Conta ${novoStatus.toLowerCase()} com sucesso!`);
}

function editarConta(id) {
  const c = contas.find(x=>x.id===id);
  if (!c) return;
  document.getElementById('modal-editar-body').innerHTML = `
    <div class="form-row">
      <div class="form-group"><label>Nome</label><input type="text" id="ec-nome" value="${c.nome}"></div>
      <div class="form-group"><label>E-mail</label><input type="email" id="ec-email" value="${c.email}"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Telefone</label><input type="tel" id="ec-tel" value="${c.telefone}"></div>
      <div class="form-group"><label>Negócio</label><input type="text" id="ec-negocio" value="${c.negocio}"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Plano</label>
        <select id="ec-plano">
          ${['Mensal'].map(p=>`<option ${c.plano===p?'selected':''}>${p}</option>`).join('')}
        </select>
      </div>
      <div class="form-group"><label>Status</label>
        <select id="ec-status">
          ${['Ativo','Trial','Suspenso','Cancelado'].map(s=>`<option ${c.status===s?'selected':''}>${s}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Vencimento</label><input type="date" id="ec-venc" value="${c.vencimento}"></div>
    </div>
    <div class="form-group"><label>Observações</label><textarea id="ec-obs" rows="2">${c.obs}</textarea></div>
    <button class="btn-primary-sm btn-full mt-2" onclick="salvarEdicaoConta(${c.id})">Salvar alterações</button>
  `;
  document.getElementById('modal-editar-conta').classList.add('open');
}

function salvarEdicaoConta(id) {
  const c = contas.find(x=>x.id===id);
  if (!c) return;
  c.nome = document.getElementById('ec-nome').value;
  c.email = document.getElementById('ec-email').value;
  c.telefone = document.getElementById('ec-tel').value;
  c.negocio = document.getElementById('ec-negocio').value;
  c.plano = document.getElementById('ec-plano').value;
  c.status = document.getElementById('ec-status').value;
  c.vencimento = document.getElementById('ec-venc').value;
  c.obs = document.getElementById('ec-obs').value;
  closeAdmModal('modal-editar-conta');
  renderContas();
  renderAdmDashboard();
  showAdmToast('Conta atualizada! ✅');
}

function criarConta() {
  const nome = document.getElementById('nc-nome').value.trim();
  const email = document.getElementById('nc-email').value.trim();
  if (!nome || !email) { showAdmToast('Preencha nome e e-mail'); return; }
  contas.push({
    id: contas.length+1,
    nome, email,
    telefone: document.getElementById('nc-tel').value,
    negocio: document.getElementById('nc-negocio').value || nome,
    plano: document.getElementById('nc-plano').value,
    status: document.getElementById('nc-plano').value === 'Trial (14 dias)' ? 'Trial' : 'Ativo',
    vencimento: document.getElementById('nc-venc').value || new Date(Date.now()+30*86400000).toISOString().split('T')[0],
    criado: new Date().toISOString().split('T')[0],
    obs: document.getElementById('nc-obs').value,
  });
  closeAdmModal('modal-nova-conta');
  ['nc-nome','nc-email','nc-tel','nc-negocio','nc-obs'].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=''; });
  renderContas();
  renderAdmDashboard();
  showAdmToast('Conta criada com sucesso! ✅');
}

// ── PLANOS ────────────────────────────────────────────
function renderPlanos() {
  planos.forEach(p => { p.usuarios = contas.filter(c=>c.plano===p.nome).length; });
  document.getElementById('adm-planos-grid').innerHTML = planos.map(p => `
    <div class="adm-plano-card ${p.destaque?'destaque':''}">
      ${p.destaque ? '<div style="font-size:11px;font-weight:700;color:#0729F5;margin-bottom:8px;text-transform:uppercase;letter-spacing:1px">⭐ Mais popular</div>' : ''}
      <div class="adm-plano-nome">${p.nome}</div>
      <div class="adm-plano-preco" style="color:${p.cor}">R$ ${p.preco}<span>/mês</span></div>
      <div class="adm-plano-features">
        ${p.features.map(f=>`<div class="adm-plano-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>${f}</div>`).join('')}
      </div>
      <div class="adm-plano-users" style="color:${p.cor}">${p.usuarios} usuário${p.usuarios!==1?'s':''} ativo${p.usuarios!==1?'s':''}</div>
    </div>
  `).join('');

  document.getElementById('adm-planos-edit').innerHTML = planos.map((p,i) => `
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:12px;align-items:end;padding:12px 0;border-bottom:1px solid #f0f0f0">
      <div class="form-group" style="margin:0"><label>Plano</label><input type="text" value="${p.nome}" id="pl-nome-${i}"></div>
      <div class="form-group" style="margin:0"><label>Preço (R$/mês)</label><input type="number" value="${p.preco}" id="pl-preco-${i}"></div>
      <div class="form-group" style="margin:0"><label>Usuários ativos</label><input type="text" value="${p.usuarios}" disabled style="background:#f5f5f5"></div>
      <button class="btn-primary-sm" onclick="salvarPlano(${i})">Salvar</button>
    </div>
  `).join('');
}

function salvarPlano(i) {
  planos[i].nome = document.getElementById(`pl-nome-${i}`).value;
  planos[i].preco = parseFloat(document.getElementById(`pl-preco-${i}`).value)||0;
  renderPlanos();
  showAdmToast('Plano atualizado! ✅');
}

// ── FINANCEIRO ────────────────────────────────────────
function renderAdmFinanceiro() {
  const mrr = contas.filter(c=>c.status==='Ativo').reduce((s,c)=>{
    const p = planos.find(pl=>pl.nome===c.plano); return s+(p?.preco||0);
  },0);
  const pago = pagamentos.filter(p=>p.status==='Pago').reduce((s,p)=>s+p.valor,0);
  const atrasado = pagamentos.filter(p=>p.status==='Atrasado').reduce((s,p)=>s+p.valor,0);
  const arr = contas.filter(c=>c.status==='Ativo'||c.status==='Trial').length;

  document.getElementById('adm-fin-stats').innerHTML = [
    { label:'MRR', value:fmt(mrr), color:'blue', icon:'💰' },
    { label:'Recebido (histórico)', value:fmt(pago), color:'green', icon:'✅' },
    { label:'Em atraso', value:fmt(atrasado), color:'red', icon:'⚠️' },
    { label:'Assinantes ativos', value:arr, color:'amber', icon:'👥' },
  ].map(s => {
    const bg = { blue:'background:#eef0ff', green:'background:#ecfdf5', red:'background:#fef2f2', amber:'background:#fffbeb' };
    return `<div class="adm-stat-card" style="${bg[s.color]};border-radius:14px">
      <div style="font-size:24px;margin-bottom:8px">${s.icon}</div>
      <div class="adm-stat-value">${s.value}</div>
      <div class="adm-stat-label">${s.label}</div>
    </div>`;
  }).join('');

  const statusBadge = { Pago:'badge-ativo', Atrasado:'badge-suspenso', Estornado:'badge-cancelado' };
  document.getElementById('adm-pagamentos-tbody').innerHTML = pagamentos.map(p=>`
    <tr>
      <td style="font-weight:600;font-size:13px">${p.usuario}</td>
      <td><span class="badge badge-${p.plano.toLowerCase()}">${p.plano}</span></td>
      <td style="font-weight:700;color:#059669">${fmt(p.valor)}</td>
      <td style="font-size:13px">${fmtDate(p.data)}</td>
      <td><span class="badge ${statusBadge[p.status]||''}">${p.status}</span></td>
    </tr>
  `).join('');
}

// ── SUPORTE ───────────────────────────────────────────
function renderSuporte() {
  const prioridadeCor = { Alta:'#dc2626', Média:'#d97706', Baixa:'#059669' };
  const statusBadge = { Aberto:'badge-suspenso', Respondido:'badge-trial', Fechado:'badge-cancelado' };
  document.getElementById('adm-tickets').innerHTML = tickets.map(t=>`
    <div class="ticket-item">
      <div class="ticket-avatar">${t.usuario[0]}</div>
      <div class="ticket-info">
        <div class="ticket-title">${t.assunto}</div>
        <div class="ticket-sub">${t.usuario} • ${fmtDate(t.data)}</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">
        <span style="font-size:11px;font-weight:700;color:${prioridadeCor[t.prioridade]}">${t.prioridade}</span>
        <span class="badge ${statusBadge[t.status]}">${t.status}</span>
        ${t.status!=='Fechado'?`<button class="btn-sm edit" onclick="fecharTicket(this,'${t.assunto}')">Responder</button>`:''}
      </div>
    </div>
  `).join('');
}

function fecharTicket(btn, assunto) {
  showAdmToast(`Ticket respondido: "${assunto.slice(0,30)}..."`);
  btn.closest('.ticket-item').querySelector('.badge').textContent = 'Respondido';
  btn.closest('.ticket-item').querySelector('.badge').className = 'badge badge-trial';
}

// ── MODALS ────────────────────────────────────────────
function closeAdmModal(id, e) {
  if (e && e.target.id !== id) return;
  document.getElementById(id).classList.remove('open');
}

// ── INIT ──────────────────────────────────────────────
// Define data padrão de vencimento (30 dias)
window.addEventListener('load', () => {
  const d = new Date(); d.setDate(d.getDate()+7);
  const el = document.getElementById('nc-venc');
  if (el) el.value = d.toISOString().split('T')[0];
});

// ── SERVICE WORKER (PWA) ──────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('✅ Service Worker registrado'))
      .catch(err => console.log('❌ Service Worker falhou:', err));
  });
}
