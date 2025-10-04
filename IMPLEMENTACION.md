# Sistema de Predicción Meteorológica - Implementación Completa

## 📦 Estructura del Proyecto

```
Principal/
├── space-app-backend/
│   └── weather-backend/           # Backend FastAPI
│       ├── app/
│       │   ├── main.py            # API principal
│       │   ├── schemas.py         # Modelos Pydantic
│       │   ├── predictor.py       # Lógica de predicción
│       │   ├── utils.py           # Utilidades
│       │   └── providers/
│       │       ├── base.py        # Interfaz
│       │       ├── mock_provider.py     # Datos sintéticos
│       │       └── opendap_provider.py  # Plantilla NASA
│       ├── requirements.txt
│       ├── .env
│       └── README.md
│
└── space-app-frontend/
    ├── src/
    │   ├── components/
    │   │   ├── LocationSearch.tsx      # Formulario de búsqueda
    │   │   ├── WeatherDetail.tsx       # Visualización
    │   │   └── WeatherNavigator.tsx    # Orquestador
    │   ├── App.css                      # Estilos completos
    │   └── App.tsx
    ├── package.json
    └── PREDICCION_README.md
```

## 🚀 Instalación y Ejecución

### Backend (FastAPI)

1. **Navegar al directorio del backend**:
```bash
cd space-app-backend/weather-backend
```

2. **Crear entorno virtual**:
```bash
python -m venv venv
source venv/bin/activate  # macOS/Linux
# venv\Scripts\activate  # Windows
```

3. **Instalar dependencias**:
```bash
pip install -r requirements.txt
```

4. **Iniciar servidor**:
```bash
python -m uvicorn app.main:app --reload --port 8000
```

El backend estará disponible en:
- **API**: http://localhost:8000
- **Documentación**: http://localhost:8000/docs

### Frontend (React + Vite)

1. **Navegar al directorio del frontend**:
```bash
cd space-app-frontend
```

2. **Instalar dependencias** (si no lo has hecho):
```bash
npm install
```

3. **Iniciar servidor de desarrollo**:
```bash
npm run dev
```

El frontend estará disponible en:
- **Aplicación**: http://localhost:5174

## 🔗 Integración Frontend-Backend

### Endpoint de Predicción

El frontend se comunica con el backend mediante:

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
```

### Configuración CORS

El backend está configurado para aceptar peticiones desde:
- `http://localhost:5173`
- `http://localhost:5174`
- `http://127.0.0.1:5173`
- `http://127.0.0.1:5174`

Puedes modificar esto en `weather-backend/.env`:
```env
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
```

## ✨ Características Implementadas

### Backend
- ✅ API REST con FastAPI
- ✅ Validación de datos con Pydantic
- ✅ Generador de datos sintéticos (MockProvider)
- ✅ Análisis estadístico de datos históricos
- ✅ Cálculo de confianza de predicción
- ✅ Generación de tendencias y análisis
- ✅ Descripciones textuales de condiciones
- ✅ CORS configurado
- ✅ Documentación automática (Swagger)

### Frontend
- ✅ Formulario de búsqueda con validaciones
- ✅ Visualización de predicción
- ✅ Tabla de datos históricos
- ✅ Indicador de confianza visual
- ✅ Exportación a CSV/Excel
- ✅ Función de impresión
- ✅ Estados de loading
- ✅ Manejo de errores
- ✅ Diseño responsive
- ✅ Animaciones y efectos visuales
- ✅ Tema consistente con topología

## 📝 Flujo de Uso

1. **Usuario ingresa datos**:
   - Latitud (-90 a 90)
   - Longitud (-180 a 180)
   - Fecha futura

2. **Frontend valida y envía petición** al backend

3. **Backend**:
   - Extrae mes y día de la fecha objetivo
   - Consulta datos históricos (últimos 10 años)
   - Calcula estadísticas (media, mín, máx, desviación)
   - Genera predicción con rangos
   - Calcula nivel de confianza
   - Analiza tendencias
   - Retorna respuesta estructurada

4. **Frontend muestra**:
   - Predicción principal
   - Rangos de valores
   - Tabla de datos históricos
   - Análisis de tendencias
   - Opciones de exportación

## 🎨 Estilos y Tema

### Colores Principales
- **Primary**: #102D69 (Azul oscuro)
- **Secondary**: #00A0B7 (Cyan)
- **Accent**: #56ACDE (Azul claro)

### Animaciones
- Entrada de elementos (fadeInUp, slideDown)
- Hover effects (solo se activan al pasar el cursor)
- Loading spinner
- Error shake
- Gradientes animados (solo en hover)

## 🧪 Testing

### Probar Backend
```bash
# Con curl
curl -X POST "http://localhost:8000/api/weather/predict" \
  -H "Content-Type: application/json" \
  -d '{"latitude": 4.7110, "longitude": -74.0721, "targetDate": "2025-12-25"}'
```

### Probar Frontend
1. Abrir http://localhost:5174
2. Ingresar coordenadas (ejemplo: Bogotá 4.7110, -74.0721)
3. Seleccionar fecha futura
4. Clic en "Generar Predicción"

## 🔧 Resolución de Problemas

### Error de CORS
**Problema**: `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solución**:
1. Verificar que el backend esté ejecutándose
2. Confirmar que `.env` incluye la URL correcta del frontend
3. Reiniciar el servidor backend

### Backend no inicia
**Problema**: `ModuleNotFoundError: No module named 'fastapi'`

**Solución**:
```bash
# Activar entorno virtual
source venv/bin/activate

# Reinstalar dependencias
pip install -r requirements.txt
```

### Frontend no conecta al backend
**Problema**: `Failed to fetch` o `Network Error`

**Solución**:
1. Verificar que el backend esté en http://localhost:8000
2. Revisar la URL en `WeatherNavigator.tsx` línea 60
3. Comprobar el firewall/antivirus

### Puerto en uso
**Problema**: `Address already in use`

**Solución**:
```bash
# Backend (puerto 8000)
lsof -ti:8000 | xargs kill -9

# Frontend (puerto 5174)
lsof -ti:5174 | xargs kill -9
```

## 📊 Estructura de Datos

### Request
```json
{
  "latitude": 4.7110,
  "longitude": -74.0721,
  "targetDate": "2025-12-25"
}
```

### Response
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
  "historicalData": [...],
  "analysis": {
    "yearsAnalyzed": 10,
    "dataPoints": 10,
    "trends": "...",
    "notes": "..."
  }
}
```

## 🚀 Próximos Pasos

### Corto Plazo
- [ ] Implementar OpendapProvider con datos reales de NASA
- [ ] Añadir autenticación de usuarios
- [ ] Mejorar exportación a Excel (con gráficos)
- [ ] Agregar tests unitarios

### Mediano Plazo
- [ ] Implementar machine learning para mejorar predicciones
- [ ] Añadir caché de predicciones
- [ ] Crear dashboard de estadísticas
- [ ] Implementar API rate limiting

### Largo Plazo
- [ ] Aplicación móvil
- [ ] Sistema de alertas
- [ ] Comparación de múltiples ubicaciones
- [ ] Histórico de predicciones del usuario

## 📚 Documentación Adicional

- **Backend API**: http://localhost:8000/docs
- **Frontend README**: `space-app-frontend/PREDICCION_README.md`
- **Backend README**: `weather-backend/README.md`

## 👥 Equipo

NASA Space Apps Challenge 2025

## 📄 Licencia

Proyecto desarrollado para NASA Space Apps Challenge
