#!/bin/bash

# Script de inicio rápido para el proyecto Weather Prediction
# Este script inicia tanto el backend como el frontend

echo "🚀 Iniciando Sistema de Predicción Meteorológica..."
echo ""

# Colores para el output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Directorio base
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Función para verificar si un puerto está en uso
check_port() {
    lsof -ti:$1 > /dev/null 2>&1
}

# Verificar puertos
echo -e "${YELLOW}Verificando puertos...${NC}"
if check_port 8000; then
    echo -e "${YELLOW}Puerto 8000 en uso. Deteniendo proceso...${NC}"
    lsof -ti:8000 | xargs kill -9 2>/dev/null
fi

if check_port 5173; then
    echo -e "${YELLOW}Puerto 5173 en uso. Deteniendo proceso...${NC}"
    lsof -ti:5173 | xargs kill -9 2>/dev/null
fi

echo ""

# Iniciar Backend
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📡 Iniciando Backend (FastAPI)...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cd "$BASE_DIR/space-app-backend/weather-backend"

# Activar entorno virtual si existe
if [ -d "venv" ]; then
    echo -e "${GREEN}✓ Activando entorno virtual...${NC}"
    source venv/bin/activate
else
    echo -e "${YELLOW}⚠ Creando entorno virtual...${NC}"
    python3 -m venv venv
    source venv/bin/activate
    echo -e "${GREEN}✓ Instalando dependencias...${NC}"
    pip install -r requirements.txt
fi

# Iniciar backend en background
echo -e "${GREEN}✓ Iniciando servidor FastAPI en puerto 8000...${NC}"
python -m uvicorn app.main:app --port 8000 > /tmp/weather-backend.log 2>&1 &
BACKEND_PID=$!

# Esperar a que el backend inicie
echo -n "Esperando a que el backend esté listo"
for i in {1..10}; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo ""
        echo -e "${GREEN}✓ Backend iniciado correctamente${NC}"
        echo -e "${GREEN}  URL: http://localhost:8000${NC}"
        echo -e "${GREEN}  Docs: http://localhost:8000/docs${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

echo ""

# Iniciar Frontend
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🌐 Iniciando Frontend (React + Vite)...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cd "$BASE_DIR/space-app-frontend"

# Instalar dependencias si node_modules no existe
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠ Instalando dependencias npm...${NC}"
    npm install
fi

echo -e "${GREEN}✓ Iniciando servidor Vite...${NC}"
npm run dev > /tmp/weather-frontend.log 2>&1 &
FRONTEND_PID=$!

# Esperar a que el frontend inicie
echo -n "Esperando a que el frontend esté listo"
for i in {1..15}; do
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        echo ""
        echo -e "${GREEN}✓ Frontend iniciado correctamente${NC}"
        echo -e "${GREEN}  URL: http://localhost:5173${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ ¡Sistema iniciado correctamente!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}📱 Aplicación Frontend:${NC} http://localhost:5173"
echo -e "${GREEN}📡 API Backend:${NC}         http://localhost:8000"
echo -e "${GREEN}📚 Documentación API:${NC}   http://localhost:8000/docs"
echo ""
echo -e "${YELLOW}Para detener los servidores, presiona Ctrl+C${NC}"
echo ""

# Guardar PIDs para poder detenerlos después
echo $BACKEND_PID > /tmp/weather-backend.pid
echo $FRONTEND_PID > /tmp/weather-frontend.pid

# Función para limpiar al salir
cleanup() {
    echo ""
    echo -e "${YELLOW}Deteniendo servidores...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✓ Servidores detenidos${NC}"
    exit 0
}

# Capturar Ctrl+C
trap cleanup INT TERM

# Abrir navegador automáticamente (opcional, comentado por defecto)
# sleep 2
# open http://localhost:5173  # macOS
# xdg-open http://localhost:5173  # Linux

# Mantener el script corriendo y mostrar logs
echo -e "${BLUE}📝 Logs en tiempo real (Ctrl+C para salir):${NC}"
echo ""
tail -f /tmp/weather-backend.log /tmp/weather-frontend.log
