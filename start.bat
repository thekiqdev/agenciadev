@echo off
setlocal
cd /d "%~dp0"

where npm >nul 2>&1 || (
  echo [start] npm nao encontrado no PATH. Instale Node.js ^(https://nodejs.org^) e tente novamente.
  pause
  exit /b 1
)

echo [start] Iniciando ambiente local ^(Postgres via Docker + Vite + API^)...
call npm run start:local
if errorlevel 1 pause
