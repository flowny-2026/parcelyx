# 🚀 Como Fazer Deploy

Este projeto tem 2 scripts automáticos para facilitar o deploy:

## 📦 Scripts Disponíveis

### Opção 1: `deploy.bat` (Prompt de Comando)
```cmd
deploy.bat
```

### Opção 2: `deploy.ps1` (PowerShell - RECOMENDADO)
```powershell
.\deploy.ps1
```

## 🔄 O que os scripts fazem:

1. ✅ Adiciona todas as alterações (`git add -A`)
2. ✅ Cria um commit (você digita a mensagem)
3. ✅ Envia para branch `main`
4. ✅ Atualiza branch `master` com as mudanças
5. ✅ Envia para branch `master` (produção Vercel)

## ⚡ Deploy Rápido

Basta executar:
```
.\deploy.ps1
```

E digitar a mensagem do commit quando solicitado!

## 🌐 URL de Produção

https://parcelyx.vercel.app

## ⏱️ Tempo de Deploy

Aguarde 2-3 minutos após executar o script para o deploy aparecer na Vercel.

---

**Importante:** A Vercel está configurada para fazer deploy automático da branch `master`, por isso o script sempre atualiza as duas branches (main e master).
