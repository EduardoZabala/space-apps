import { useEffect, useState } from 'react'

type WeatherReportData = {
  title: string
  location: string
  datetime: string
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
    title: 'Reporte meteorológico',
    location: '',
    datetime: new Date().toISOString().slice(0, 16), // yyyy-mm-ddThh:mm
    temperatureC: undefined,
    humidity: undefined,
    windSpeed: undefined,
    windDirection: '',
    conditions: 'Despejado',
    precipitation: 'Ninguna',
    visibility: '',
    forecast: '',
    notes: '',
    reporter: '',
  })

  const [showPreview, setShowPreview] = useState(true)

  useEffect(() => {
    // Keep preview open by default on first render
  }, [])

  function update<K extends keyof WeatherReportData>(key: K, value: WeatherReportData[K]) {
    setData((d) => ({ ...d, [key]: value }))
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
    <div className="p-4">
      <div className="mb-4 d-flex justify-content-between align-items-start">
        <h2 className="mb-0">Plantilla: reporte del clima</h2>
        <div>
          <button className="btn btn-outline-secondary me-2" onClick={() => setShowPreview((s) => !s)}>
            {showPreview ? 'Ocultar formulario' : 'Mostrar formulario'}
          </button>
          <button className="btn btn-primary me-2" onClick={exportJSON}>Exportar JSON</button>
          <button className="btn btn-success" onClick={onPrint}>Imprimir</button>
        </div>
      </div>

      {showPreview && (
        <form className="mb-4">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Título</label>
              <input className="form-control" value={data.title} onChange={(e) => update('title', e.target.value)} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Ubicación</label>
              <input className="form-control" value={data.location} onChange={(e) => update('location', e.target.value)} placeholder="Ciudad, estación o coordenadas" />
            </div>

            <div className="col-md-4">
              <label className="form-label">Fecha y hora</label>
              <input type="datetime-local" className="form-control" value={data.datetime} onChange={(e) => update('datetime', e.target.value)} />
            </div>

            <div className="col-md-2">
              <label className="form-label">Temp (°C)</label>
              <input type="number" className="form-control" value={data.temperatureC ?? ''} onChange={(e) => update('temperatureC', e.target.value === '' ? undefined : Number(e.target.value))} />
            </div>

            <div className="col-md-2">
              <label className="form-label">Humedad (%)</label>
              <input type="number" className="form-control" value={data.humidity ?? ''} onChange={(e) => update('humidity', e.target.value === '' ? undefined : Number(e.target.value))} />
            </div>

            <div className="col-md-2">
              <label className="form-label">Viento (m/s)</label>
              <input type="number" className="form-control" value={data.windSpeed ?? ''} onChange={(e) => update('windSpeed', e.target.value === '' ? undefined : Number(e.target.value))} />
            </div>

            <div className="col-md-2">
              <label className="form-label">Dirección</label>
              <input className="form-control" value={data.windDirection} onChange={(e) => update('windDirection', e.target.value)} placeholder="N, NE, E..." />
            </div>

            <div className="col-12">
              <label className="form-label">Condiciones</label>
              <select className="form-select" value={data.conditions} onChange={(e) => update('conditions', e.target.value)}>
                <option>Despejado</option>
                <option>Parcialmente nublado</option>
                <option>Nublado</option>
                <option>Lluvia</option>
                <option>Tormenta</option>
                <option>Nieve</option>
                <option>Bruma/Niebla</option>
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label">Precipitación</label>
              <input className="form-control" value={data.precipitation} onChange={(e) => update('precipitation', e.target.value)} placeholder="e.g. 2 mm/h, ligera" />
            </div>

            <div className="col-md-4">
              <label className="form-label">Visibilidad</label>
              <input className="form-control" value={data.visibility} onChange={(e) => update('visibility', e.target.value)} placeholder="km or m" />
            </div>

            <div className="col-md-4">
              <label className="form-label">Reportado por</label>
              <input className="form-control" value={data.reporter} onChange={(e) => update('reporter', e.target.value)} />
            </div>

            <div className="col-12">
              <label className="form-label">Pronóstico breve</label>
              <textarea className="form-control" rows={3} value={data.forecast} onChange={(e) => update('forecast', e.target.value)} />
            </div>

            <div className="col-12">
              <label className="form-label">Observaciones</label>
              <textarea className="form-control" rows={3} value={data.notes} onChange={(e) => update('notes', e.target.value)} placeholder="Detalles, fuentes, limitaciones, instrumentos usados..." />
            </div>
          </div>
        </form>
      )}

      <div className="card">
        <div className="card-body">
          <h3 className="card-title">{data.title}</h3>
          <p className="text-muted mb-1">Ubicación: <strong>{data.location || '—'}</strong></p>
          <p className="text-muted">Fecha/hora: <strong>{data.datetime ? new Date(data.datetime).toLocaleString() : '—'}</strong></p>

          <div className="row">
            <div className="col-md-3"><strong>Temperatura:</strong> {data.temperatureC != null ? `${data.temperatureC} °C (${tempF()} °F)` : '—'}</div>
            <div className="col-md-3"><strong>Humedad:</strong> {data.humidity != null ? `${data.humidity} %` : '—'}</div>
            <div className="col-md-3"><strong>Viento:</strong> {data.windSpeed != null ? `${data.windSpeed} m/s` : '—'}</div>
            <div className="col-md-3"><strong>Dirección:</strong> {data.windDirection || '—'}</div>
          </div>

          <hr />

          <p><strong>Condiciones actuales:</strong> {data.conditions || '—'}</p>
          <p><strong>Precipitación:</strong> {data.precipitation || '—'}</p>
          <p><strong>Visibilidad:</strong> {data.visibility || '—'}</p>

          <h5>Pronóstico</h5>
          <p>{data.forecast || '—'}</p>

          <h5>Observaciones</h5>
          <p>{data.notes || '—'}</p>

          <p className="mt-3 mb-0 text-end"><em>Reportado por: {data.reporter || '—'}</em></p>
        </div>
      </div>
    </div>
  )
}
