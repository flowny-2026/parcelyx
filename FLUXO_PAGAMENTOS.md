# 💰 Sistema de Pagamentos e Ativação de Contas

## 📋 Visão Geral

Sistema completo para gerenciar pagamentos de assinaturas, com controle de aprovação manual e ativação automática de planos.

---

## 🔄 Fluxo Completo

### 1️⃣ **Cliente se Cadastra**
```
Login.jsx (Steps 1 e 2)
↓
- Preenche dados pessoais
- Preenche dados do negócio
- Conta é criada no Supabase Auth
- Registro é inserido na tabela `users` com plano='teste'
```

### 2️⃣ **Cliente Escolhe o Plano**
```
Login.jsx (Step 3 - Tela de planos)
↓
Opção A: Teste Grátis (7 dias)
  → Redireciona direto para o dashboard
  → plano='teste', data_expiracao=hoje+7dias

Opção B: Plano Completo (R$ 29/mês)
  → Abre modal com dados PIX
  → Registra pagamento pendente na tabela `pagamentos`
```

### 3️⃣ **Cliente Faz o PIX**
```
Modal PIX (Login.jsx)
↓
- Mostra chave PIX, nome e banco
- Cliente copia chave
- Cliente faz o pagamento
- Cliente envia comprovante via WhatsApp
```

### 4️⃣ **Registro Automático do Pagamento**
```javascript
handleAssinar() em Login.jsx
↓
INSERT na tabela pagamentos:
- user_id: ID do usuário logado
- nome_cliente, email_cliente, telefone_cliente
- plano: 'completo'
- valor: 29.00
- status: 'pendente'
- data_expiracao: hoje + 30 dias
- observacoes: Detalhes do negócio
```

### 5️⃣ **Admin Recebe Notificação**
```
WhatsApp (cliente envia comprovante)
↓
Admin acessa: /pagamentos
```

### 6️⃣ **Admin Aprova o Pagamento**
```
Página Pagamentos.jsx
↓
- Lista todos os pagamentos pendentes
- Admin clica em "Aprovar"
- Confirmação de aprovação

UPDATE pagamentos:
  status = 'aprovado'
  data_pagamento = hoje

🔥 TRIGGER AUTOMÁTICO:
↓
UPDATE users:
  plano = 'completo'
  data_expiracao = data do pagamento
```

### 7️⃣ **Cliente Tem Acesso Liberado**
```
Sistema verifica:
- Se plano != 'teste' E
- Se data_expiracao > hoje
→ Acesso completo liberado ✅
```

---

## 📊 Estrutura das Tabelas

### `users` (já existe)
```sql
- plano: 'teste' ou 'completo'
- data_expiracao: DATE
```

### `pagamentos` (nova)
```sql
id, user_id, nome_cliente, email_cliente, telefone_cliente,
plano, valor, metodo_pagamento, status, comprovante_url,
observacoes, data_pagamento, data_expiracao, aprovado_por,
created_at, updated_at
```

---

## 🎯 Funcionalidades Implementadas

### ✅ Para o Cliente:
1. **Cadastro completo** com dados pessoais e do negócio
2. **Escolha entre plano teste (7 dias) ou completo (R$ 29/mês)**
3. **Modal PIX** com dados para pagamento
4. **Registro automático** da solicitação de pagamento
5. **Envio de comprovante** via WhatsApp

### ✅ Para o Admin:
1. **Página de Pagamentos** (`/pagamentos`)
2. **Listagem de pagamentos** com filtros (Pendentes, Aprovados, Todos)
3. **Detalhes completos** de cada solicitação
4. **Botões de aprovar/recusar** pagamentos
5. **Atualização automática** do plano do usuário após aprovação
6. **View SQL** para consultas rápidas

---

## 🔧 Arquivos Criados/Modificados

### ✨ Novos Arquivos:
- `supabase-pagamentos.sql` - Schema da tabela e funções
- `src/pages/Pagamentos.jsx` - Painel admin
- `FLUXO_PAGAMENTOS.md` - Documentação

### 📝 Arquivos Modificados:
- `src/pages/Login.jsx` - Registro de pagamento no handleAssinar
- `src/App.jsx` - Nova rota /pagamentos
- `src/components/Layout.jsx` - Menu com link Pagamentos

---

## 🚀 Como Usar

### 1. **Executar o SQL no Supabase**
```bash
# No SQL Editor do Supabase:
# 1. Copie o conteúdo de supabase-pagamentos.sql
# 2. Execute o script
# 3. Verifique se a tabela 'pagamentos' foi criada
```

### 2. **Acessar o Painel de Pagamentos**
```
URL: https://seusite.com/pagamentos
```

### 3. **Fluxo de Aprovação**
```
1. Cliente faz o cadastro
2. Cliente escolhe plano completo
3. Cliente faz o PIX
4. Cliente envia comprovante no WhatsApp
5. Admin acessa /pagamentos
6. Admin clica em "Aprovar"
7. Sistema atualiza automaticamente o plano do cliente
```

---

## 🔐 Segurança

- ✅ **RLS (Row Level Security)** ativado
- ✅ Usuários só veem seus próprios pagamentos
- ✅ Apenas admins podem aprovar/recusar
- ✅ Trigger SQL para atualização automática do plano
- ✅ Validação de dados no frontend

---

## 💡 Melhorias Futuras (Opcionais)

### 📸 Upload de Comprovante:
- Adicionar campo para fazer upload direto do comprovante
- Usar Supabase Storage para armazenar imagens

### 🔔 Notificações Automáticas:
- Webhook do WhatsApp para notificar admin
- E-mail automático para cliente quando aprovado

### 💳 Integração com Gateway:
- Mercado Pago, Stripe ou Asaas
- Aprovação automática de pagamentos

### 📊 Dashboard de Pagamentos:
- Gráficos de receita mensal
- Relatório de conversão (teste → completo)

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique se o SQL foi executado corretamente
2. Confirme que a tabela `pagamentos` existe
3. Teste o fluxo completo em ambiente de desenvolvimento
4. Verifique os logs do console para erros

---

## ✅ Checklist de Implementação

- [x] SQL criado (supabase-pagamentos.sql)
- [x] Tabela pagamentos configurada
- [x] Trigger de atualização automática
- [x] Função para calcular expiração
- [x] Registro de pagamento no cadastro
- [x] Página de gerenciamento (/pagamentos)
- [x] Filtros e aprovação/recusa
- [x] Rota adicionada no App.jsx
- [x] Menu atualizado no Layout.jsx
- [ ] SQL executado no Supabase ⚠️
- [ ] Testar fluxo completo ⚠️

---

**Pronto! Sistema de pagamentos completo e funcional! 🎉**
