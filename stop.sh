#!/bin/bash

# Script para detener los servidores del proyecto Weather Prediction

echo "🛑 Deteniendo Sistema de Predicción Meteorológica..."

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Detener por PIDs guardados
if [ -f /tmp/weather-backend.pid ]; then
    BACKEND_PID=$(cat /tmp/weather-backend.pid)
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}Deteniendo Backend (PID: $BACKEND_PID)...${NC}"
        kill $BACKEND_PID
        echo -e "${GREEN}✓ Backend detenido${NC}"
    fi
    rm /tmp/weather-backend.pid
fi

if [ -f /tmp/weather-frontend.pid ]; then
    FRONTEND_PID=$(cat /tmp/weather-frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}Deteniendo Frontend (PID: $FRONTEND_PID)...${NC}"
        kill $FRONTEND_PID
        echo -e "${GREEN}✓ Frontend detenido${NC}"
    fi
    rm /tmp/weather-frontend.pid
fi

# Detener por puertos (backup)
if lsof -ti:8000 > /dev/null 2>&1; then
    echo -e "${YELLOW}Deteniendo procesos en puerto 8000...${NC}"
    lsof -ti:8000 | xargs kill -9
    echo -e "${GREEN}✓ Puerto 8000 liberado${NC}"
fi

if lsof -ti:5173 > /dev/null 2>&1; then
    echo -e "${YELLOW}Deteniendo procesos en puerto 5173...${NC}"
    lsof -ti:5173 | xargs kill -9
    echo -e "${GREEN}✓ Puerto 5173 liberado${NC}"
fi

# Limpiar archivos de log
rm -f /tmp/weather-backend.log
rm -f /tmp/weather-frontend.log

echo -e "${GREEN}✨ Todos los servidores han sido detenidos${NC}"
