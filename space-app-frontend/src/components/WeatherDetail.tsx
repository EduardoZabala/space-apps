import WeatherEffects from './WeatherEffects'
import * as XLSX from 'xlsx'

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
    temperatureMax?: number
    temperatureMin?: number
    temperatureAvg?: number
    hourMax?: number
    hourMin?: number
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

interface WeatherDetailProps {
  weatherData: WeatherPrediction
  location: { name: string; latitude: number; longitude: number }
  targetDate: string
  onBack: () => void
}

export default function WeatherDetail({ weatherData, location, targetDate, onBack }: WeatherDetailProps) {
  // Debug: Verificar estructura de datos
  console.log('Historical Data:', weatherData.historicalData)
  
  const tempF = (tempC: number) => {
    return Math.round((tempC * 9) / 5 + 32)
  }

  const exportToCSV = () => {
    // Crear datos para Excel
    const excelData = []
    
    // Headers
    excelData.push([
      'Date',
      'Temperature (°C)',
      'Max Temp (°C)',
      'Min Temp (°C)',
      'Avg Temp (°C)',
      'Hour Max',
      'Hour Min',
      'Humidity (%)',
      'Wind Speed (m/s)',
      'Wind Direction (°)',
      'Precipitation (mm)',
      'Cloud Cover (%)',
      'Pressure (hPa)',
      'Dew Point (°C)',
      'UV Index',
      'Feels Like (°C)'
    ])

    // Datos históricos
    weatherData.historicalData.forEach(record => {
      excelData.push([
        record.date,
        parseFloat(record.temperatureC.toFixed(1)),
        parseFloat((record.temperatureMax || record.temperatureC).toFixed(1)),
        parseFloat((record.temperatureMin || record.temperatureC).toFixed(1)),
        parseFloat((record.temperatureAvg || record.temperatureC).toFixed(1)),
        record.hourMax || 14,
        record.hourMin || 6,
        parseFloat(record.humidity.toFixed(1)),
        parseFloat(record.windSpeed.toFixed(1)),
        parseFloat(record.windDirection.toFixed(1)),
        parseFloat(record.precipitation.toFixed(1)),
        parseFloat(record.cloudCover.toFixed(1)),
        parseFloat(record.pressure.toFixed(1)),
        parseFloat(record.dewPoint.toFixed(1)),
        parseFloat(record.uvIndex.toFixed(1)),
        parseFloat(record.feelsLike.toFixed(1))
      ])
    })

    // Agregar fila de predicción
    excelData.push([
      `${targetDate} (Prediction)`,
      parseFloat(weatherData.prediction.temperatureC.toFixed(1)),
      '-',
      '-',
      '-',
      '-',
      '-',
      parseFloat(weatherData.prediction.humidity.toFixed(1)),
      parseFloat(weatherData.prediction.windSpeed.toFixed(1)),
      parseFloat(weatherData.prediction.windDirection.toFixed(1)),
      parseFloat(weatherData.prediction.precipitation.toFixed(1)),
      parseFloat(weatherData.prediction.cloudCover.toFixed(1)),
      parseFloat(weatherData.prediction.pressure.toFixed(1)),
      parseFloat(weatherData.prediction.dewPoint.toFixed(1)),
      parseFloat(weatherData.prediction.uvIndex.toFixed(1)),
      parseFloat(weatherData.prediction.feelsLike.toFixed(1))
    ])

    // Crear workbook y worksheet
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet(excelData)

    // Ajustar ancho de columnas
    const columnWidths = [
      { wch: 20 }, // Date
      { wch: 15 }, // Temperature
      { wch: 15 }, // Max Temp
      { wch: 15 }, // Min Temp
      { wch: 15 }, // Avg Temp
      { wch: 10 }, // Hour Max
      { wch: 10 }, // Hour Min
      { wch: 12 }, // Humidity
      { wch: 15 }, // Wind Speed
      { wch: 17 }, // Wind Direction
      { wch: 17 }, // Precipitation
      { wch: 15 }, // Cloud Cover
      { wch: 15 }, // Pressure
      { wch: 15 }, // Dew Point
      { wch: 10 }, // UV Index
      { wch: 15 }  // Feels Like
    ]
    ws['!cols'] = columnWidths

    // Agregar worksheet al workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Weather Data')

    // Descargar archivo
    const fileName = `weather_data_${location.name?.replace(/\s+/g, '_') || 'location'}_${targetDate}.xlsx`
    XLSX.writeFile(wb, fileName)
  }

  const formatDate = (dateStr: string) => {
    // Parseamos la fecha manualmente para evitar problemas de zona horaria
    const [year, month, day] = dateStr.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatHour12 = (hour: number) => {
    const h = hour % 12 || 12
    const ampm = hour < 12 ? 'AM' : 'PM'
    return `${h}:00 ${ampm}`
  }

  // Calcular temperatura máxima y mínima promedio con sus horas
  const calculateTempStats = () => {
    const maxTemps = weatherData.historicalData
      .filter(d => d.temperatureMax !== undefined)
      .map(d => ({ temp: d.temperatureMax!, hour: d.hourMax! }))
    
    const minTemps = weatherData.historicalData
      .filter(d => d.temperatureMin !== undefined)
      .map(d => ({ temp: d.temperatureMin!, hour: d.hourMin! }))

    if (maxTemps.length === 0 || minTemps.length === 0) {
      return null
    }

    const avgMaxTemp = maxTemps.reduce((sum, d) => sum + d.temp, 0) / maxTemps.length
    const avgMinTemp = minTemps.reduce((sum, d) => sum + d.temp, 0) / minTemps.length
    
    // Calcular la hora más común para la máxima
    const hourMaxCounts: { [key: number]: number } = {}
    maxTemps.forEach(d => {
      hourMaxCounts[d.hour] = (hourMaxCounts[d.hour] || 0) + 1
    })
    const mostCommonMaxHour = parseInt(Object.entries(hourMaxCounts)
      .sort((a, b) => b[1] - a[1])[0][0])

    // Calcular la hora más común para la mínima
    const hourMinCounts: { [key: number]: number } = {}
    minTemps.forEach(d => {
      hourMinCounts[d.hour] = (hourMinCounts[d.hour] || 0) + 1
    })
    const mostCommonMinHour = parseInt(Object.entries(hourMinCounts)
      .sort((a, b) => b[1] - a[1])[0][0])

    return {
      avgMaxTemp,
      avgMinTemp,
      mostCommonMaxHour,
      mostCommonMinHour
    }
  }

  const tempStats = calculateTempStats()

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return '#28a745'
    if (confidence >= 60) return '#ffc107'
    return '#dc3545'
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return 'High'
    if (confidence >= 60) return 'Medium'
    return 'Low'
  }

  const getWeatherIcon = (weatherType: string) => {
    const icons: { [key: string]: string } = {
      sunny: 'fa-sun',
      rainy: 'fa-cloud-rain',
      snowy: 'fa-snowflake',
      cloudy: 'fa-cloud',
      stormy: 'fa-cloud-bolt',
      foggy: 'fa-smog'
    }
    return icons[weatherType] || 'fa-cloud-sun'
  }

  const getWeatherLabel = (weatherType: string) => {
    const labels: { [key: string]: string } = {
      sunny: 'Sunny',
      rainy: 'Rainy',
      snowy: 'Snowy',
      cloudy: 'Cloudy',
      stormy: 'Stormy',
      foggy: 'Foggy'
    }
    return labels[weatherType] || 'Variable'
  }

  const getUVIndexLabel = (uvIndex: number) => {
    if (uvIndex <= 2) return { label: 'Low', color: '#28a745' }
    if (uvIndex <= 5) return { label: 'Moderate', color: '#ffc107' }
    if (uvIndex <= 7) return { label: 'High', color: '#fd7e14' }
    if (uvIndex <= 10) return { label: 'Very High', color: '#dc3545' }
    return { label: 'Extreme', color: '#6f42c1' }
  }

  // Determinar el className del contenedor basado en el tipo de clima
  const weatherClassName = `weather-${weatherData.prediction.weatherType}`
  
  console.log('WeatherDetail - Tipo de clima:', weatherData.prediction.weatherType)
  console.log('WeatherDetail - Temperatura:', weatherData.prediction.temperatureC)
  console.log('WeatherDetail - Precipitación:', weatherData.prediction.precipitation)
  console.log('WeatherDetail - Probabilidad de nieve:', weatherData.prediction.snowProbability)

  return (
    <div className={`weather-container ${weatherClassName}`}>
      {/* Weather Effects Component */}
      <WeatherEffects weatherType={weatherData.prediction.weatherType} />
      
      <div className="weather-page">
        <div className="weather-header">
          <div className="weather-header-content">
            <button className="weather-btn weather-btn-secondary" onClick={onBack}>
              <i className="fas fa-arrow-left"></i>
              New Search
            </button>
            <h1 className="weather-title">
              <i className={`fas ${getWeatherIcon(weatherData.prediction.weatherType)}`}></i>
              Weather Forecast
            </h1>
            <div className="weather-actions">
              <button className="weather-btn" onClick={exportToCSV}>
                <i className="fas fa-file-excel"></i>
                Export Excel
              </button>
              <button className="weather-btn" onClick={() => window.print()}>
                <i className="fas fa-print"></i>
                Print
              </button>
            </div>
          </div>
        </div>

        {/* Banner de Tipo de Clima */}
        <div className="weather-type-banner" style={{
          background: weatherData.prediction.weatherType === 'sunny' ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' :
                      weatherData.prediction.weatherType === 'rainy' ? 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)' :
                      weatherData.prediction.weatherType === 'snowy' ? 'linear-gradient(135deg, #e0e1faff 0%, #B2EBF2 100%)' :
                      weatherData.prediction.weatherType === 'stormy' ? 'linear-gradient(135deg, #2C3E50 0%, #34495E 100%)' :
                      weatherData.prediction.weatherType === 'foggy' ? 'linear-gradient(135deg, #DCDCDC 0%, #C0C0C0 100%)' :
                      'linear-gradient(135deg, #B0C4DE 0%, #D3D3D3 100%)',
          color: weatherData.prediction.weatherType === 'stormy' ? 'white' : weatherData.prediction.weatherType === 'snowy' ? '#4e56b1ff' : 'white',
          padding: '2rem',
          borderRadius: '15px',
          marginBottom: '1.5rem',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>
            <i className={`fas ${getWeatherIcon(weatherData.prediction.weatherType)}`}></i>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>
            {getWeatherLabel(weatherData.prediction.weatherType)}
          </div>
          <div style={{ fontSize: '1.2rem', marginTop: '0.5rem', opacity: 0.9 }}>
            {location.name || `${location.latitude.toFixed(2)}°, ${location.longitude.toFixed(2)}°`}
          </div>
          <div style={{ fontSize: '1rem', marginTop: '0.25rem', opacity: 0.8 }}>
            {formatDate(targetDate)}
          </div>
        </div>

        {/* Prediction Confidence */}
        <div className="confidence-banner" style={{ 
          background: 'linear-gradient(135deg, #0B3D91 0%, #07255C 100%)',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '15px',
          marginBottom: '2rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            <i className="fas fa-chart-line"></i> Prediction Confidence
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>
            {weatherData.confidence}%
          </div>
          <div style={{ fontSize: '1rem', opacity: 0.9 }}>
            {getConfidenceLabel(weatherData.confidence)} - Based on {weatherData.historicalData.length} years of historical data
          </div>
        </div>

        <div className="weather-preview-card readonly-card">
          <div className="weather-preview-header">
            <h2 className="weather-preview-title">
              <i className="fas fa-crystal-ball"></i> Prediction for {formatDate(targetDate)}
            </h2>
            <div className="weather-preview-meta">
              <div className="weather-meta-item">
                <i className="fas fa-map-marker-alt"></i>
                <span>
                  {location.name || 
                    `Lat: ${location.latitude.toFixed(4)}, Lon: ${location.longitude.toFixed(4)}`}
                </span>
              </div>
              <div className="weather-meta-item">
                <i className="fas fa-database"></i>
                <span>{weatherData.historicalData.length} years of historical data</span>
              </div>
            </div>
          </div>

          <div className="weather-preview-body">
            {/* Estadísticas Principales */}
            <div className="weather-stats-grid">
              {tempStats && (
                <>
                  <div className="weather-stat-card prediction-stat" style={{ '--card-index': 0 } as React.CSSProperties}>
                    <div className="weather-stat-icon" style={{ '--icon-index': 0 } as React.CSSProperties}>
                      <i className="fas fa-temperature-high" style={{ color: '#ff6b6b' }}></i>
                    </div>
                    <div className="weather-stat-label">Maximum Temperature</div>
                    <div className="weather-stat-value">
                      {tempStats.avgMaxTemp.toFixed(1)} °C
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#6c757d', marginTop: '0.25rem' }}>
                      Most common time: {formatHour12(tempStats.mostCommonMaxHour)}
                    </div>
                    <div className="stat-range">
                      Based on {weatherData.historicalData.length} years of data
                    </div>
                  </div>

                  <div className="weather-stat-card prediction-stat" style={{ '--card-index': 1 } as React.CSSProperties}>
                    <div className="weather-stat-icon" style={{ '--icon-index': 1 } as React.CSSProperties}>
                      <i className="fas fa-temperature-low" style={{ color: '#4dabf7' }}></i>
                    </div>
                    <div className="weather-stat-label">Minimum Temperature</div>
                    <div className="weather-stat-value">
                      {tempStats.avgMinTemp.toFixed(1)} °C
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#6c757d', marginTop: '0.25rem' }}>
                      Most common time: {formatHour12(tempStats.mostCommonMinHour)}
                    </div>
                    <div className="stat-range">
                      Based on {weatherData.historicalData.length} years of data
                    </div>
                  </div>
                </>
              )}

              <div className="weather-stat-card prediction-stat" style={{ '--card-index': 2 } as React.CSSProperties}>
                <div className="weather-stat-icon" style={{ '--icon-index': 2 } as React.CSSProperties}>
                  <i className="fas fa-tint"></i>
                </div>
                <div className="weather-stat-label">Humidity</div>
                <div className="weather-stat-value">
                  {weatherData.prediction.humidity.toFixed(1)} %
                </div>
                <div className="stat-range">
                  Historical range: {weatherData.statistics.humidity.min.toFixed(1)}% - {weatherData.statistics.humidity.max.toFixed(1)}%
                </div>
              </div>

              <div className="weather-stat-card prediction-stat" style={{ '--card-index': 3 } as React.CSSProperties}>
                <div className="weather-stat-icon" style={{ '--icon-index': 3 } as React.CSSProperties}>
                  <i className="fas fa-droplet"></i>
                </div>
                <div className="weather-stat-label">Dew Point</div>
                <div className="weather-stat-value">
                  {weatherData.prediction.dewPoint.toFixed(1)} °C
                </div>
                <div style={{ fontSize: '0.85rem', color: '#6c757d', marginTop: '0.25rem' }}>
                  {tempF(weatherData.prediction.dewPoint)} °F
                </div>
              </div>

              <div className="weather-stat-card prediction-stat" style={{ '--card-index': 4 } as React.CSSProperties}>
                <div className="weather-stat-icon" style={{ '--icon-index': 4 } as React.CSSProperties}>
                  <i className="fas fa-wind"></i>
                </div>
                <div className="weather-stat-label">Wind</div>
                <div className="weather-stat-value">
                  {weatherData.prediction.windSpeed.toFixed(1)} m/s
                </div>
                <div className="stat-range">
                  Dirección: {weatherData.prediction.windCompass} ({weatherData.prediction.windDirection}°)
                </div>
              </div>

              <div className="weather-stat-card prediction-stat" style={{ '--card-index': 5 } as React.CSSProperties}>
                <div className="weather-stat-icon" style={{ '--icon-index': 5 } as React.CSSProperties}>
                  <i className="fas fa-gauge"></i>
                </div>
                <div className="weather-stat-label">Atmospheric Pressure</div>
                <div className="weather-stat-value">
                  {weatherData.prediction.pressure.toFixed(1)} hPa
                </div>
              </div>

              <div className="weather-stat-card prediction-stat" style={{ '--card-index': 6 } as React.CSSProperties}>
                <div className="weather-stat-icon" style={{ '--icon-index': 6 } as React.CSSProperties}>
                  <i className="fas fa-cloud"></i>
                </div>
                <div className="weather-stat-label">Cloud Cover</div>
                <div className="weather-stat-value">
                  {weatherData.prediction.cloudCover.toFixed(1)} %
                </div>
              </div>

              <div className="weather-stat-card prediction-stat" style={{ '--card-index': 7 } as React.CSSProperties}>
                <div className="weather-stat-icon" style={{ '--icon-index': 7 } as React.CSSProperties}>
                  <i className="fas fa-sun"></i>
                </div>
                <div className="weather-stat-label">UV Index</div>
                <div className="weather-stat-value">
                  {weatherData.prediction.uvIndex.toFixed(1)}
                </div>
                <div className="stat-range" style={{ 
                  color: getUVIndexLabel(weatherData.prediction.uvIndex).color,
                  fontWeight: 600
                }}>
                  {getUVIndexLabel(weatherData.prediction.uvIndex).label}
                </div>
              </div>

              <div className="weather-stat-card prediction-stat">
                <div className="weather-stat-icon">
                  <i className="fas fa-cloud-rain"></i>
                </div>
                <div className="weather-stat-label">Precipitation</div>
                <div className="weather-stat-value">
                  {weatherData.prediction.precipitation.toFixed(1)} mm
                </div>
                <div className="stat-range">
                  Total histórico: {weatherData.statistics.precipitation.total.toFixed(1)} mm
                </div>
              </div>
            </div>

            {/* Probabilidades */}
            <div className="weather-section">
              <h3 className="weather-section-title">
                <i className="fas fa-percent"></i>
                Odds
              </h3>
              <div className="weather-info-grid">
                <div className="weather-info-item">
                  <i className="fas fa-cloud-rain" style={{ color: '#4A90E2' }}></i>
                  <div className="weather-info-content">
                    <div className="weather-info-label">Rain Probability</div>
                    <div className="weather-info-value">{Math.min(100, weatherData.prediction.rainProbability).toFixed(1)}%</div>
                    <div style={{ width: '100%', height: '8px', background: '#e9ecef', borderRadius: '4px', marginTop: '0.5rem' }}>
                      <div style={{ 
                        width: `${Math.min(100, weatherData.prediction.rainProbability)}%`, 
                        height: '100%', 
                        background: '#4A90E2', 
                        borderRadius: '4px',
                        transition: 'width 0.3s ease'
                      }}></div>
                    </div>
                  </div>
                </div>
                <div className="weather-info-item">
                  <i className="fas fa-snowflake" style={{ color: '#B2EBF2' }}></i>
                  <div className="weather-info-content">
                    <div className="weather-info-label">Snow Probability</div>
                    <div className="weather-info-value">{Math.min(100, weatherData.prediction.snowProbability).toFixed(1)}%</div>
                    <div style={{ width: '100%', height: '8px', background: '#e9ecef', borderRadius: '4px', marginTop: '0.5rem' }}>
                      <div style={{ 
                        width: `${Math.min(100, weatherData.prediction.snowProbability)}%`, 
                        height: '100%', 
                        background: '#B2EBF2', 
                        borderRadius: '4px',
                        transition: 'width 0.3s ease'
                      }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* General Conditions */}
            <div className="weather-section" style={{ '--section-index': 0 } as React.CSSProperties}>
              <h3 className="weather-section-title">
                <i className="fas fa-info-circle"></i>
                General Conditions
              </h3>
              <div className="weather-text-content">
                {weatherData.prediction.conditions}
              </div>
            </div>

            {/* Historical Data */}
            <div className="weather-section" style={{ '--section-index': 1 } as React.CSSProperties}>
              <h3 className="weather-section-title">
                <i className="fas fa-history"></i>
                Historical Data Used ({weatherData.historicalData.length} years)
              </h3>
              <div className="historical-data-table">
                <table>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'center', '--i': 0 } as React.CSSProperties}><i className="fas fa-calendar-alt"></i> Year</th>
                      <th style={{ textAlign: 'right', '--i': 1 } as React.CSSProperties}><i className="fas fa-thermometer-half"></i> Temp (°C)</th>
                      <th style={{ textAlign: 'right', '--i': 2 } as React.CSSProperties}><i className="fas fa-temperature-high"></i> Máx (°C)</th>
                      <th style={{ textAlign: 'right', '--i': 3 } as React.CSSProperties}><i className="fas fa-temperature-low"></i> Mín (°C)</th>
                      <th style={{ textAlign: 'right', '--i': 4 } as React.CSSProperties}><i className="fas fa-tint"></i> Humidity (%)</th>
                      <th style={{ textAlign: 'right', '--i': 5 } as React.CSSProperties}><i className="fas fa-wind"></i> Wind (m/s)</th>
                      <th style={{ textAlign: 'right', '--i': 6 } as React.CSSProperties}><i className="fas fa-cloud-rain"></i> Precip (mm)</th>
                      <th style={{ textAlign: 'right', '--i': 7 } as React.CSSProperties}><i className="fas fa-cloud"></i> Nubes (%)</th>
                      <th style={{ textAlign: 'right', '--i': 8 } as React.CSSProperties}><i className="fas fa-sun"></i> UV</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weatherData.historicalData.map((data, index) => {
                      const year = data.date.split('-')[0]
                      const formatHour = (hour?: number) => {
                        if (hour === undefined || hour === null) return ''
                        const h = hour % 12 || 12
                        const ampm = hour < 12 ? 'AM' : 'PM'
                        return ` (${h}:00 ${ampm})`
                      }
                      
                      return (
                        <tr key={data.date} style={{ '--row-index': index } as React.CSSProperties}>
                          <td style={{ textAlign: 'center' }}><strong>{year}</strong></td>
                          <td style={{ textAlign: 'right' }}>{(data.temperatureC ?? 0).toFixed(1)}°C</td>
                          <td style={{ textAlign: 'right' }} title={`Hour of maximum temperature${formatHour(data.hourMax)}`}>
                            {data.temperatureMax !== undefined ? `${data.temperatureMax.toFixed(1)}°C${formatHour(data.hourMax)}` : '-'}
                          </td>
                          <td style={{ textAlign: 'right' }} title={`Hour of minimum temperature${formatHour(data.hourMin)}`}>
                            {data.temperatureMin !== undefined ? `${data.temperatureMin.toFixed(1)}°C${formatHour(data.hourMin)}` : '-'}
                          </td>
                          <td style={{ textAlign: 'right' }}>{(data.humidity ?? 0).toFixed(1)}%</td>
                          <td style={{ textAlign: 'right' }}>{(data.windSpeed ?? 0).toFixed(1)} m/s</td>
                          <td style={{ textAlign: 'right' }}>{(data.precipitation ?? 0).toFixed(1)} mm</td>
                          <td style={{ textAlign: 'right' }}>{(data.cloudCover ?? 0).toFixed(1)}%</td>
                          <td style={{ textAlign: 'right' }}>{(data.uvIndex ?? 0).toFixed(1)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="weather-section" style={{ '--section-index': 2 } as React.CSSProperties}>
              <h3 className="weather-section-title">
                <i className="fas fa-chart-line"></i>
                Estadísticas del Análisis
              </h3>
              <div className="weather-stats-grid">
                {tempStats && (
                  <>
                    <div className="weather-info-item" style={{ '--stat-index': 0 } as React.CSSProperties}>
                      <i className="fas fa-temperature-high" style={{ color: '#ff6b6b' }}></i>
                      <div className="weather-info-content">
                        <div className="weather-info-label">Maximum Temperature Average</div>
                        <div className="weather-info-value">
                          {tempStats.avgMaxTemp.toFixed(1)}°C
                          <span style={{ fontSize: '0.75rem', marginLeft: '0.5rem', color: '#6c757d' }}>
                            a las {formatHour12(tempStats.mostCommonMaxHour)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="weather-info-item" style={{ '--stat-index': 1 } as React.CSSProperties}>
                      <i className="fas fa-temperature-low" style={{ color: '#4dabf7' }}></i>
                      <div className="weather-info-content">
                        <div className="weather-info-label">Minimum Temperature Average</div>
                        <div className="weather-info-value">
                          {tempStats.avgMinTemp.toFixed(1)}°C
                          <span style={{ fontSize: '0.75rem', marginLeft: '0.5rem', color: '#6c757d' }}>
                            a las {formatHour12(tempStats.mostCommonMinHour)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                <div className="weather-info-item" style={{ '--stat-index': 2 } as React.CSSProperties}>
                  <i className="fas fa-tint"></i>
                  <div className="weather-info-content">
                    <div className="weather-info-label">Humidity Average</div>
                    <div className="weather-info-value">{weatherData.statistics.humidity.mean.toFixed(1)}% ± {weatherData.statistics.humidity.std.toFixed(1)}%</div>
                  </div>
                </div>
                <div className="weather-info-item" style={{ '--stat-index': 3 } as React.CSSProperties}>
                  <i className="fas fa-wind"></i>
                  <div className="weather-info-content">
                    <div className="weather-info-label">Wind Average</div>
                    <div className="weather-info-value">{weatherData.statistics.windSpeed.mean.toFixed(1)} m/s ± {weatherData.statistics.windSpeed.std.toFixed(1)} m/s</div>
                  </div>
                </div>
                <div className="weather-info-item" style={{ '--stat-index': 4 } as React.CSSProperties}>
                  <i className="fas fa-cloud-rain"></i>
                  <div className="weather-info-content">
                    <div className="weather-info-label">Precipitation Average</div>
                    <div className="weather-info-value">{weatherData.statistics.precipitation.mean.toFixed(1)} mm ± {weatherData.statistics.precipitation.std.toFixed(1)} mm</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="readonly-badge">
              <i className="fas fa-lock"></i>
              <span>This prediction is based on statistical analysis of {weatherData.historicalData.length} years of historical data</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
