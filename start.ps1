# Script de inicio rápido para el proyecto Weather Prediction
# Este script inicia tanto el backend como el frontend

Write-Host "🚀 Iniciando Sistema de Predicción Meteorológica..." -ForegroundColor Green
Write-Host ""

# Directorio base  
$BASE_DIR = $PSScriptRoot

Write-Host "Verificando puertos..." -ForegroundColor Yellow
# Detener procesos existentes
Get-Process -Name "*python*" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name "*node*" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host ""

# Iniciar Backend
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host "📡 Iniciando Backend (FastAPI)..." -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue

Set-Location "$BASE_DIR\space-app-backend\weather-backend"

# Verificar si existe requirements.txt
if (Test-Path "requirements.txt") {
    Write-Host "✓ Instalando dependencias de Python..." -ForegroundColor Green
    pip install -r requirements.txt
}

# Iniciar backend
Write-Host "✓ Iniciando servidor FastAPI en puerto 8000..." -ForegroundColor Green
Start-Process -FilePath "python" -ArgumentList "-m", "uvicorn", "app.main:app", "--reload", "--port", "8000"

Write-Host ""

# Iniciar Frontend  
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host "🌐 Iniciando Frontend (React + Vite)..." -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue

Set-Location "$BASE_DIR\space-app-frontend"

# Instalar dependencias si node_modules no existe
if (!(Test-Path "node_modules")) {
    Write-Host "⚠ Instalando dependencias npm..." -ForegroundColor Yellow
    npm install
}

Write-Host "✓ Iniciando servidor Vite..." -ForegroundColor Green
Start-Process -FilePath "npm" -ArgumentList "run", "dev"

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host "✨ ¡Sistema iniciado correctamente!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host ""
Write-Host "📱 Aplicación Frontend: http://localhost:5174" -ForegroundColor Green
Write-Host "📡 API Backend:         http://localhost:8000" -ForegroundColor Green
Write-Host "📚 Documentación API:   http://localhost:8000/docs" -ForegroundColor Green
Write-Host ""

# Abrir navegador automáticamente
Start-Sleep -Seconds 3
Start-Process "http://localhost:5174"