# Weather Prediction API - Backend

API de predicción meteorológica basada en análisis de datos históricos, construida con FastAPI y Python.

## 🚀 Características

- **Predicción basada en datos históricos**: Analiza patrones de años anteriores
- **Análisis estadístico**: Calcula medias, rangos y tendencias
- **Sistema modular**: Permite intercambiar fuentes de datos (mock/real)
- **CORS configurado**: Listo para integración con frontend
- **Documentación automática**: Swagger UI incluido

## 📋 Requisitos

- Python 3.8+
- pip

## 🛠️ Instalación

1. **Crear entorno virtual**:
```bash
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

2. **Instalar dependencias**:
```bash
pip install -r requirements.txt
```

3. **Configurar variables de entorno**:
```bash
cp .env.example .env
# Editar .env si es necesario
```

## 🎯 Uso

### Iniciar el servidor

```bash
# Opción 1: Directamente con Python
python -m uvicorn app.main:app --reload --port 8000

# Opción 2: Con el módulo
python -m app.main
```

El servidor estará disponible en:
- API: http://localhost:8000
- Documentación: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Endpoints

#### POST `/api/weather/predict`

Genera predicción meteorológica.

**Request Body:**
```json
{
  "latitude": 4.7110,
  "longitude": -74.0721,
  "targetDate": "2025-12-25"
}
```

**Response:**
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
    "windSpeedMin": 5.0,
    "windSpeedMax": 12.0,
    "windDirection": "NE",
    "conditions": "Templado, húmedo, parcialmente nublado",
    "precipitation": "Moderada probabilidad (~40%)",
    "visibility": "Buena (8-10 km)",
    "confidence": 78.5
  },
  "historicalData": [
    {
      "year": 2023,
      "temperatureC": 19.0,
      "humidity": 72.0,
      "windSpeed": 7.0,
      "conditions": "Templado, húmedo, parcialmente nublado"
    }
    // ... más años
  ],
  "analysis": {
    "yearsAnalyzed": 10,
    "dataPoints": 10,
    "trends": "Basado en el análisis de los últimos 10 años...",
    "notes": "Esta predicción se generó utilizando algoritmos..."
  }
}
```

## 📁 Estructura del Proyecto

```
weather-backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app + endpoint
│   ├── schemas.py           # Modelos Pydantic
│   ├── predictor.py         # Lógica de predicción
│   ├── utils.py             # Utilidades (wind, heat index, etc.)
│   └── providers/
│       ├── __init__.py
│       ├── base.py          # Interfaz abstracta
│       ├── mock_provider.py # Datos sintéticos
│       └── opendap_provider.py # Plantilla para NASA
├── requirements.txt
├── .env.example
├── .env
└── README.md
```

## 🔧 Configuración

### Variables de Entorno (`.env`)

```env
# CORS - Orígenes permitidos
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174

# Proveedor de datos (mock | opendap)
DATA_PROVIDER=mock

# Credenciales NASA EarthData (para uso futuro)
EARTHDATA_USERNAME=
EARTHDATA_PASSWORD=
```

## 🔌 Proveedores de Datos

### MockProvider (Actual)
Genera datos sintéticos realistas basados en:
- Patrones estacionales
- Variabilidad año a año
- Coordenadas geográficas

### OpendapProvider (Futuro)
Plantilla para conectar con datos reales de NASA/NOAA usando:
- xarray + OPeNDAP
- Autenticación con EarthData
- Datasets: MERRA-2, GLDAS, etc.

## 📊 Análisis de Predicción

El sistema calcula:
- **Estadísticas**: Media, desviación estándar, mín/máx
- **Confianza**: Basada en cantidad y consistencia de datos
- **Tendencias**: Análisis de patrones temporales
- **Descripciones**: Condiciones, precipitación, visibilidad

## 🌐 Integración con Frontend

El frontend debe hacer peticiones a:
```typescript
const response = await fetch('http://localhost:8000/api/weather/predict', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    latitude: 4.7110,
    longitude: -74.0721,
    targetDate: '2025-12-25'
  })
})

const data = await response.json()
```

## 🧪 Testing

```bash
# Con curl
curl -X POST "http://localhost:8000/api/weather/predict" \
  -H "Content-Type: application/json" \
  -d '{"latitude": 4.7110, "longitude": -74.0721, "targetDate": "2025-12-25"}'

# Con Python requests
import requests
response = requests.post(
    "http://localhost:8000/api/weather/predict",
    json={"latitude": 4.7110, "longitude": -74.0721, "targetDate": "2025-12-25"}
)
print(response.json())
```

## 📝 Próximos Pasos

1. **Implementar OpendapProvider**:
   - Autenticación con NASA EarthData
   - Descarga de datos MERRA-2/GLDAS
   - Procesamiento con xarray

2. **Mejorar predicción**:
   - Modelos de machine learning
   - Análisis de múltiples variables
   - Predicción de eventos extremos

3. **Optimizaciones**:
   - Caché de datos históricos
   - Compresión de respuestas
   - Rate limiting

## 🐛 Troubleshooting

### Error de CORS
- Verificar que `ALLOWED_ORIGINS` en `.env` incluya la URL del frontend
- Reiniciar el servidor después de cambiar `.env`

### Error de importación
- Asegurarse de que el entorno virtual esté activado
- Reinstalar dependencias: `pip install -r requirements.txt`

### Puerto en uso
- Cambiar puerto: `uvicorn app.main:app --port 8001`
- O matar el proceso: `lsof -ti:8000 | xargs kill -9`

## 📄 Licencia

Este proyecto es parte del NASA Space Apps Challenge.

## 👥 Autores

Equipo de desarrollo - NASA Space Apps Challenge 2025
