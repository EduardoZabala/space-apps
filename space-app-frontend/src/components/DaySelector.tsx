import { useState } from 'react'

interface DayData {
  day: number
  hasData: boolean
}

interface DaySelectorProps {
  year: number
  month: number
  days: DayData[]
  onSelectDay: (day: number) => void
  onBack: () => void
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const DAYS_OF_WEEK = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export default function DaySelector({ year, month, days, onSelectDay, onBack }: DaySelectorProps) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const handleDayClick = (day: number, hasData: boolean) => {
    if (!hasData) return
    setSelectedDay(day)
    onSelectDay(day)
  }

  const getDayOfWeek = (day: number) => {
    const date = new Date(year, month - 1, day)
    return DAYS_OF_WEEK[date.getDay()]
  }

  return (
    <div className="weather-container">
      <div className="weather-page">
        <div className="weather-header">
          <div className="weather-header-content">
            <button className="weather-btn weather-btn-secondary" onClick={onBack}>
              <i className="fas fa-arrow-left"></i>
              Volver a Meses
            </button>
            <h1 className="weather-title">
              <i className="fas fa-calendar-day"></i>
              {MONTH_NAMES[month - 1]} {year} - Selecciona un Día
            </h1>
          </div>
        </div>

        <div className="cards-level-container">
          <div className="level-info">
            <i className="fas fa-layer-group"></i>
            <span>Nivel 3: Días de {MONTH_NAMES[month - 1]} {year}</span>
          </div>

          <div className="day-cards-grid">
            {days.map((dayData) => (
              <div
                key={dayData.day}
                className={`day-card ${!dayData.hasData ? 'disabled' : ''} ${selectedDay === dayData.day ? 'selected' : ''}`}
                onClick={() => handleDayClick(dayData.day, dayData.hasData)}
              >
                <div className="day-card-header">
                  <span className="day-of-week">{getDayOfWeek(dayData.day)}</span>
                </div>
                <div className="day-card-body">
                  <div className="day-number">{dayData.day}</div>
                  <div className="day-status">
                    {dayData.hasData ? (
                      <>
                        <i className="fas fa-check-circle"></i>
                        <span>Datos disponibles</span>
                      </>
                    ) : (
                      <>
                        <i className="fas fa-times-circle"></i>
                        <span>Sin datos</span>
                      </>
                    )}
                  </div>
                </div>
                {dayData.hasData && (
                  <div className="day-card-footer">
                    <span className="card-action-text">
                      Ver reporte <i className="fas fa-arrow-right"></i>
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {days.length === 0 && (
            <div className="empty-state">
              <i className="fas fa-calendar-times"></i>
              <h3>No hay datos disponibles</h3>
              <p>No se encontraron días con información para {MONTH_NAMES[month - 1]} {year}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
