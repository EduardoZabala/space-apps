# Sistema de Predicción Meteorológica

## Descripción
Sistema de predicción meteorológica basado en análisis de datos históricos. El usuario ingresa coordenadas geográficas y una fecha futura, y el sistema analiza datos de años anteriores para generar una predicción.

## Flujo de la Aplicación

### 1. Búsqueda (LocationSearch)
- Usuario ingresa:
  - Latitud y Longitud
  - Fecha futura a predecir
- Validaciones:
  - Coordenadas válidas (-90 a 90 para latitud, -180 a 180 para longitud)
  - Fecha debe ser futura (mínimo mañana)

### 2. Resultado (WeatherDetail)
- Muestra predicción generada por el backend
- Incluye:
  - Porcentaje de confianza
  - Predicción (temperatura, humedad, viento, condiciones)
  - Rangos (mín/máx) para cada variable
  - Tabla de datos históricos utilizados
  - Análisis de tendencias
- Acciones disponibles:
  - Exportar a Excel (CSV)
  - Imprimir reporte
  - Volver a buscar

## Integración con Backend

### Endpoint Requerido

```typescript
POST /api/weather/predict

// Request Body
{
  latitude: number,      // -90 a 90
  longitude: number,     // -180 a 180
  targetDate: string     // Formato: "YYYY-MM-DD"
}

// Response Body
{
  targetDate: string,
  location: {
    latitude: number,
    longitude: number,
    name?: string        // Opcional: nombre del lugar
  },
  prediction: {
    temperatureC: number,
    temperatureMin: number,
    temperatureMax: number,
    humidity: number,
    humidityMin: number,
    humidityMax: number,
    windSpeed: number,
    windSpeedMin: number,
    windSpeedMax: number,
    windDirection: string,  // "N", "NE", "E", etc.
    conditions: string,     // Descripción de condiciones
    precipitation: string,  // Descripción de precipitación
    visibility: string,     // Descripción de visibilidad
    confidence: number      // 0-100, porcentaje de confianza
  },
  historicalData: [
    {
      year: number,
      temperatureC: number,
      humidity: number,
      windSpeed: number,
      conditions: string
    }
  ],
  analysis: {
    yearsAnalyzed: number,
    dataPoints: number,
    trends: string,        // Texto descriptivo de tendencias
    notes: string          // Notas adicionales del análisis
  }
}
```

### Ubicación del Código para Integración

Archivo: `src/components/WeatherNavigator.tsx`

```typescript
const handleSearch = async (request: PredictionRequest) => {
  // REEMPLAZAR ESTA SECCIÓN CON LA LLAMADA REAL
  const response = await fetch('http://tu-backend.com/api/weather/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  })
  
  if (!response.ok) {
    throw new Error('Error al obtener la predicción')
  }
  
  const data = await response.json()
  setPredictionData(data)
  setCurrentLevel('result')
}
```

## Funcionalidades

### ✅ Implementadas
- [x] Formulario de búsqueda con validaciones
- [x] Visualización de predicción con datos de muestra
- [x] Tabla de datos históricos
- [x] Indicador de confianza visual
- [x] Exportación a CSV/Excel
- [x] Función de impresión
- [x] Diseño responsive
- [x] Estilos consistentes con el tema

### 🔄 Pendientes (Requieren Backend)
- [ ] Conexión con API real
- [ ] Manejo de errores del servidor
- [ ] Loading states durante peticiones
- [ ] Caché de predicciones
- [ ] Validación de ubicación (nombre del lugar)

## Exportación a Excel

Actualmente se exporta como CSV que puede abrirse en Excel. Incluye:
- Información de la predicción
- Todos los valores predichos con rangos
- Tabla completa de datos históricos
- Análisis y notas

El archivo se descarga con el nombre: `prediccion_meteorologica_YYYY-MM-DD.csv`

## Impresión

El reporte está optimizado para impresión:
- Oculta botones y elementos de navegación
- Preserva colores importantes
- Mantiene tablas y gráficos legibles
- Formato A4

## Estilos

Todos los estilos están en `src/App.css`:
- Variables CSS para fácil personalización
- Tema consistente (azules: #102D69, #00A0B7, #56ACDE)
- Responsive design
- Animaciones suaves
- Efectos hover

## Componentes

1. **LocationSearch**: Formulario inicial de búsqueda
2. **WeatherDetail**: Visualización de la predicción
3. **WeatherNavigator**: Orquestador principal

## Archivos Obsoletos

Los siguientes archivos fueron creados inicialmente pero NO se usan en la versión final:
- `YearSelector.tsx`
- `MonthSelector.tsx`
- `DaySelector.tsx`
- `WeatherReport.tsx`

Pueden ser eliminados si lo deseas.

## Próximos Pasos

1. **Conectar con el backend**:
   - Actualizar la URL en `WeatherNavigator.tsx`
   - Agregar manejo de errores
   - Implementar estados de carga

2. **Mejorar exportación**:
   - Usar librería como `xlsx` para Excel real
   - Agregar gráficos en el archivo

3. **Funcionalidades adicionales**:
   - Historial de búsquedas
   - Comparar múltiples predicciones
   - Guardar favoritos
