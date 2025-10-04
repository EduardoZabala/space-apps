import { useState } from 'react'
import LocationSearch from './LocationSearch'
import WeatherDetail from './WeatherDetail'

type NavigationLevel = 'search' | 'result'

interface PredictionRequest {
  latitude: number
  longitude: number
  targetDate: string
}

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
    confidence: number
  }
  historicalData: HistoricalData[]
  analysis: {
    yearsAnalyzed: number
    dataPoints: number
    trends: string
    notes: string
  }
}

export default function WeatherNavigator() {
  const [currentLevel, setCurrentLevel] = useState<NavigationLevel>('search')
  const [predictionData, setPredictionData] = useState<WeatherPrediction | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (request: PredictionRequest) => {
    setLoading(true)
    setError(null)
    
    try {
      // Llamada al backend real
      const response = await fetch('http://localhost:8000/api/weather/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`)
      }
      
      const data: WeatherPrediction = await response.json()
      setPredictionData(data)
      setCurrentLevel('result')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener la predicción'
      setError(errorMessage)
      console.error('Error fetching prediction:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleExportExcel = () => {
    if (!predictionData) return
    
    // TODO: Implementar exportación real a Excel
    // Por ahora, creamos un CSV básico que se puede abrir en Excel
    const csvContent = generateCSV(predictionData)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `prediccion_meteorologica_${predictionData.targetDate}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const generateCSV = (data: WeatherPrediction): string => {
    let csv = 'PREDICCIÓN METEOROLÓGICA\n\n'
    csv += `Fecha Objetivo,${data.targetDate}\n`
    csv += `Ubicación,"Lat: ${data.location.latitude} Lon: ${data.location.longitude}"\n`
    csv += `Confianza,${data.prediction.confidence}%\n\n`
    
    csv += 'PREDICCIÓN\n'
    csv += 'Variable,Valor,Mínimo,Máximo\n'
    csv += `Temperatura (°C),${data.prediction.temperatureC},${data.prediction.temperatureMin},${data.prediction.temperatureMax}\n`
    csv += `Humedad (%),${data.prediction.humidity},${data.prediction.humidityMin},${data.prediction.humidityMax}\n`
    csv += `Viento (m/s),${data.prediction.windSpeed},${data.prediction.windSpeedMin},${data.prediction.windSpeedMax}\n`
    csv += `Dirección del Viento,${data.prediction.windDirection},,\n`
    csv += `Condiciones,${data.prediction.conditions},,\n`
    csv += `Precipitación,${data.prediction.precipitation},,\n`
    csv += `Visibilidad,${data.prediction.visibility},,\n\n`
    
    csv += 'DATOS HISTÓRICOS\n'
    csv += 'Año,Temperatura (°C),Humedad (%),Viento (m/s),Condiciones\n'
    data.historicalData.forEach(h => {
      csv += `${h.year},${h.temperatureC},${h.humidity},${h.windSpeed},${h.conditions}\n`
    })
    
    csv += '\nANÁLISIS\n'
    csv += `Años Analizados,${data.analysis.yearsAnalyzed}\n`
    csv += `Puntos de Datos,${data.analysis.dataPoints}\n`
    csv += `Tendencias,"${data.analysis.trends}"\n`
    csv += `Notas,"${data.analysis.notes}"\n`
    
    return csv
  }

  const handleBackToSearch = () => {
    setCurrentLevel('search')
    setPredictionData(null)
    setError(null)
  }

  return (
    <>
      {currentLevel === 'search' && (
        <>
          <LocationSearch onSearch={handleSearch} disabled={loading} />
          
          {loading && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Generando predicción meteorológica...</p>
              <small>Analizando datos históricos</small>
            </div>
          )}
          
          {error && (
            <div className="error-container">
              <div className="error-icon">
                <i className="fas fa-exclamation-circle"></i>
              </div>
              <h3>Error al generar predicción</h3>
              <p>{error}</p>
              <button 
                className="weather-btn weather-btn-primary"
                onClick={() => setError(null)}
              >
                <i className="fas fa-redo"></i> Intentar de nuevo
              </button>
            </div>
          )}
        </>
      )}
      
      {currentLevel === 'result' && predictionData && (
        <WeatherDetail 
          weatherData={predictionData}
          onBack={handleBackToSearch}
          onExportExcel={handleExportExcel}
        />
      )}
    </>
  )
}
