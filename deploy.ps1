Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "   DEPLOY PARCELYX" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# 1. Add todas as mudanças
Write-Host "[1/5] Adicionando arquivos..." -ForegroundColor Yellow
git add -A
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO ao adicionar arquivos!" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

# 2. Commit
Write-Host ""
Write-Host "[2/5] Fazendo commit..." -ForegroundColor Yellow
$msg = Read-Host "Digite a mensagem do commit"
git commit -m "$msg"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Nada para commitar ou erro no commit" -ForegroundColor Yellow
}

# 3. Push para main
Write-Host ""
Write-Host "[3/5] Enviando para branch main..." -ForegroundColor Yellow
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO ao enviar para main!" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

# 4. Atualiza master com main
Write-Host ""
Write-Host "[4/5] Atualizando branch master..." -ForegroundColor Yellow
git checkout master
git merge main --no-edit
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO ao fazer merge!" -ForegroundColor Red
    git checkout main
    Read-Host "Pressione Enter para sair"
    exit 1
}

# 5. Push para master (produção Vercel)
Write-Host ""
Write-Host "[5/5] Enviando para branch master (Producao Vercel)..." -ForegroundColor Yellow
git push origin master
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO ao enviar para master!" -ForegroundColor Red
    git checkout main
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Volta para main
git checkout main

Write-Host ""
Write-Host "===================================" -ForegroundColor Green
Write-Host "   DEPLOY CONCLUIDO COM SUCESSO!" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green
Write-Host ""
Write-Host "Aguarde 2-3 minutos para o deploy na Vercel" -ForegroundColor Cyan
Write-Host "Acesse: https://parcelyx.vercel.app" -ForegroundColor Cyan
Write-Host ""
Read-Host "Pressione Enter para sair"
