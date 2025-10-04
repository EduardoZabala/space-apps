import { useState } from 'react'

interface PredictionRequest {
  latitude: number
  longitude: number
  targetDate: string
}

interface LocationSearchProps {
  onSearch: (request: PredictionRequest) => void
  disabled?: boolean
}

export default function LocationSearch({ onSearch, disabled = false }: LocationSearchProps) {
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Obtener la fecha mínima (mañana)
  const getMinDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!latitude || !longitude || !targetDate) {
      alert('Por favor completa todos los campos')
      return
    }

    const lat = parseFloat(latitude)
    const lon = parseFloat(longitude)

    if (isNaN(lat) || isNaN(lon)) {
      alert('Las coordenadas deben ser números válidos')
      return
    }

    if (lat < -90 || lat > 90) {
      alert('La latitud debe estar entre -90 y 90')
      return
    }

    if (lon < -180 || lon > 180) {
      alert('La longitud debe estar entre -180 y 180')
      return
    }

    const selectedDate = new Date(targetDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (selectedDate <= today) {
      alert('La fecha debe ser futura (a partir de mañana)')
      return
    }

    setIsLoading(true)
    try {
      await onSearch({
        latitude: lat,
        longitude: lon,
        targetDate
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="weather-container">
      <div className="weather-page">
        <div className="weather-header">
          <div className="weather-header-content">
            <h1 className="weather-title">
              <i className="fas fa-crystal-ball"></i>
              Predicción Meteorológica Basada en Historial
            </h1>
          </div>
        </div>

        <div className="prediction-intro">
          <div className="intro-icon">
            <i className="fas fa-chart-line"></i>
          </div>
          <h2>¿Cómo funciona?</h2>
          <p>
            Nuestro sistema analiza datos históricos de múltiples años para la ubicación y fecha específica
            que ingreses, generando una predicción meteorológica basada en patrones climáticos pasados.
          </p>
        </div>

        <div className="location-search-card">
          <form onSubmit={handleSubmit}>
            <div className="search-section">
              <h3 className="search-section-title">
                <i className="fas fa-map-marked-alt"></i>
                Ubicación (Coordenadas Geográficas)
              </h3>
              <div className="search-form-grid">
                <div className="weather-form-field">
                  <label className="weather-form-label">
                    <i className="fas fa-globe-americas"></i>
                    Latitud
                  </label>
                  <input
                    type="number"
                    step="any"
                    className="weather-form-input"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="Ej: 4.60971"
                    required
                  />
                  <small className="form-hint">Rango: -90 a 90</small>
                </div>

                <div className="weather-form-field">
                  <label className="weather-form-label">
                    <i className="fas fa-globe-americas"></i>
                    Longitud
                  </label>
                  <input
                    type="number"
                    step="any"
                    className="weather-form-input"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="Ej: -74.08175"
                    required
                  />
                  <small className="form-hint">Rango: -180 a 180</small>
                </div>
              </div>
            </div>

            <div className="search-section">
              <h3 className="search-section-title">
                <i className="fas fa-calendar-day"></i>
                Fecha Futura a Predecir
              </h3>
              <div className="search-form-grid">
                <div className="weather-form-field weather-form-field-full">
                  <label className="weather-form-label">
                    <i className="fas fa-calendar-alt"></i>
                    Selecciona una fecha futura
                  </label>
                  <input
                    type="date"
                    className="weather-form-input"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    min={getMinDate()}
                    required
                  />
                  <small className="form-hint">
                    El sistema analizará datos históricos de esta fecha en años anteriores
                  </small>
                </div>
              </div>
            </div>

            <div className="search-actions">
              <button 
                type="submit" 
                className="weather-btn weather-btn-primary btn-large"
                disabled={isLoading || disabled}
              >
                {isLoading || disabled ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Generando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-brain"></i>
                    Generar Predicción
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="info-cards-grid">
          <div className="info-card">
            <div className="info-card-icon">
              <i className="fas fa-database"></i>
            </div>
            <h4>Análisis Histórico</h4>
            <p>Procesamos datos meteorológicos de múltiples años para encontrar patrones climáticos</p>
          </div>

          <div className="info-card">
            <div className="info-card-icon">
              <i className="fas fa-brain"></i>
            </div>
            <h4>IA y Machine Learning</h4>
            <p>Algoritmos inteligentes generan predicciones precisas basadas en el historial</p>
          </div>

          <div className="info-card">
            <div className="info-card-icon">
              <i className="fas fa-file-download"></i>
            </div>
            <h4>Reporte Descargable</h4>
            <p>Exporta los resultados a Excel o imprímelos para tus registros</p>
          </div>
        </div>
      </div>
    </div>
  )
}
