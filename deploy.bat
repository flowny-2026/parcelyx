@echo off
echo.
echo ===================================
echo   DEPLOY PARCELYX
echo ===================================
echo.

:: 1. Add todas as mudanças
echo [1/5] Adicionando arquivos...
git add -A
if %errorlevel% neq 0 (
    echo ERRO ao adicionar arquivos!
    pause
    exit /b 1
)

:: 2. Commit
echo.
echo [2/5] Fazendo commit...
set /p msg="Digite a mensagem do commit: "
git commit -m "%msg%"
if %errorlevel% neq 0 (
    echo Nada para commitar ou erro no commit
)

:: 3. Push para main
echo.
echo [3/5] Enviando para branch main...
git push origin main
if %errorlevel% neq 0 (
    echo ERRO ao enviar para main!
    pause
    exit /b 1
)

:: 4. Atualiza master com main
echo.
echo [4/5] Atualizando branch master...
git checkout master
git merge main --no-edit
if %errorlevel% neq 0 (
    echo ERRO ao fazer merge!
    git checkout main
    pause
    exit /b 1
)

:: 5. Push para master (produção Vercel)
echo.
echo [5/5] Enviando para branch master (Producao Vercel)...
git push origin master
if %errorlevel% neq 0 (
    echo ERRO ao enviar para master!
    git checkout main
    pause
    exit /b 1
)

:: Volta para main
git checkout main

echo.
echo ===================================
echo   DEPLOY CONCLUIDO COM SUCESSO!
echo ===================================
echo.
echo Aguarde 2-3 minutos para o deploy na Vercel
echo Acesse: https://parcelyx.vercel.app
echo.
pause
