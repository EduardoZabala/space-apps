import { useState } from 'react'
import InteractiveMap from './InteractiveMap'

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
  const [latitude, setLatitude] = useState<number>(0)
  const [longitude, setLongitude] = useState<number>(0)
  const [targetDate, setTargetDate] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Obtener la fecha mínima (mañana)
  const getMinDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  const handleLocationChange = (lat: number, lng: number) => {
    const normalizeLng = (longitude: number): number => {
      while (longitude > 180) longitude -= 360
      while (longitude <= -180) longitude += 360
      return parseFloat(longitude.toFixed(6))
    }
    
    const clampedLat = parseFloat(Math.max(-90, Math.min(90, lat)).toFixed(6))
    const normalizedLng = normalizeLng(lng)
    
    setLatitude(clampedLat)
    setLongitude(normalizedLng)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!latitude || !longitude || !targetDate) {
      alert('Please fill in all fields')
      return
    }

    const lat = latitude
    const lon = longitude

    if (isNaN(lat) || isNaN(lon)) {
      alert('Coordinates must be valid numbers')
      return
    }

    if (lat < -90 || lat > 90) {
      alert('Latitude must be between -90 and 90')
      return
    }

    if (lon < -180 || lon > 180) {
      alert('Longitude must be between -180 and 180')
      return
    }

    const selectedDate = new Date(targetDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (selectedDate <= today) {
      alert('Date must be in the future (from tomorrow onwards)')
      return
    }

    setIsLoading(true)
    try {
      await onSearch({
        latitude,
        longitude,
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
              Historical Weather Prediction
            </h1>
          </div>
        </div>

        <div className="prediction-intro">
          <div className="intro-icon">
            <i className="fas fa-chart-line"></i>
          </div>
          <h2>How does it work?</h2>
          <p>
            Our system analyzes historical data from multiple years for the specific location and date
            you enter, generating a weather prediction based on past climate patterns.
          </p>
        </div>

        <div className="location-search-card">
          <form onSubmit={handleSubmit}>
            <div className="search-section">
              <h3 className="search-section-title">
                <i className="fas fa-map-marked-alt"></i>
                Select a Geographic position
              </h3>
              <InteractiveMap
                latitude={latitude}
                longitude={longitude}
                onLocationChange={handleLocationChange}
              />
            </div>

            <div className="search-section">
              <h3 className="search-section-title">
                <i className="fas fa-calendar-day"></i>
                Future Date to Predict
              </h3>
              <div className="search-form-grid">
                <div className="weather-form-field weather-form-field-full">
                  <label className="weather-form-label">
                    <i className="fas fa-calendar-alt"></i>
                    Select a future date
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
                    The system will analyze historical data from this date in previous years
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
                    Generating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-brain"></i>
                    Generate Prediction
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
            <h4>Historical Analysis</h4>
            <p>We process weather data from multiple years to find climate patterns</p>
          </div>

          <div className="info-card">
            <div className="info-card-icon">
              <i className="fas fa-brain"></i>
            </div>
            <h4>AI and Machine Learning</h4>
            <p>Intelligent algorithms generate accurate predictions based on historical data</p>
          </div>

          <div className="info-card">
            <div className="info-card-icon">
              <i className="fas fa-file-download"></i>
            </div>
            <h4>Downloadable Report</h4>
            <p>Export results to Excel or print them for your records</p>
          </div>
        </div>
      </div>
    </div>
  )
}
