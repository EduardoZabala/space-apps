import { useEffect, useState } from 'react'

type WeatherReportData = {
  title: string
  location: string
  startDate: string
  endDate: string
  temperatureC?: number
  humidity?: number
  windSpeed?: number
  windDirection?: string
  conditions?: string
  precipitation?: string
  visibility?: string
  forecast?: string
  notes?: string
  reporter?: string
}

export default function WeatherReport() {
  const [data, setData] = useState<WeatherReportData>({
    title: 'Weather Report',
    location: '',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    temperatureC: undefined,
    humidity: undefined,
    windSpeed: undefined,
    windDirection: '',
    conditions: 'Clear',
    precipitation: 'Ninguna',
    visibility: '',
    forecast: '',
    notes: '',
    reporter: '',
  })

  const [showPreview, setShowPreview] = useState(true)
  const [dateError, setDateError] = useState('')

  useEffect(() => {
    // Keep preview open by default on first render
  }, [])

  function update<K extends keyof WeatherReportData>(key: K, value: WeatherReportData[K]) {
    setData((d) => {
      const newData = { ...d, [key]: value }
      if (key === 'startDate' || key === 'endDate') {
        if (newData.startDate && newData.endDate && newData.endDate < newData.startDate) {
          setDateError('End date must be greater than or equal to start date')
          return d
        } else {
          setDateError('')
        }
      }
      return newData
    })
  }

  function tempF(): number | undefined {
    if (data.temperatureC == null) return undefined
    return Math.round((data.temperatureC * 9) / 5 + 32)
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(data.title || 'reporte').replace(/\s+/g, '_')}_${new Date().toISOString()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function onPrint() {
    window.print()
  }

  return (
    <div className="weather-container">
      <div className="weather-page">
        <div className="weather-header">
          <div className="weather-header-content">
            <h1 className="weather-title">
              <i className="fas fa-cloud-sun"></i>
              Weather Report
            </h1>
            <div className="weather-actions">
              <button className="weather-btn weather-btn-secondary" onClick={() => setShowPreview((s) => !s)}>
                <i className={showPreview ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
                {showPreview ? 'Hide form' : 'Show form'}
              </button>
              <button className="weather-btn" onClick={exportJSON}>
                <i className="fas fa-download"></i>
                Export JSON
              </button>
              <button className="weather-btn weather-btn-success" onClick={onPrint}>
                <i className="fas fa-print"></i>
                Print
              </button>
            </div>
          </div>
        </div>

        {showPreview && (
          <div className="weather-form-section">
            <div className="weather-form-grid">
              <div className="weather-form-field">
                <label className="weather-form-label">
                  <i className="fas fa-heading"></i>
                  Title
                </label>
                <input 
                  className="weather-form-input" 
                  value={data.title} 
                  onChange={(e) => update('title', e.target.value)} 
                />
              </div>

              <div className="weather-form-field">
                <label className="weather-form-label">
                  <i className="fas fa-map-marker-alt"></i>
                  Location
                </label>
                <input 
                  className="weather-form-input" 
                  value={data.location} 
                  onChange={(e) => update('location', e.target.value)} 
                  placeholder="City, station or coordinates" 
                />
              </div>

              <div className="weather-form-field">
                <label className="weather-form-label">
                  <i className="fas fa-calendar-alt"></i>
                  Start date
                </label>
                <input 
                  type="date" 
                  className="weather-form-input" 
                  value={data.startDate} 
                  onChange={(e) => update('startDate', e.target.value)} 
                />
              </div>

              <div className="weather-form-field">
                <label className="weather-form-label">
                  <i className="fas fa-calendar-alt"></i>
                  End date
                </label>
                <input 
                  type="date" 
                  className="weather-form-input" 
                  value={data.endDate} 
                  onChange={(e) => update('endDate', e.target.value)} 
                  style={{ borderColor: dateError ? '#dc3545' : undefined }}
                />
                {dateError && <div style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem' }}>{dateError}</div>}
              </div>

              <div className="weather-form-field">
                <label className="weather-form-label">
                  <i className="fas fa-thermometer-half"></i>
                  Temperature (°C)
                </label>
                <input 
                  type="number" 
                  className="weather-form-input" 
                  value={data.temperatureC ?? ''} 
                  onChange={(e) => update('temperatureC', e.target.value === '' ? undefined : Number(e.target.value))} 
                />
              </div>

              <div className="weather-form-field">
                <label className="weather-form-label">
                  <i className="fas fa-tint"></i>
                  Humidity (%)
                </label>
                <input 
                  type="number" 
                  className="weather-form-input" 
                  value={data.humidity ?? ''} 
                  onChange={(e) => update('humidity', e.target.value === '' ? undefined : Number(e.target.value))} 
                />
              </div>

              <div className="weather-form-field">
                <label className="weather-form-label">
                  <i className="fas fa-wind"></i>
                  Wind (m/s)
                </label>
                <input 
                  type="number" 
                  className="weather-form-input" 
                  value={data.windSpeed ?? ''} 
                  onChange={(e) => update('windSpeed', e.target.value === '' ? undefined : Number(e.target.value))} 
                />
              </div>

              <div className="weather-form-field">
                <label className="weather-form-label">
                  <i className="fas fa-compass"></i>
                  Wind direction
                </label>
                <input 
                  className="weather-form-input" 
                  value={data.windDirection} 
                  onChange={(e) => update('windDirection', e.target.value)} 
                  placeholder="N, NE, E, SE..." 
                />
              </div>

              <div className="weather-form-field weather-form-field-full">
                <label className="weather-form-label">
                  <i className="fas fa-cloud"></i>
                  Current conditions
                </label>
                <select 
                  className="weather-form-select" 
                  value={data.conditions} 
                  onChange={(e) => update('conditions', e.target.value)}
                >
                  <option>Clear</option>
                  <option>Partly cloudy</option>
                  <option>Cloudy</option>
                  <option>Rain</option>
                  <option>Storm</option>
                  <option>Snow</option>
                  <option>Mist/Fog</option>
                </select>
              </div>

              <div className="weather-form-field">
                <label className="weather-form-label">
                  <i className="fas fa-cloud-rain"></i>
                  Precipitation
                </label>
                <input 
                  className="weather-form-input" 
                  value={data.precipitation} 
                  onChange={(e) => update('precipitation', e.target.value)} 
                  placeholder="e.g. 2 mm/h, ligera" 
                />
              </div>

              <div className="weather-form-field">
                <label className="weather-form-label">
                  <i className="fas fa-eye"></i>
                  Visibility
                </label>
                <input 
                  className="weather-form-input" 
                  value={data.visibility} 
                  onChange={(e) => update('visibility', e.target.value)} 
                  placeholder="km o m" 
                />
              </div>

              <div className="weather-form-field">
                <label className="weather-form-label">
                  <i className="fas fa-user"></i>
                  Reported by
                </label>
                <input 
                  className="weather-form-input" 
                  value={data.reporter} 
                  onChange={(e) => update('reporter', e.target.value)} 
                />
              </div>

              <div className="weather-form-field weather-form-field-full">
                <label className="weather-form-label">
                  <i className="fas fa-chart-line"></i>
                  Brief forecast
                </label>
                <textarea 
                  className="weather-form-textarea" 
                  rows={3} 
                  value={data.forecast} 
                  onChange={(e) => update('forecast', e.target.value)} 
                />
              </div>

              <div className="weather-form-field weather-form-field-full">
                <label className="weather-form-label">
                  <i className="fas fa-clipboard"></i>
                  Observations
                </label>
                <textarea 
                  className="weather-form-textarea" 
                  rows={3} 
                  value={data.notes} 
                  onChange={(e) => update('notes', e.target.value)} 
                  placeholder="Details, sources, limitations, instruments used..." 
                />
              </div>
            </div>
          </div>
        )}

        <div className="weather-preview-card">
          <div className="weather-preview-header">
            <h2 className="weather-preview-title">{data.title}</h2>
            <div className="weather-preview-meta">
              <div className="weather-meta-item">
                <i className="fas fa-map-marker-alt"></i>
                <span>{data.location || 'Location no especificada'}</span>
              </div>
              <div className="weather-meta-item">
                <i className="fas fa-calendar-alt"></i>
                <span>
                  {data.startDate && data.endDate 
                    ? `${new Date(data.startDate).toLocaleDateString('en-US', { dateStyle: 'long' })} - ${new Date(data.endDate).toLocaleDateString('en-US', { dateStyle: 'long' })}`
                    : 'Dates not specified'}
                </span>
              </div>
            </div>
          </div>

          <div className="weather-preview-body">
            <div className="weather-stats-grid">
              <div className="weather-stat-card">
                <div className="weather-stat-icon">
                  <i className="fas fa-thermometer-half"></i>
                </div>
                <div className="weather-stat-label">Temperature</div>
                <div className="weather-stat-value">
                  {data.temperatureC != null ? `${data.temperatureC} °C` : '—'}
                </div>
                {data.temperatureC != null && (
                  <div style={{ fontSize: '0.85rem', color: '#6c757d', marginTop: '0.25rem' }}>
                    {tempF()} °F
                  </div>
                )}
              </div>

              <div className="weather-stat-card">
                <div className="weather-stat-icon">
                  <i className="fas fa-tint"></i>
                </div>
                <div className="weather-stat-label">Humidity</div>
                <div className="weather-stat-value">
                  {data.humidity != null ? `${data.humidity} %` : '—'}
                </div>
              </div>

              <div className="weather-stat-card">
                <div className="weather-stat-icon">
                  <i className="fas fa-wind"></i>
                </div>
                <div className="weather-stat-label">Wind</div>
                <div className="weather-stat-value">
                  {data.windSpeed != null ? `${data.windSpeed} m/s` : '—'}
                </div>
              </div>

              <div className="weather-stat-card">
                <div className="weather-stat-icon">
                  <i className="fas fa-compass"></i>
                </div>
                <div className="weather-stat-label">Direction</div>
                <div className="weather-stat-value">
                  {data.windDirection || '—'}
                </div>
              </div>
            </div>

            <div className="weather-section">
              <h3 className="weather-section-title">
                <i className="fas fa-info-circle"></i>
                General Information
              </h3>
              <div className="weather-info-grid">
                <div className="weather-info-item">
                  <i className="fas fa-cloud"></i>
                  <div className="weather-info-content">
                    <div className="weather-info-label">Conditions</div>
                    <div className="weather-info-value">{data.conditions || '—'}</div>
                  </div>
                </div>
                <div className="weather-info-item">
                  <i className="fas fa-cloud-rain"></i>
                  <div className="weather-info-content">
                    <div className="weather-info-label">Precipitation</div>
                    <div className="weather-info-value">{data.precipitation || '—'}</div>
                  </div>
                </div>
                <div className="weather-info-item">
                  <i className="fas fa-eye"></i>
                  <div className="weather-info-content">
                    <div className="weather-info-label">Visibility</div>
                    <div className="weather-info-value">{data.visibility || '—'}</div>
                  </div>
                </div>
              </div>
            </div>

            {data.forecast && (
              <div className="weather-section">
                <h3 className="weather-section-title">
                  <i className="fas fa-chart-line"></i>
                  Forecast
                </h3>
                <div className="weather-text-content">
                  {data.forecast}
                </div>
              </div>
            )}

            {data.notes && (
              <div className="weather-section">
                <h3 className="weather-section-title">
                  <i className="fas fa-clipboard"></i>
                  Observations
                </h3>
                <div className="weather-text-content">
                  {data.notes}
                </div>
              </div>
            )}

            {data.reporter && (
              <div className="weather-reporter">
                <i className="fas fa-user"></i> Reported by: <strong>{data.reporter}</strong>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
