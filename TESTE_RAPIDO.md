# 🧪 Teste Rápido - Parcelyx com Supabase

## ✅ Checklist Rápido (5 minutos)

### 1️⃣ Criar Conta (1 min)
```
1. Abra: https://parcelyx.vercel.app
2. Clique em "Criar conta"
3. Preencha:
   - Nome: Seu Nome
   - E-mail: seuemail@teste.com
   - Telefone: (11) 99999-9999
   - Senha: 123456
   - Confirmar senha: 123456
4. Próximo → Preencha nome do negócio
5. Finalizar
```
✅ **Esperado**: Entrar automaticamente no dashboard

---

### 2️⃣ Logout e Login (30 seg)
```
1. Clique no ícone de sair (canto inferior esquerdo)
2. Entre novamente com e-mail e senha
```
✅ **Esperado**: Voltar ao dashboard vazio (conta nova)

---

### 3️⃣ Cadastrar Cliente (1 min)
```
1. Ir em "Clientes"
2. Clicar em "+ Novo cliente"
3. Preencher:
   - Nome: João Silva
   - Telefone: (11) 98888-7777
4. Salvar
```
✅ **Esperado**: Cliente aparecer na lista

---

### 4️⃣ Criar Parcelamento (1 min)
```
1. Ir em "Parcelamentos"
2. Clicar em "+ Novo"
3. Preencher:
   - Cliente: João Silva
   - Valor total: 5000
   - Entrada: 500
   - Parcelas: 10
   - Juros: 2
   - Dia vencimento: 15
5. Criar parcelamento
```
✅ **Esperado**: 
- Parcelamento criado
- Barra de progresso "0/10 pagas"
- 10 parcelas criadas automaticamente

---

### 5️⃣ Marcar Parcela Paga (30 seg)
```
1. Ir em "Parcelas"
2. Clicar no ícone verde (✓) da primeira parcela
3. Confirmar
```
✅ **Esperado**: 
- Parcela ficar "Pago"
- Dashboard atualizar
- Barra de progresso "1/10 pagas"

---

### 6️⃣ Fechar e Reabrir (30 seg)
```
1. Fechar o navegador completamente
2. Abrir novamente: https://parcelyx.vercel.app
```
✅ **Esperado**: 
- Entrar automaticamente (sessão ativa)
- Todos os dados permanecem (cliente, parcelamento, parcela paga)

---

## 🎯 Se todos os ✅ passaram = SUCESSO! 🎉

## ❌ Se algo falhou:

1. **Abra o Console** (F12 no Chrome/Edge)
2. Vá na aba "Console"
3. Veja se tem erros em vermelho
4. Me envie o print dos erros

---

## 📊 Verificar no Supabase (opcional)

```
1. Acesse: https://supabase.com/dashboard
2. Projeto: rflwwbzqfpivezcnhbum
3. Table Editor:
   - users → Deve ter seu usuário
   - clientes → Deve ter "João Silva"
   - parcelamentos → Deve ter 1 registro
   - parcelas → Deve ter 10 registros
```

---

## 🚀 Tudo Funcionando?

Agora você pode:
- ✅ Cadastrar clientes reais
- ✅ Criar parcelamentos reais
- ✅ Gerenciar cobranças
- ✅ Controlar seu financeiro
- ✅ Acessar de qualquer dispositivo
- ✅ Dados sempre salvos na nuvem

**URL do App**: https://parcelyx.vercel.app

**Próximos passos** (se quiser):
1. Instalar como PWA no celular
2. Adicionar clientes reais
3. Configurar chave PIX em "Configurações"
4. Começar a usar! 🚀
