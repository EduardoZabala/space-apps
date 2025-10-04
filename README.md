# 🌦️ Sistema de Predicción Meteorológica

Sistema completo de predicción del tiempo basado en análisis de datos históricos, desarrollado para el NASA Space Apps Challenge 2025.

## 🎯 Descripción

Este sistema permite a los usuarios ingresar coordenadas geográficas y una fecha futura para recibir una predicción meteorológica basada en el análisis estadístico de datos históricos de años anteriores. El sistema calcula medias, rangos, tendencias y genera un reporte completo con nivel de confianza.

## 🚀 Inicio Rápido

### Método 1: Script Automático (Recomendado)

```bash
# Iniciar ambos servidores (backend + frontend)
./start.sh

# En otra terminal, para detener:
./stop.sh
```

### Método 2: Manual

#### Backend
```bash
cd space-app-backend/weather-backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

#### Frontend
```bash
cd space-app-frontend
npm install
npm run dev
```

## 🌐 URLs del Sistema

- **Aplicación Web**: http://localhost:5174
- **API Backend**: http://localhost:8000
- **Documentación API**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 📋 Requisitos

### Backend
- Python 3.8+
- pip

### Frontend
- Node.js 18+
- npm

## 🏗️ Arquitectura

```
┌─────────────┐         HTTP          ┌──────────────┐
│   Frontend  │ ──────────────────▶  │   Backend    │
│  React+Vite │ POST /api/weather/    │   FastAPI    │
│   (5174)    │ ◀──────────────────   │   (8000)     │
└─────────────┘         JSON          └──────────────┘
                                             │
                                             │ Usa
                                             ▼
                                      ┌──────────────┐
                                      │  Providers   │
                                      │  - Mock      │
                                      │  - OpenDAP   │
                                      └──────────────┘
```

## ✨ Características

### Frontend (React + TypeScript + Vite)
- ✅ Formulario de búsqueda con validaciones
- ✅ Predicción visual con gráficos
- ✅ Tabla de datos históricos interactiva
- ✅ Indicador de confianza
- ✅ Exportación a CSV/Excel
- ✅ Función de impresión
- ✅ Estados de loading y error
- ✅ Diseño responsive
- ✅ Animaciones suaves (solo en hover)
- ✅ Tema consistente con paleta de colores

### Backend (FastAPI + Python)
- ✅ API REST documentada automáticamente
- ✅ Validación de datos con Pydantic
- ✅ Generador de datos sintéticos (MockProvider)
- ✅ Análisis estadístico avanzado
- ✅ Cálculo de nivel de confianza
- ✅ Generación de tendencias
- ✅ Descripciones textuales de condiciones
- ✅ CORS configurado
- ✅ Health check endpoint
- ✅ Estructura modular y extensible

## 📖 Uso

1. **Abrir la aplicación**: http://localhost:5174

2. **Ingresar datos**:
   - **Latitud**: -90 a 90 (ej: 4.7110 para Bogotá)
   - **Longitud**: -180 a 180 (ej: -74.0721 para Bogotá)
   - **Fecha**: Cualquier fecha futura

3. **Generar predicción**: Click en "Generar Predicción"

4. **Ver resultados**:
   - Predicción principal con rangos
   - Tabla de datos históricos
   - Análisis de tendencias
   - Nivel de confianza

5. **Exportar** (opcional):
   - Click en "Exportar a Excel" para CSV
   - Click en "Imprimir" para PDF

## 📁 Estructura del Proyecto

```
Principal/
├── start.sh                    # Script de inicio automático
├── stop.sh                     # Script de parada
├── IMPLEMENTACION.md           # Documentación detallada
│
├── space-app-backend/
│   └── weather-backend/
│       ├── app/
│       │   ├── main.py         # API principal
│       │   ├── schemas.py      # Modelos de datos
│       │   ├── predictor.py    # Lógica de predicción
│       │   ├── utils.py        # Utilidades
│       │   └── providers/      # Proveedores de datos
│       ├── requirements.txt
│       ├── .env
│       └── README.md
│
└── space-app-frontend/
    ├── src/
    │   ├── components/
    │   │   ├── LocationSearch.tsx
    │   │   ├── WeatherDetail.tsx
    │   │   └── WeatherNavigator.tsx
    │   ├── App.css
    │   └── App.tsx
    ├── package.json
    └── README.md
```

## 🎨 Diseño y Estilos

### Paleta de Colores
- **Primary**: `#102D69` - Azul oscuro NASA
- **Secondary**: `#00A0B7` - Cyan tecnológico
- **Accent**: `#56ACDE` - Azul claro brillante

### Animaciones
- Entrada suave de elementos
- Efectos hover interactivos
- Loading spinner
- Error shake
- Gradientes dinámicos

## 🔧 Configuración

### Variables de Entorno (Backend)

Archivo: `space-app-backend/weather-backend/.env`

```env
# CORS - URLs permitidas
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174

# Proveedor de datos
DATA_PROVIDER=mock

# Credenciales NASA (para uso futuro)
EARTHDATA_USERNAME=
EARTHDATA_PASSWORD=
```

## 🧪 Pruebas

### Probar Backend Directamente

```bash
curl -X POST "http://localhost:8000/api/weather/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 4.7110,
    "longitude": -74.0721,
    "targetDate": "2025-12-25"
  }'
```

### Datos de Prueba

| Ubicación | Latitud | Longitud |
|-----------|---------|----------|
| Bogotá, Colombia | 4.7110 | -74.0721 |
| Ciudad de México | 19.4326 | -99.1332 |
| Buenos Aires | -34.6037 | -58.3816 |
| Miami, USA | 25.7617 | -80.1918 |
| Madrid, España | 40.4168 | -3.7038 |

## 📊 Ejemplo de Respuesta API

```json
{
  "targetDate": "2025-12-25",
  "location": {
    "latitude": 4.7110,
    "longitude": -74.0721,
    "name": "Lat: 4.71, Lon: -74.07"
  },
  "prediction": {
    "temperatureC": 18.5,
    "temperatureMin": 14.2,
    "temperatureMax": 22.8,
    "humidity": 75.3,
    "humidityMin": 65.0,
    "humidityMax": 85.0,
    "windSpeed": 8.2,
    "confidence": 78.5
  },
  "historicalData": [...],
  "analysis": {...}
}
```

## 🐛 Solución de Problemas

### Backend no inicia
```bash
cd space-app-backend/weather-backend
source venv/bin/activate
pip install -r requirements.txt
```

### Frontend no conecta
- Verificar que el backend esté en http://localhost:8000
- Revisar configuración CORS en `.env`
- Verificar logs del navegador (F12)

### Puerto en uso
```bash
# Detener procesos en puertos
./stop.sh

# O manualmente
lsof -ti:8000 | xargs kill -9
lsof -ti:5174 | xargs kill -9
```

## 📚 Documentación Adicional

- [IMPLEMENTACION.md](./IMPLEMENTACION.md) - Guía completa de implementación
- [Backend README](./space-app-backend/weather-backend/README.md) - Documentación del backend
- [Frontend README](./space-app-frontend/PREDICCION_README.md) - Documentación del frontend
- [API Docs](http://localhost:8000/docs) - Documentación interactiva Swagger

## 🚧 Roadmap

### Fase 1 (Actual - MVP)
- [x] Sistema básico con datos sintéticos
- [x] Frontend completo y funcional
- [x] Backend con FastAPI
- [x] Integración completa

### Fase 2 (Próxima)
- [ ] Integración con datos reales de NASA
- [ ] Implementación de OpenDAPProvider
- [ ] Machine Learning para mejorar predicciones
- [ ] Tests automatizados

### Fase 3 (Futuro)
- [ ] Autenticación de usuarios
- [ ] Historial de búsquedas
- [ ] Comparación de múltiples ubicaciones
- [ ] Aplicación móvil

## 👥 Equipo

Desarrollado para el **NASA Space Apps Challenge 2025**

## 📝 Licencia

Este proyecto fue desarrollado como parte del NASA Space Apps Challenge.

## 🙏 Agradecimientos

- NASA por proporcionar datos abiertos
- Comunidad Open Source
- Space Apps Challenge organizers

---

**Hecho con ❤️ para el NASA Space Apps Challenge 2025**
