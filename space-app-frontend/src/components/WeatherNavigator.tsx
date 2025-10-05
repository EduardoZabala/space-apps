import { useState } from 'react'
import LocationSearch from './LocationSearch'
import WeatherDetail from './WeatherDetail'

type NavigationLevel = 'search' | 'result'

interface PredictionRequest {
  latitude: number
  longitude: number
  targetDate: string
}

interface WeatherPrediction {
  prediction: {
    temperatureC: number
    humidity: number
    windSpeed: number
    windDirection: number
    windCompass: string
    precipitation: number
    heatIndex: number
    conditions: string
    weatherType: string
    cloudCover: number
    pressure: number
    dewPoint: number
    uvIndex: number
    feelsLike: number
    rainProbability: number
    snowProbability: number
  }
  confidence: number
  historicalData: Array<{
    date: string
    temperatureC: number
    humidity: number
    windSpeed: number
    windDirection: number
    precipitation: number
    cloudCover: number
    pressure: number
    dewPoint: number
    uvIndex: number
    feelsLike: number
  }>
  statistics: {
    temperature: {
      mean: number
      std: number
      min: number
      max: number
    }
    humidity: {
      mean: number
      std: number
      min: number
      max: number
    }
    windSpeed: {
      mean: number
      std: number
      min: number
      max: number
    }
    precipitation: {
      mean: number
      std: number
      total: number
    }
  }
}

export default function WeatherNavigator() {
  const [currentLevel, setCurrentLevel] = useState<NavigationLevel>('search')
  const [predictionData, setPredictionData] = useState<WeatherPrediction | null>(null)
  const [locationData, setLocationData] = useState<{ name: string; latitude: number; longitude: number } | null>(null)
  const [targetDate, setTargetDate] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (request: PredictionRequest) => {
    setLoading(true)
    setError(null)
    
    try {
      // Obtener el nombre de la ubicación desde coordenadas usando geocodificación inversa
      let locationName = `${request.latitude.toFixed(4)}°, ${request.longitude.toFixed(4)}°`
      
      try {
        // Usar OpenStreetMap Nominatim API (gratuita, no requiere API key)
        const geoResponse = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${request.latitude}&lon=${request.longitude}&zoom=10&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'WeatherPredictionApp/1.0'
            }
          }
        )
        
        if (geoResponse.ok) {
          const geoData = await geoResponse.json()
          
          // Construir nombre de ubicación jerárquico
          const address = geoData.address || {}
          const parts = []
          
          // Priorizar ciudad/pueblo
          const cityName = address.city || address.town || address.village || address.municipality
          if (cityName) parts.push(cityName)
          
          // Agregar estado/región solo si no contiene el nombre de la ciudad
          if (address.state && cityName) {
            // Verificar que el estado no contenga el nombre de la ciudad
            if (!address.state.toLowerCase().includes(cityName.toLowerCase())) {
              parts.push(address.state)
            }
          } else if (address.state && !cityName) {
            // Si no hay ciudad, agregar el estado
            parts.push(address.state)
          }
          
          // Agregar país
          if (address.country) parts.push(address.country)
          
          if (parts.length > 0) {
            locationName = parts.join(', ')
          }
        }
      } catch (geoError) {
        console.warn('No se pudo obtener el nombre de la ubicación:', geoError)
        // Continuar con las coordenadas como fallback
      }
      
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
      setLocationData({
        name: locationName,
        latitude: request.latitude,
        longitude: request.longitude
      })
      setTargetDate(request.targetDate)
      setCurrentLevel('result')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener la predicción'
      setError(errorMessage)
      console.error('Error fetching prediction:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleBackToSearch = () => {
    setCurrentLevel('search')
    setPredictionData(null)
    setLocationData(null)
    setTargetDate('')
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
      
      {currentLevel === 'result' && predictionData && locationData && targetDate && (
        <WeatherDetail 
          weatherData={predictionData}
          location={locationData}
          targetDate={targetDate}
          onBack={handleBackToSearch}
        />
      )}
    </>
  )
}
