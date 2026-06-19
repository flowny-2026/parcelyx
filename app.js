
// ── TOGGLE SENHA ─────────────────────────────────────
function toggleSenha(inputId, btn) {
  const input = document.getElementById(inputId);
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  btn.style.color = isHidden ? '#0729F5' : '#a3a3a3';
  btn.querySelector('svg').innerHTML = isHidden
    ? '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>'
    : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
}

// ── DATA ──────────────────────────────────────────────
let clientes = [];
let parcelamentos = [];
let parcelas = [];
let parcelaFilter = 'todas';

// ── CAIXA & EMPRÉSTIMOS ──────────────────────────────
let saldoCaixa = 0;
let totalEmprestimos = 0;

async function salvarCaixa(val) {
  saldoCaixa = parseFloat(val) || 0;
  const resultado = await atualizarDadosUsuario({ saldo_caixa: saldoCaixa });
  if (resultado.success) {
    renderCaixaCard();
    showToast('Saldo em caixa atualizado!');
  } else {
    showToast('Erro ao atualizar saldo');
  }
}

function renderCaixaCard() {
  totalEmprestimos = parcelamentos.filter(p=>p.status==='ativo'||p.status==='atrasado').reduce((s,p)=>s+p.valorTotal,0);
  const html = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div style="background:linear-gradient(135deg,#059669,#047857);border-radius:14px;padding:16px;color:#fff">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
          <div style="display:flex;align-items:center;gap:8px">
            <div style="width:32px;height:32px;background:rgba(255,255,255,0.2);border-radius:8px;display:flex;align-items:center;justify-content:center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            </div>
            <span style="font-size:12px;font-weight:600;opacity:0.9">Saldo em Caixa</span>
          </div>
          <button onclick="editarCaixa()" style="background:rgba(255,255,255,0.2);border:none;cursor:pointer;padding:4px 8px;border-radius:6px;color:#fff;font-size:11px;font-weight:600">Editar</button>
        </div>
        <div style="font-size:22px;font-weight:800">${fmt(saldoCaixa)}</div>
        <div style="font-size:11px;opacity:0.75;margin-top:4px">Valor disponível em caixa</div>
      </div>
      <div style="background:linear-gradient(135deg,#0729F5,#010C27);border-radius:14px;padding:16px;color:#fff">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
          <div style="width:32px;height:32px;background:rgba(255,255,255,0.2);border-radius:8px;display:flex;align-items:center;justify-content:center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <span style="font-size:12px;font-weight:600;opacity:0.9">Em Empréstimos</span>
        </div>
        <div style="font-size:22px;font-weight:800">${fmt(totalEmprestimos)}</div>
        <div style="font-size:11px;opacity:0.75;margin-top:4px">${parcelamentos.filter(p=>p.status==='ativo'||p.status==='atrasado').length} contratos ativos</div>
      </div>
    </div>
  `;
  // Atualiza todos os caixa-cards na página (dashboard e financeiro têm um cada)
  document.querySelectorAll('#caixa-card').forEach(el => el.innerHTML = html);
}

function editarCaixa() {
  const atual = saldoCaixa.toFixed(2).replace('.', ',');
  const val = prompt('Digite o saldo atual em caixa (R$):\nEx: 1500,00', atual);
  if (val === null) return;
  const num = parseFloat(val.replace(/\./g,'').replace(',','.'));
  if (isNaN(num) || num < 0) { showToast('Valor inválido'); return; }
  salvarCaixa(num);
}

// ── UTILS ──────────────────────────────────────────────
const fmt = v => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v);
const fmtDate = s => s ? new Date(s+'T12:00:00').toLocaleDateString('pt-BR') : '';

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// ── NAVIGATION ──────────────────────────────────────────
async function goTo(page) {
  document.getElementById('page-login').classList.remove('active');
  document.getElementById('page-cadastro').classList.remove('active');
  document.getElementById('page-plano').classList.remove('active');
  document.getElementById('app').classList.remove('hidden');
  
  // Aguarda a sessão estar pronta
  const sessao = await verificarSessao();
  
  if (!sessao) {
    // Se não tiver sessão, volta pro login
    mostrarLogin();
    return;
  }
  
  // Carrega dados do Supabase
  await carregarDados();
  
  // Atualiza sidebar com dados do usuário
  const dadosUser = await buscarDadosUsuario();
  const nome = dadosUser.success ? (dadosUser.data.negocio || dadosUser.data.nome || 'Meu Negócio') : 'Meu Negócio';
  const email = sessao.user.email || 'admin@parcelyx.com';
  
  const u1 = document.getElementById('sidebar-user-nome');
  const u2 = document.getElementById('sidebar-user-email');
  const av = document.querySelector('.sidebar-user .avatar');
  
  if (u1) u1.textContent = nome;
  if (u2) u2.textContent = email;
  if (av) av.textContent = nome[0].toUpperCase();
  
  navigate(page, null);
}

function navigate(page, el) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById('sec-' + page).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelectorAll('.bn-item').forEach(n => n.classList.remove('active'));
  // Ativa item correto na sidebar
  document.querySelectorAll(`.nav-item[onclick*="'${page}'"]`).forEach(n => n.classList.add('active'));
  // Ativa item correto no bottom nav
  document.querySelectorAll(`.bn-item[onclick*="'${page}'"]`).forEach(n => n.classList.add('active'));
  closeSidebar();
  renderPage(page);
  return false;
}

function renderPage(page) {
  if (page === 'dashboard') renderDashboard();
  if (page === 'clientes') renderClientes();
  if (page === 'parcelamentos') renderParcelamentos();
  if (page === 'parcelas') renderParcelas();
  if (page === 'cobrancas') renderCobrancas();
  if (page === 'financeiro') renderFinanceiro();
}

// ── SIDEBAR ──────────────────────────────────────────────
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebar-overlay').classList.toggle('open');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('open');
}

// ── MODALS ──────────────────────────────────────────────
function copiarPix() {
  const chave = getChavePix();
  navigator.clipboard.writeText(chave)
    .then(() => showToast('Chave PIX copiada! 📋'))
    .catch(() => showToast('Chave PIX: ' + chave));
}

function openModal(id) {
  if (id === 'modal-parcelamento') populateClienteSelect();
  if (id === 'modal-pix') {
    // Atualiza modal com a chave salva
    const chave = getChavePix();
    const tipo = getTipoPix();
    const elChave = document.getElementById('pix-modal-chave');
    const elTipo = document.getElementById('pix-modal-tipo');
    if (elChave) elChave.textContent = chave;
    if (elTipo) elTipo.textContent = tipo;
  }
  document.getElementById(id).classList.add('open');
}
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
function closeModalOutside(e, id) { if (e.target.id === id) closeModal(id); }

// ── DASHBOARD ──────────────────────────────────────────
function renderDashboard() {
  const today = new Date();
  const m = today.getMonth(), y = today.getFullYear();

  const recebidoMes = parcelas.filter(p => p.status==='pago' && p.dataPagamento)
    .filter(p => { const d=new Date(p.dataPagamento+'T12:00:00'); return d.getMonth()===m && d.getFullYear()===y; })
    .reduce((s,p) => s+p.valor, 0);

  const totalAtrasado = parcelas.filter(p=>p.status==='atrasado').reduce((s,p)=>s+p.valor,0);
  const vencendoHoje = parcelas.filter(p=>p.status==='vence_hoje').length;
  const totalPend = parcelas.filter(p=>p.status!=='pago').length;
  const atrasadas = parcelas.filter(p=>p.status==='atrasado').length;
  const inadimplencia = totalPend > 0 ? Math.round((atrasadas/totalPend)*100) : 0;

  const stats = [
    { label:'Recebido no mês', value:fmt(recebidoMes), icon:'trending-up', color:'green', trend:'+12%', trendUp:true },
    { label:'Total em atraso', value:fmt(totalAtrasado), icon:'alert', color:'red', trend:'-5%', trendUp:false },
    { label:'Vencendo hoje', value:vencendoHoje, icon:'clock', color:'amber', trend:null },
    { label:'Inadimplência', value:inadimplencia+'%', icon:'percent', color:'blue', trend:'-2%', trendUp:false },
  ];

  const icons = {
    'trending-up': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
    'alert': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    'clock': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    'percent': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>',
  };
  const bgMap = { green:'background:var(--pix-light);color:var(--pix)', red:'background:var(--red-light);color:var(--red)', amber:'background:var(--amber-light);color:var(--amber)', blue:'background:var(--primary-light);color:var(--primary)' };

  document.getElementById('stats-grid').innerHTML = stats.map(s => `
    <div class="stat-card">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <div class="stat-icon" style="${bgMap[s.color]}">${icons[s.icon]}</div>
        ${s.trend ? `<span class="stat-trend ${s.trendUp?'up':'down'}">${s.trend}</span>` : ''}
      </div>
      <div class="stat-value">${s.value}</div>
      <div class="stat-label">${s.label}</div>
    </div>
  `).join('');

  // Caixa card
  renderCaixaCard();

  // Chart
  const chartData = getChartData();
  renderBarChart('chart-receitas', chartData, '#0729F5');

  // Recentes
  const recentes = parcelas.filter(p=>p.status==='pago'&&p.dataPagamento)
    .sort((a,b)=>new Date(b.dataPagamento)-new Date(a.dataPagamento)).slice(0,5);
  document.getElementById('recentes-list').innerHTML = recentes.length ? recentes.map(r => `
    <div class="recente-item">
      <div style="display:flex;align-items:center;gap:10px">
        <div class="item-avatar green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg></div>
        <div><div class="item-name">${r.clienteNome}</div><div class="item-sub">Parcela ${r.numero}/${r.totalParcelas}</div></div>
      </div>
      <div class="item-right"><div class="item-value green">${fmt(r.valor)}</div><div class="item-sub">${fmtDate(r.dataPagamento)}</div></div>
    </div>
  `).join('') : '<p class="text-muted" style="padding:16px 0;text-align:center">Nenhum recebimento recente</p>';
}

function getChartData() {
  const today = new Date();
  return Array.from({length:6},(_,i) => {
    const d = new Date(today.getFullYear(), today.getMonth()-5+i, 1);
    const mes = d.toLocaleDateString('pt-BR',{month:'short'});
    const recebido = parcelas.filter(p=>p.status==='pago'&&p.dataPagamento)
      .filter(p=>{ const pd=new Date(p.dataPagamento+'T12:00:00'); return pd.getMonth()===d.getMonth()&&pd.getFullYear()===d.getFullYear(); })
      .reduce((s,p)=>s+p.valor,0);
    return { mes, recebido: Math.round(recebido) };
  });
}

function renderBarChart(canvasId, data, color) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.parentElement.offsetWidth || 400;
  const H = 200;
  canvas.width = W; canvas.height = H;
  const max = Math.max(...data.map(d=>d.recebido), 1);
  const pad = { top:20, right:10, bottom:40, left:60 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  const barW = (chartW / data.length) * 0.5;
  const gap = chartW / data.length;

  ctx.clearRect(0,0,W,H);

  // Grid lines
  ctx.strokeStyle = '#f0f0f0'; ctx.lineWidth = 1;
  for (let i=0;i<=4;i++) {
    const y = pad.top + (chartH/4)*i;
    ctx.beginPath(); ctx.moveTo(pad.left,y); ctx.lineTo(W-pad.right,y); ctx.stroke();
    ctx.fillStyle='#a3a3a3'; ctx.font='11px Inter,sans-serif'; ctx.textAlign='right';
    ctx.fillText(fmt(max*(1-i/4)).replace('R$','R$').replace(',00',''), pad.left-6, y+4);
  }

  // Bars
  data.forEach((d,i) => {
    const x = pad.left + gap*i + gap/2 - barW/2;
    const barH = (d.recebido/max)*chartH;
    const y = pad.top + chartH - barH;
    const grad = ctx.createLinearGradient(0,y,0,y+barH);
    grad.addColorStop(0, color); grad.addColorStop(1, color+'88');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x,y,barW,barH,6) : ctx.rect(x,y,barW,barH);
    ctx.fill();
    ctx.fillStyle='#737373'; ctx.font='11px Inter,sans-serif'; ctx.textAlign='center';
    ctx.fillText(d.mes, pad.left+gap*i+gap/2, H-10);
  });
}

// ── CLIENTES ──────────────────────────────────────────
function renderClientes() {
  const q = (document.getElementById('search-clientes')?.value||'').toLowerCase();
  const list = clientes.filter(c =>
    c.nome.toLowerCase().includes(q) || c.telefone.includes(q) || c.cpf.includes(q)
  );
  document.getElementById('clientes-count').textContent = clientes.length + ' clientes cadastrados';
  document.getElementById('clientes-list').innerHTML = list.map(c => `
    <div class="list-item">
      <div class="item-avatar">${c.nome[0]}</div>
      <div class="item-info">
        <div class="item-name">${c.nome}</div>
        <div class="item-sub">📱 ${c.telefone}</div>
        ${c.cpf ? `<div class="item-sub">CPF: ${c.cpf}</div>` : ''}
      </div>
      <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">
        <a href="https://wa.me/55${c.telefone.replace(/\D/g,'')}" target="_blank" class="btn btn-wa">
          <svg viewBox="0 0 24 24" fill="currentColor" style="width:13px;height:13px"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          WhatsApp
        </a>
        <button onclick="editarCliente(${c.id})" style="background:var(--primary-light);border:none;cursor:pointer;padding:9px;border-radius:10px;color:var(--primary);display:flex;align-items:center;justify-content:center" title="Editar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button onclick="excluirCliente(${c.id})" style="background:var(--red-light);border:none;cursor:pointer;padding:9px;border-radius:10px;color:var(--red);display:flex;align-items:center;justify-content:center" title="Excluir">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
        </button>
      </div>
    </div>
  `).join('') || '<p class="text-muted" style="text-align:center;padding:20px">Nenhum cliente encontrado</p>';
}

function salvarCliente() {
  const nome = document.getElementById('c-nome').value.trim();
  const tel = document.getElementById('c-tel').value.trim();
  if (!nome || !tel) { showToast('Preencha nome e telefone'); return; }
  
  const clienteData = {
    nome: nome,
    telefone: tel,
    cpf: document.getElementById('c-cpf').value || null,
    endereco: document.getElementById('c-end').value || null,
    observacoes: document.getElementById('c-obs').value || null
  };

  criarCliente(clienteData).then(resultado => {
    if (resultado.success) {
      clientes.push({
        id: resultado.data.id,
        nome: resultado.data.nome,
        telefone: resultado.data.telefone,
        cpf: resultado.data.cpf || '',
        endereco: resultado.data.endereco || '',
        observacoes: resultado.data.observacoes || ''
      });
      closeModal('modal-cliente');
      ['c-nome','c-tel','c-cpf','c-end','c-obs'].forEach(id => document.getElementById(id).value='');
      renderClientes();
      showToast('Cliente cadastrado!');
    } else {
      showToast('Erro ao cadastrar cliente: ' + resultado.error);
    }
  });
}

function editarCliente(id) {
  const c = clientes.find(x => x.id === id);
  if (!c) return;
  document.getElementById('ec-nome').value = c.nome;
  document.getElementById('ec-tel').value = c.telefone;
  document.getElementById('ec-cpf').value = c.cpf || '';
  document.getElementById('ec-end').value = c.endereco || '';
  document.getElementById('ec-obs').value = c.observacoes || '';
  document.getElementById('modal-editar-cliente').dataset.id = id;
  openModal('modal-editar-cliente');
}

function salvarEdicaoCliente() {
  const id = parseInt(document.getElementById('modal-editar-cliente').dataset.id);
  const c = clientes.find(x => x.id === id);
  if (!c) return;
  const nome = document.getElementById('ec-nome').value.trim();
  const tel = document.getElementById('ec-tel').value.trim();
  if (!nome || !tel) { showToast('Preencha nome e telefone'); return; }
  
  const updates = {
    nome: nome,
    telefone: tel,
    cpf: document.getElementById('ec-cpf').value || null,
    endereco: document.getElementById('ec-end').value || null,
    observacoes: document.getElementById('ec-obs').value || null
  };

  atualizarCliente(id, updates).then(resultado => {
    if (resultado.success) {
      c.nome = nome;
      c.telefone = tel;
      c.cpf = updates.cpf || '';
      c.endereco = updates.endereco || '';
      c.observacoes = updates.observacoes || '';
      // Atualiza nome nas parcelas e parcelamentos vinculados (isso será feito no Supabase via cascade ou trigger)
      parcelamentos.filter(p => p.clienteId === id).forEach(p => p.clienteNome = nome);
      parcelas.filter(p => p.clienteId === id).forEach(p => p.clienteNome = nome);
      closeModal('modal-editar-cliente');
      renderClientes();
      showToast('Cliente atualizado! ✅');
    } else {
      showToast('Erro ao atualizar cliente: ' + resultado.error);
    }
  });
}

function excluirCliente(id) {
  const c = clientes.find(x => x.id === id);
  if (!c) return;
  const temParcelamentos = parcelamentos.some(p => p.clienteId === id);
  if (temParcelamentos) {
    showToast('⚠️ Remova os parcelamentos deste cliente primeiro');
    return;
  }
  if (!confirm(`Excluir o cliente "${c.nome}"? Esta ação não pode ser desfeita.`)) return;
  
  deletarCliente(id).then(resultado => {
    if (resultado.success) {
      clientes.splice(clientes.indexOf(c), 1);
      renderClientes();
      showToast('Cliente excluído');
    } else {
      showToast('Erro ao excluir cliente: ' + resultado.error);
    }
  });
}

// ── PARCELAMENTOS ──────────────────────────────────────
function renderParcelamentos() {
  document.getElementById('parc-count').textContent = parcelamentos.length + ' parcelamentos';
  const statusMap = { ativo:'badge-ativo', quitado:'badge-quitado', atrasado:'badge-atrasado' };
  const statusLabel = { ativo:'Ativo', quitado:'Quitado', atrasado:'Atrasado' };
  document.getElementById('parcelamentos-list').innerHTML = parcelamentos.map(p => {
    const parcsDoContrato = parcelas.filter(x => x.parcelamentoId === p.id);
    const pagas = parcsDoContrato.filter(x => x.status === 'pago').length;
    const total = parcsDoContrato.length || p.parcelas;
    const pct = Math.round((pagas / total) * 100);
    const corBarra = p.status === 'quitado' ? 'var(--pix)' : p.status === 'atrasado' ? 'var(--red)' : 'var(--primary)';
    return `
    <div class="list-item" style="flex-direction:column;align-items:stretch;gap:10px">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div style="min-width:0;flex:1">
          <div class="item-name">${p.clienteNome}</div>
          <div class="item-sub">${p.observacoes||'Sem observações'}</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;margin-left:10px">
          <span class="badge ${statusMap[p.status]}">${statusLabel[p.status]}</span>
          <button onclick="editarParcelamento(${p.id})" style="background:var(--primary-light);border:none;cursor:pointer;padding:8px;border-radius:10px;color:var(--primary);display:flex;align-items:center;justify-content:center" title="Editar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:15px;height:15px"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button onclick="excluirParcelamento(${p.id})" style="background:var(--red-light);border:none;cursor:pointer;padding:8px;border-radius:10px;color:var(--red);display:flex;align-items:center;justify-content:center" title="Excluir">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:15px;height:15px"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
        <div style="background:var(--neutral-50);border-radius:8px;padding:8px;text-align:center">
          <div style="font-size:13px;font-weight:700">${fmt(p.valorTotal)}</div>
          <div style="font-size:10px;color:var(--neutral-500)">Valor total</div>
        </div>
        <div style="background:var(--neutral-50);border-radius:8px;padding:8px;text-align:center">
          <div style="font-size:13px;font-weight:700">${p.parcelas}x</div>
          <div style="font-size:10px;color:var(--neutral-500)">Parcelas</div>
        </div>
        <div style="background:var(--neutral-50);border-radius:8px;padding:8px;text-align:center">
          <div style="font-size:13px;font-weight:700">${p.juros}%</div>
          <div style="font-size:10px;color:var(--neutral-500)">Juros</div>
        </div>
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
          <span style="font-size:11px;color:var(--neutral-500)">Progresso</span>
          <span style="font-size:12px;font-weight:700;color:${corBarra}">${pagas}/${total} pagas</span>
        </div>
        <div style="height:6px;background:var(--neutral-100);border-radius:4px;overflow:hidden">
          <div style="height:100%;width:${pct}%;background:${corBarra};border-radius:4px;transition:width 0.4s ease"></div>
        </div>
      </div>
    </div>`;
  }).join('') || '<p class="text-muted" style="text-align:center;padding:20px">Nenhum parcelamento cadastrado</p>';
}

function editarParcelamento(id) {
  const p = parcelamentos.find(x => x.id === id);
  if (!p) return;
  document.getElementById('ep-obs').value = p.observacoes || '';
  document.getElementById('ep-juros').value = p.juros;
  document.getElementById('ep-venc').value = p.vencimento;
  // Status
  const sel = document.getElementById('ep-status');
  sel.value = p.status;
  document.getElementById('modal-editar-parcelamento').dataset.id = id;
  // Info somente leitura
  document.getElementById('ep-info').innerHTML = `
    <div style="background:var(--neutral-50);border-radius:10px;padding:12px;font-size:13px;margin-bottom:4px">
      <div style="font-weight:600;margin-bottom:4px">${p.clienteNome}</div>
      <div style="color:var(--neutral-500)">${fmt(p.valorTotal)} • ${p.parcelas}x • Criado em ${fmtDate(p.dataCriacao)}</div>
    </div>`;
  openModal('modal-editar-parcelamento');
}

function salvarEdicaoParcelamento() {
  const id = parseInt(document.getElementById('modal-editar-parcelamento').dataset.id);
  const p = parcelamentos.find(x => x.id === id);
  if (!p) return;
  
  const updates = {
    observacoes: document.getElementById('ep-obs').value || null,
    juros: parseFloat(document.getElementById('ep-juros').value) || 0,
    vencimento: parseInt(document.getElementById('ep-venc').value),
    status: document.getElementById('ep-status').value
  };

  atualizarParcelamento(id, updates).then(resultado => {
    if (resultado.success) {
      p.observacoes = updates.observacoes || '';
      p.juros = updates.juros;
      p.vencimento = updates.vencimento;
      p.status = updates.status;
      // Recarrega parcelas do Supabase
      carregarDados().then(() => {
        closeModal('modal-editar-parcelamento');
        renderParcelamentos();
        showToast('Parcelamento atualizado! ✅');
      });
    } else {
      showToast('Erro ao atualizar parcelamento: ' + resultado.error);
    }
  });
}

function excluirParcelamento(id) {
  const p = parcelamentos.find(x => x.id === id);
  if (!p) return;
  if (!confirm(`Excluir o parcelamento de "${p.clienteNome}" (${fmt(p.valorTotal)})?\nTodas as parcelas vinculadas serão removidas.`)) return;
  
  deletarParcelamento(id).then(resultado => {
    if (resultado.success) {
      parcelamentos.splice(parcelamentos.indexOf(p), 1);
      // Remove parcelas do array local
      parcelas = parcelas.filter(parc => parc.parcelamentoId !== id);
      renderParcelamentos();
      showToast('Parcelamento excluído');
    } else {
      showToast('Erro ao excluir parcelamento: ' + resultado.error);
    }
  });
}

function populateClienteSelect() {
  const sel = document.getElementById('p-cliente');
  sel.innerHTML = '<option value="">Selecione um cliente</option>' +
    clientes.map(c => `<option value="${c.id}">${c.nome}</option>`).join('');
}

function salvarParcelamento() {
  const cId = parseInt(document.getElementById('p-cliente').value);
  const valor = parseFloat(document.getElementById('p-valor').value);
  const nParcelas = parseInt(document.getElementById('p-parcelas').value);
  const venc = parseInt(document.getElementById('p-venc').value);
  if (!cId || !valor || !nParcelas || !venc) { showToast('Preencha os campos obrigatórios'); return; }
  const cliente = clientes.find(c=>c.id===cId);
  
  const parcelamentoData = {
    cliente_id: cId,
    cliente_nome: cliente.nome,
    valor_total: valor,
    entrada: parseFloat(document.getElementById('p-entrada').value) || 0,
    parcelas: nParcelas,
    juros: parseFloat(document.getElementById('p-juros').value) || 0,
    vencimento: venc,
    status: 'ativo',
    observacoes: document.getElementById('p-obs').value || null,
    data_criacao: new Date().toISOString().split('T')[0]
  };

  criarParcelamento(parcelamentoData).then(resultado => {
    if (resultado.success) {
      // Adiciona no array local
      parcelamentos.push({
        id: resultado.data.id,
        clienteId: resultado.data.cliente_id,
        clienteNome: resultado.data.cliente_nome,
        valorTotal: resultado.data.valor_total,
        entrada: resultado.data.entrada,
        parcelas: resultado.data.parcelas,
        juros: resultado.data.juros,
        vencimento: resultado.data.vencimento,
        status: resultado.data.status,
        observacoes: resultado.data.observacoes || '',
        dataCriacao: resultado.data.data_criacao
      });
      // Recarrega parcelas do Supabase
      carregarDados().then(() => {
        closeModal('modal-parcelamento');
        ['p-valor','p-entrada','p-parcelas','p-juros','p-venc','p-obs'].forEach(id => document.getElementById(id).value='');
        document.getElementById('p-cliente').value='';
        renderParcelamentos();
        showToast('Parcelamento criado! ✅');
      });
    } else {
      showToast('Erro ao criar parcelamento: ' + resultado.error);
    }
  });
}

// ── PARCELAS ──────────────────────────────────────────
function filterParcelas(f, el) {
  parcelaFilter = f;
  document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
  renderParcelas();
}

function renderParcelas() {
  const q = (document.getElementById('search-parcelas')?.value || '').toLowerCase();
  const pend = parcelas.filter(p=>p.status==='pendente'||p.status==='vence_hoje').length;
  const atras = parcelas.filter(p=>p.status==='atrasado').length;
  const pagas = parcelas.filter(p=>p.status==='pago').length;

  document.getElementById('parcelas-mini').innerHTML = `
    <div class="stat-mini"><div class="stat-mini-val" style="color:var(--amber)">${pend}</div><div class="stat-mini-label">Pendentes</div></div>
    <div class="stat-mini"><div class="stat-mini-val" style="color:var(--red)">${atras}</div><div class="stat-mini-label">Atrasadas</div></div>
    <div class="stat-mini"><div class="stat-mini-val" style="color:var(--pix)">${pagas}</div><div class="stat-mini-label">Pagas</div></div>
  `;

  let list = parcelas;
  if (parcelaFilter==='pendente') list = parcelas.filter(p=>p.status==='pendente'||p.status==='vence_hoje');
  else if (parcelaFilter==='atrasado') list = parcelas.filter(p=>p.status==='atrasado');
  else if (parcelaFilter==='pago') list = parcelas.filter(p=>p.status==='pago');

  if (q) list = list.filter(p => p.clienteNome.toLowerCase().includes(q));

  const iconMap = {
    pago: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
    pendente: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    vence_hoje: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    atrasado: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  };
  const bgMap2 = { pago:'green', pendente:'amber', vence_hoje:'amber', atrasado:'red' };
  const statusLabel = { pago:'Pago', pendente:'Pendente', vence_hoje:'Vence hoje', atrasado:'Atrasado' };
  const badgeMap = { pago:'badge-pago', pendente:'badge-pendente', vence_hoje:'badge-vence_hoje', atrasado:'badge-atrasado' };

  document.getElementById('parcelas-list').innerHTML = list.slice(0,40).map(p => `
    <div class="list-item">
      <div class="item-avatar ${bgMap2[p.status]}">${iconMap[p.status]}</div>
      <div class="item-info">
        <div class="item-name">${p.clienteNome}</div>
        <div class="item-sub">Parcela ${p.numero}/${p.totalParcelas} • Venc: ${fmtDate(p.vencimento)}</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <div class="item-right">
          <div class="item-value">${fmt(p.valor)}</div>
          <span class="badge ${badgeMap[p.status]}">${statusLabel[p.status]}</span>
        </div>
        ${p.status!=='pago' ? `<button onclick="marcarPago(${p.id})" style="background:var(--pix-light);border:none;cursor:pointer;padding:8px;border-radius:10px;color:var(--pix)" title="Marcar como pago">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:16px;height:16px"><polyline points="20 6 9 17 4 12"/></svg>
        </button>` : ''}
      </div>
    </div>
  `).join('') || `<p class="text-muted" style="text-align:center;padding:20px">${q ? `Nenhuma parcela encontrada para "${q}"` : 'Nenhuma parcela encontrada'}</p>`;
}

function marcarPago(id) {
  const p = parcelas.find(x=>x.id===id);
  if (!p) return;
  // Preenche o modal de confirmação
  document.getElementById('confirm-pago-info').innerHTML = `
    <div style="background:var(--neutral-50);border-radius:10px;padding:12px;font-size:13px;text-align:left">
      <div style="font-weight:600;margin-bottom:4px">${p.clienteNome}</div>
      <div style="color:var(--neutral-500)">Parcela ${p.numero}/${p.totalParcelas} • Venc: ${fmtDate(p.vencimento)}</div>
      <div style="font-size:18px;font-weight:800;color:var(--pix);margin-top:8px">${fmt(p.valor)}</div>
    </div>`;
  document.getElementById('modal-confirmar-pago').dataset.id = id;
  openModal('modal-confirmar-pago');
}

function confirmarPago() {
  const id = parseInt(document.getElementById('modal-confirmar-pago').dataset.id);
  const p = parcelas.find(x=>x.id===id);
  if (!p) return;
  
  marcarParcelaPaga(id).then(resultado => {
    if (resultado.success) {
      p.status = 'pago';
      p.dataPagamento = new Date().toISOString().split('T')[0];
      closeModal('modal-confirmar-pago');
      renderParcelas();
      renderCaixaCard();
      showToast('Parcela marcada como paga! ✅');
    } else {
      showToast('Erro ao marcar parcela: ' + resultado.error);
    }
  });
}

// ── COBRANÇAS ──────────────────────────────────────────
function renderCobrancas() {
  const cobraveis = parcelas.filter(p=>p.status==='atrasado'||p.status==='pendente'||p.status==='vence_hoje');
  document.getElementById('qtd-atrasadas').textContent = parcelas.filter(p=>p.status==='atrasado').length;

  document.getElementById('cobrancas-list').innerHTML = cobraveis.slice(0,15).map(p => {
    const tel = '55' + p.telefone.replace(/\D/g,'');
    const chavePix = getChavePix();
    const tipoPix = getTipoPix();
    const msgCobrar = encodeURIComponent(`Olá ${p.clienteNome}! 👋\n\nEste é um lembrete sobre sua parcela ${p.numero}/${p.totalParcelas} no valor de ${fmt(p.valor)}, com vencimento em ${fmtDate(p.vencimento)}.\n\nPara facilitar, segue a chave PIX para pagamento:\n📱 ${tipoPix}: ${chavePix}\n\nQualquer dúvida, estou à disposição! 😊`);
    const msgLembrete = encodeURIComponent(`Oi ${p.clienteNome}! 😊\n\nPassando para lembrar que sua parcela ${p.numero}/${p.totalParcelas} de ${fmt(p.valor)} vence em ${fmtDate(p.vencimento)}.\n\nChave PIX: ${chavePix}\n\nSe já pagou, pode desconsiderar! 🙏`);
    const msgReneg = encodeURIComponent(`Olá ${p.clienteNome}! 👋\n\nNotei que sua parcela ${p.numero}/${p.totalParcelas} de ${fmt(p.valor)} está pendente.\n\nGostaria de conversar sobre uma renegociação? 🤝`);
    const msgConfirm = encodeURIComponent(`Olá ${p.clienteNome}! ✅\n\nConfirmamos o recebimento da parcela ${p.numero}/${p.totalParcelas} de ${fmt(p.valor)}.\n\nMuito obrigado! 🙏`);
    return `
    <div class="list-item" style="flex-direction:column;align-items:stretch;gap:10px">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div>
          <div class="item-name">${p.clienteNome}</div>
          <div class="item-sub">Parcela ${p.numero}/${p.totalParcelas} • ${fmt(p.valor)} • Venc: ${fmtDate(p.vencimento)}</div>
        </div>
        <span class="badge ${p.status==='atrasado'?'badge-atrasado':'badge-pendente'}">${p.status==='atrasado'?'Atrasado':'Pendente'}</span>
      </div>
      <div class="cobr-btns">
        <a href="https://wa.me/${tel}?text=${msgCobrar}" target="_blank" class="cobr-btn green">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>Cobrar
        </a>
        <a href="https://wa.me/${tel}?text=${msgLembrete}" target="_blank" class="cobr-btn blue">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>Lembrete
        </a>
        <a href="https://wa.me/${tel}?text=${msgReneg}" target="_blank" class="cobr-btn amber">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>Renegociar
        </a>
        <a href="https://wa.me/${tel}?text=${msgConfirm}" target="_blank" class="cobr-btn gray">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>Confirmar
        </a>
      </div>
    </div>`;
  }).join('') || '<p class="text-muted" style="text-align:center;padding:20px">Nenhuma parcela para cobrar</p>';
}

// ── CONFIGURAÇÕES PIX ─────────────────────────────────
function getChavePix() {
  return localStorage.getItem('confPixChave') || 'pagamentos@parcelyx.com';
}
function getTipoPix() {
  return localStorage.getItem('confPixTipo') || 'E-mail';
}
function salvarConfPix() {
  const chave = document.getElementById('conf-pix-chave')?.value?.trim();
  const tipo = document.getElementById('conf-pix-tipo')?.value;
  if (chave) localStorage.setItem('confPixChave', chave);
  if (tipo) localStorage.setItem('confPixTipo', tipo);
}
function carregarConfPix() {
  const chave = getChavePix();
  const tipo = getTipoPix();
  const inputChave = document.getElementById('conf-pix-chave');
  const selectTipo = document.getElementById('conf-pix-tipo');
  if (inputChave) inputChave.value = chave;
  if (selectTipo) {
    Array.from(selectTipo.options).forEach(o => { o.selected = o.text === tipo; });
  }
}

// ── FINANCEIRO ──────────────────────────────────────────
function renderFinanceiro() {
  const totalRecebido = parcelas.filter(p=>p.status==='pago').reduce((s,p)=>s+p.valor,0);
  const totalPendente = parcelas.filter(p=>p.status==='pendente'||p.status==='vence_hoje').reduce((s,p)=>s+p.valor,0);
  const totalAtrasado = parcelas.filter(p=>p.status==='atrasado').reduce((s,p)=>s+p.valor,0);
  const totalGeral = totalRecebido + totalPendente + totalAtrasado;

  const finStats = [
    { label:'Total recebido', value:fmt(totalRecebido), color:'green', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>' },
    { label:'A receber', value:fmt(totalPendente), color:'blue', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>' },
    { label:'Em atraso', value:fmt(totalAtrasado), color:'red', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' },
    { label:'Total geral', value:fmt(totalGeral), color:'gray', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>' },
  ];
  const bgMap3 = { green:'background:var(--pix-light);color:var(--pix)', blue:'background:var(--primary-light);color:var(--primary)', red:'background:var(--red-light);color:var(--red)', gray:'background:var(--neutral-100);color:var(--neutral-700)' };

  document.getElementById('fin-stats').innerHTML = finStats.map(s => `
    <div class="stat-card">
      <div class="stat-icon" style="${bgMap3[s.color]}">${s.icon}</div>
      <div class="stat-value" style="font-size:15px;margin-top:8px">${s.value}</div>
      <div class="stat-label">${s.label}</div>
    </div>
  `).join('');

  // Caixa card no financeiro
  renderCaixaCard();

  renderBarChart('chart-fluxo', getChartData(), '#0729F5');

  const pct = v => totalGeral > 0 ? Math.round((v/totalGeral)*100) : 0;
  document.getElementById('fin-dist').innerHTML = [
    { label:'Recebido', value:totalRecebido, color:'var(--pix)', pct:pct(totalRecebido) },
    { label:'A receber', value:totalPendente, color:'var(--primary)', pct:pct(totalPendente) },
    { label:'Em atraso', value:totalAtrasado, color:'var(--red)', pct:pct(totalAtrasado) },
  ].map(d => `
    <div class="progress-row">
      <div class="progress-header">
        <span style="font-size:13px;color:var(--neutral-700)">${d.label}</span>
        <span style="font-size:13px;font-weight:700;color:${d.color}">${d.pct}%</span>
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width:${d.pct}%;background:${d.color}"></div></div>
    </div>
  `).join('');

  const entradas = parcelas.filter(p=>p.status==='pago'&&p.dataPagamento)
    .sort((a,b)=>new Date(b.dataPagamento)-new Date(a.dataPagamento)).slice(0,10);
  document.getElementById('fin-entradas').innerHTML = entradas.map(e => `
    <div class="entrada-item">
      <div style="display:flex;align-items:center;gap:10px">
        <div class="item-avatar green" style="width:34px;height:34px;font-size:12px">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:15px;height:15px"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>
        </div>
        <div><div class="item-name">${e.clienteNome}</div><div class="item-sub">${fmtDate(e.dataPagamento)}</div></div>
      </div>
      <div style="font-size:13px;font-weight:700;color:var(--pix)">+${fmt(e.valor)}</div>
    </div>
  `).join('') || '<p class="text-muted" style="text-align:center;padding:16px">Nenhuma entrada registrada</p>';
}

// ── LOGIN & CADASTRO ──────────────────────────────────
function detectarAdmin(valor) {
  if (valor.toLowerCase().startsWith('admin')) {
    window.location.href = 'admin.html';
  }
}

async function fazerLogin() {
  const email = document.getElementById('login-email').value.trim();
  const senha = document.getElementById('login-senha').value.trim();
  if (!email || !senha) { showToastLogin('Preencha e-mail e senha'); return; }
  // Se começar com admin, redireciona para painel admin
  if (email.toLowerCase().startsWith('admin')) {
    window.location.href = 'admin.html';
    return;
  }
  
  const resultado = await fazerLoginSupabase(email, senha);
  if (resultado.success) {
    goTo('dashboard');
  } else {
    showToastLogin('E-mail ou senha incorretos');
  }
}

function mostrarCadastro() {
  document.getElementById('page-login').classList.remove('active');
  document.getElementById('page-cadastro').classList.add('active');
  cadIrStep(1);
}

function mostrarLogin() {
  document.getElementById('page-cadastro').classList.remove('active');
  document.getElementById('page-login').classList.add('active');
}

function cadIrStep(n) {
  [1,2,3].forEach(i => {
    document.getElementById('cad-step-'+i).style.display = i===n ? 'block' : 'none';
    const dot = document.getElementById('step-dot-'+i);
    if (i < n) {
      dot.style.background = 'var(--pix)'; dot.style.color = '#fff';
      dot.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="width:14px;height:14px"><polyline points="20 6 9 17 4 12"/></svg>';
    } else if (i === n) {
      dot.style.background = 'var(--primary)'; dot.style.color = '#fff';
      dot.textContent = i;
    } else {
      dot.style.background = 'var(--neutral-200)'; dot.style.color = 'var(--neutral-500)';
      dot.textContent = i;
    }
    if (i < 3) {
      const line = document.getElementById('step-line-'+i);
      if (line) line.style.background = i < n ? 'var(--pix)' : 'var(--neutral-200)';
    }
  });
}

function checkPasswordStrength(password) {
  const strengthDiv = document.getElementById('password-strength');
  const strengthText = document.getElementById('strength-text');
  const bars = [1, 2, 3, 4].map(i => document.getElementById(`strength-bar-${i}`));
  
  if (!password) {
    strengthDiv.style.display = 'none';
    return;
  }
  
  strengthDiv.style.display = 'block';
  
  let strength = 0;
  let feedback = '';
  
  // Critérios de força
  if (password.length >= 6) strength++;
  if (password.length >= 10) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;
  
  // Limita a 4 barras
  strength = Math.min(strength, 4);
  
  // Define cores e texto
  const colors = ['#dc2626', '#f59e0b', '#eab308', '#059669'];
  const texts = ['Muito fraca', 'Fraca', 'Média', 'Forte'];
  
  // Atualiza barras
  bars.forEach((bar, i) => {
    if (i < strength) {
      bar.style.background = colors[strength - 1];
    } else {
      bar.style.background = '#e5e5e5';
    }
  });
  
  // Atualiza texto
  if (strength > 0) {
    strengthText.textContent = texts[strength - 1];
    strengthText.style.color = colors[strength - 1];
  }
}

function cadStep1() {
  const nome = document.getElementById('cad-nome').value.trim();
  const email = document.getElementById('cad-email').value.trim();
  const tel = document.getElementById('cad-tel').value.trim();
  const senha = document.getElementById('cad-senha').value;
  const senha2 = document.getElementById('cad-senha2').value;
  if (!nome || !email || !tel || !senha) { showToastLogin('Preencha todos os campos obrigatórios'); return; }
  if (senha.length < 6) { showToastLogin('A senha deve ter pelo menos 6 caracteres'); return; }
  if (senha !== senha2) { showToastLogin('As senhas não coincidem'); return; }
  cadIrStep(2);
}

function cadStep2() {
  const negocio = document.getElementById('cad-negocio').value.trim();
  if (!negocio) { showToastLogin('Informe o nome do seu negócio'); return; }
  const nome = document.getElementById('cad-nome').value;
  const email = document.getElementById('cad-email').value;
  const tipo = document.getElementById('cad-tipo').value || 'Não informado';
  const pix = document.getElementById('cad-pix').value || 'Não informado';
  document.getElementById('cad-resumo').innerHTML = `
    <div style="display:flex;flex-direction:column;gap:8px">
      <div style="display:flex;justify-content:space-between"><span style="color:var(--neutral-500)">Nome</span><span style="font-weight:600">${nome}</span></div>
      <div style="display:flex;justify-content:space-between"><span style="color:var(--neutral-500)">E-mail</span><span style="font-weight:600">${email}</span></div>
      <div style="display:flex;justify-content:space-between"><span style="color:var(--neutral-500)">Negócio</span><span style="font-weight:600">${negocio}</span></div>
      <div style="display:flex;justify-content:space-between"><span style="color:var(--neutral-500)">Tipo</span><span style="font-weight:600">${tipo}</span></div>
      <div style="display:flex;justify-content:space-between"><span style="color:var(--neutral-500)">Chave PIX</span><span style="font-weight:600">${pix}</span></div>
    </div>
  `;
  cadIrStep(3);
}

function cadVoltar(step) { cadIrStep(step); }

async function finalizarCadastro() {
  const nome = document.getElementById('cad-nome').value.trim();
  const negocio = document.getElementById('cad-negocio').value.trim();
  const email = document.getElementById('cad-email').value.trim();
  const senha = document.getElementById('cad-senha').value;
  const telefone = document.getElementById('cad-tel').value.trim();
  
  // Cria usuário no Supabase
  const resultado = await cadastrarUsuario(email, senha, nome, negocio, telefone);
  
  if (resultado.success) {
    // Faz login automático
    const loginRes = await fazerLoginSupabase(email, senha);
    if (loginRes.success) {
      // Vai para tela de escolha de plano
      document.getElementById('page-cadastro').classList.remove('active');
      document.getElementById('page-plano').classList.add('active');
      showToast('Conta criada com sucesso!');
    } else {
      mostrarLogin();
      showToastLogin('Conta criada! Faça login para continuar.');
    }
  } else {
    showToastLogin('Erro ao criar conta: ' + resultado.error);
  }
}

// ── PLANOS ────────────────────────────────────────────

function irParaPlanos() {
  document.getElementById('page-cadastro').classList.remove('active');
  document.getElementById('page-plano').classList.add('active');
}

async function iniciarTeste() {
  // Aguarda a sessão estar pronta
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Salva data de início do teste (7 dias)
  const dataExpiracao = new Date();
  dataExpiracao.setDate(dataExpiracao.getDate() + 7);
  
  const resultado = await atualizarDadosUsuario({ 
    plano: 'teste',
    data_expiracao: dataExpiracao.toISOString().split('T')[0]
  });
  
  if (resultado.success) {
    document.getElementById('page-plano').classList.remove('active');
    showToast('Teste de 7 dias iniciado! Aproveite! 🎉');
    goTo('dashboard');
  } else {
    // Se falhar, tenta ir pro dashboard mesmo assim (os dados serão atualizados depois)
    showToast('Iniciando teste grátis...');
    document.getElementById('page-plano').classList.remove('active');
    goTo('dashboard');
  }
}

function copiarChavePix() {
  const input = document.getElementById('pix-chave-pagamento');
  input.select();
  input.setSelectionRange(0, 99999); // Para mobile
  
  try {
    document.execCommand('copy');
    showToast('Chave PIX copiada! ✅');
  } catch (err) {
    // Fallback para navegadores modernos
    navigator.clipboard.writeText(input.value).then(() => {
      showToast('Chave PIX copiada! ✅');
    }).catch(() => {
      showToast('Erro ao copiar. Copie manualmente.');
    });
  }
}

function showToastLogin(msg) {
  showToast(msg);
}

function sairSistema() {
  if (!confirm('Deseja sair do sistema?')) return;
  fazerLogout().then(() => {
    document.getElementById('app').classList.add('hidden');
    document.getElementById('page-login').classList.add('active');
    // Limpa campos de login
    document.getElementById('login-email').value = '';
    document.getElementById('login-senha').value = '';
  });
}

// ── INIT ──────────────────────────────────────────────
window.addEventListener('load', async () => {
  try {
    // Verifica se há uma sessão ativa
    const session = await verificarSessao();
    if (session && session.user) {
      // Usuário já está logado, vai direto pro dashboard
      goTo('dashboard');
    } else {
      // Sem sessão válida, mostra tela de login
      document.getElementById('app').classList.add('hidden');
      document.getElementById('page-login').classList.add('active');
      document.getElementById('page-cadastro').classList.remove('active');
      document.getElementById('page-plano').classList.remove('active');
    }
  } catch (error) {
    // Em caso de erro, força mostrar login
    console.error('Erro ao verificar sessão:', error);
    document.getElementById('app').classList.add('hidden');
    document.getElementById('page-login').classList.add('active');
    document.getElementById('page-cadastro').classList.remove('active');
    document.getElementById('page-plano').classList.remove('active');
  }
  
  carregarConfPix();
  
  window.addEventListener('resize', () => {
    const active = document.querySelector('.section.active');
    if (active?.id === 'sec-dashboard') renderDashboard();
    if (active?.id === 'sec-financeiro') renderFinanceiro();
  });
});

// ── SERVICE WORKER (PWA) ──────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('✅ Service Worker registrado'))
      .catch(err => console.log('❌ Service Worker falhou:', err));
  });
}
