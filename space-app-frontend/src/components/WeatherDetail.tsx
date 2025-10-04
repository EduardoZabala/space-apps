interface HistoricalData {
  year: number
  temperatureC: number
  humidity: number
  windSpeed: number
  conditions: string
}

interface WeatherPrediction {
  targetDate: string
  location: {
    latitude: number
    longitude: number
    name?: string
  }
  prediction: {
    temperatureC: number
    temperatureMin: number
    temperatureMax: number
    humidity: number
    humidityMin: number
    humidityMax: number
    windSpeed: number
    windSpeedMin: number
    windSpeedMax: number
    windDirection: string
    conditions: string
    precipitation: string
    visibility: string
    confidence: number // Porcentaje de confianza de la predicción
  }
  historicalData: HistoricalData[]
  analysis: {
    yearsAnalyzed: number
    dataPoints: number
    trends: string
    notes: string
  }
}

interface WeatherDetailProps {
  weatherData: WeatherPrediction
  onBack: () => void
  onExportExcel: () => void
}

export default function WeatherDetail({ weatherData, onBack, onExportExcel }: WeatherDetailProps) {
  const tempF = (tempC: number) => {
    return Math.round((tempC * 9) / 5 + 32)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return '#28a745'
    if (confidence >= 60) return '#ffc107'
    return '#dc3545'
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return 'Alta'
    if (confidence >= 60) return 'Media'
    return 'Baja'
  }

  return (
    <div className="weather-container">
      <div className="weather-page">
        <div className="weather-header">
          <div className="weather-header-content">
            <button className="weather-btn weather-btn-secondary" onClick={onBack}>
              <i className="fas fa-arrow-left"></i>
              Nueva Búsqueda
            </button>
            <h1 className="weather-title">
              <i className="fas fa-cloud-sun"></i>
              Predicción Meteorológica
            </h1>
            <div className="weather-actions">
              <button className="weather-btn weather-btn-success" onClick={onExportExcel}>
                <i className="fas fa-file-excel"></i>
                Exportar a Excel
              </button>
              <button className="weather-btn" onClick={() => window.print()}>
                <i className="fas fa-print"></i>
                Imprimir
              </button>
            </div>
          </div>
        </div>

        {/* Confianza de la Predicción */}
        <div className="confidence-banner" style={{ 
          background: `linear-gradient(135deg, ${getConfidenceColor(weatherData.prediction.confidence)} 0%, ${getConfidenceColor(weatherData.prediction.confidence)}dd 100%)`,
          color: 'white',
          padding: '1.5rem',
          borderRadius: '15px',
          marginBottom: '2rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            <i className="fas fa-chart-line"></i> Confianza de la Predicción
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>
            {weatherData.prediction.confidence}%
          </div>
          <div style={{ fontSize: '1rem', opacity: 0.9 }}>
            {getConfidenceLabel(weatherData.prediction.confidence)} - Basado en {weatherData.analysis.yearsAnalyzed} años de datos históricos
          </div>
        </div>

        <div className="weather-preview-card readonly-card">
          <div className="weather-preview-header">
            <h2 className="weather-preview-title">
              <i className="fas fa-crystal-ball"></i> Predicción para {formatDate(weatherData.targetDate)}
            </h2>
            <div className="weather-preview-meta">
              <div className="weather-meta-item">
                <i className="fas fa-map-marker-alt"></i>
                <span>
                  {weatherData.location.name || 
                    `Lat: ${weatherData.location.latitude.toFixed(4)}, Lon: ${weatherData.location.longitude.toFixed(4)}`}
                </span>
              </div>
              <div className="weather-meta-item">
                <i className="fas fa-database"></i>
                <span>{weatherData.analysis.dataPoints} puntos de datos analizados</span>
              </div>
            </div>
          </div>

          <div className="weather-preview-body">
            {/* Estadísticas Principales */}
            <div className="weather-stats-grid">
              <div className="weather-stat-card prediction-stat">
                <div className="weather-stat-icon">
                  <i className="fas fa-thermometer-half"></i>
                </div>
                <div className="weather-stat-label">Temperatura Predicha</div>
                <div className="weather-stat-value">
                  {weatherData.prediction.temperatureC} °C
                </div>
                <div style={{ fontSize: '0.85rem', color: '#6c757d', marginTop: '0.25rem' }}>
                  {tempF(weatherData.prediction.temperatureC)} °F
                </div>
                <div className="stat-range">
                  Rango: {weatherData.prediction.temperatureMin}° - {weatherData.prediction.temperatureMax}°C
                </div>
              </div>

              <div className="weather-stat-card prediction-stat">
                <div className="weather-stat-icon">
                  <i className="fas fa-tint"></i>
                </div>
                <div className="weather-stat-label">Humedad Predicha</div>
                <div className="weather-stat-value">
                  {weatherData.prediction.humidity} %
                </div>
                <div className="stat-range">
                  Rango: {weatherData.prediction.humidityMin}% - {weatherData.prediction.humidityMax}%
                </div>
              </div>

              <div className="weather-stat-card prediction-stat">
                <div className="weather-stat-icon">
                  <i className="fas fa-wind"></i>
                </div>
                <div className="weather-stat-label">Velocidad del Viento</div>
                <div className="weather-stat-value">
                  {weatherData.prediction.windSpeed} m/s
                </div>
                <div className="stat-range">
                  Rango: {weatherData.prediction.windSpeedMin} - {weatherData.prediction.windSpeedMax} m/s
                </div>
              </div>

              <div className="weather-stat-card prediction-stat">
                <div className="weather-stat-icon">
                  <i className="fas fa-compass"></i>
                </div>
                <div className="weather-stat-label">Dirección del Viento</div>
                <div className="weather-stat-value">
                  {weatherData.prediction.windDirection}
                </div>
              </div>
            </div>

            {/* Información General */}
            <div className="weather-section">
              <h3 className="weather-section-title">
                <i className="fas fa-info-circle"></i>
                Condiciones Predichas
              </h3>
              <div className="weather-info-grid">
                <div className="weather-info-item">
                  <i className="fas fa-cloud"></i>
                  <div className="weather-info-content">
                    <div className="weather-info-label">Condiciones del Cielo</div>
                    <div className="weather-info-value">{weatherData.prediction.conditions}</div>
                  </div>
                </div>
                <div className="weather-info-item">
                  <i className="fas fa-cloud-rain"></i>
                  <div className="weather-info-content">
                    <div className="weather-info-label">Precipitación</div>
                    <div className="weather-info-value">{weatherData.prediction.precipitation}</div>
                  </div>
                </div>
                <div className="weather-info-item">
                  <i className="fas fa-eye"></i>
                  <div className="weather-info-content">
                    <div className="weather-info-label">Visibilidad</div>
                    <div className="weather-info-value">{weatherData.prediction.visibility}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Datos Históricos */}
            <div className="weather-section">
              <h3 className="weather-section-title">
                <i className="fas fa-history"></i>
                Datos Históricos Utilizados
              </h3>
              <div className="historical-data-table">
                <table>
                  <thead>
                    <tr>
                      <th><i className="fas fa-calendar-alt"></i> Año</th>
                      <th><i className="fas fa-thermometer-half"></i> Temperatura (°C)</th>
                      <th><i className="fas fa-tint"></i> Humedad (%)</th>
                      <th><i className="fas fa-wind"></i> Viento (m/s)</th>
                      <th><i className="fas fa-cloud"></i> Condiciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weatherData.historicalData.map((data) => (
                      <tr key={data.year}>
                        <td><strong>{data.year}</strong></td>
                        <td>{data.temperatureC}°C ({tempF(data.temperatureC)}°F)</td>
                        <td>{data.humidity}%</td>
                        <td>{data.windSpeed} m/s</td>
                        <td>{data.conditions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Análisis y Tendencias */}
            <div className="weather-section">
              <h3 className="weather-section-title">
                <i className="fas fa-chart-line"></i>
                Análisis de Tendencias
              </h3>
              <div className="weather-text-content">
                {weatherData.analysis.trends}
              </div>
            </div>

            {/* Notas Adicionales */}
            {weatherData.analysis.notes && (
              <div className="weather-section">
                <h3 className="weather-section-title">
                  <i className="fas fa-clipboard"></i>
                  Notas del Análisis
                </h3>
                <div className="weather-text-content">
                  {weatherData.analysis.notes}
                </div>
              </div>
            )}

            <div className="readonly-badge">
              <i className="fas fa-lock"></i>
              <span>Esta predicción se basa en análisis de datos históricos y es de solo lectura</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
