import { useState } from 'react'

interface MonthData {
  month: number
  days: number[]
}

interface MonthSelectorProps {
  year: number
  months: MonthData[]
  onSelectMonth: (month: number) => void
  onBack: () => void
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export default function MonthSelector({ year, months, onSelectMonth, onBack }: MonthSelectorProps) {
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)

  const handleMonthClick = (month: number) => {
    setSelectedMonth(month)
    onSelectMonth(month)
  }

  return (
    <div className="weather-container">
      <div className="weather-page">
        <div className="weather-header">
          <div className="weather-header-content">
            <button className="weather-btn weather-btn-secondary" onClick={onBack}>
              <i className="fas fa-arrow-left"></i>
              Volver a Años
            </button>
            <h1 className="weather-title">
              <i className="fas fa-calendar-alt"></i>
              Año {year} - Selecciona un Mes
            </h1>
          </div>
        </div>

        <div className="cards-level-container">
          <div className="level-info">
            <i className="fas fa-layer-group"></i>
            <span>Nivel 2: Meses del año {year}</span>
          </div>

          <div className="month-cards-grid">
            {months.map((monthData) => (
              <div
                key={monthData.month}
                className={`month-card ${selectedMonth === monthData.month ? 'selected' : ''}`}
                onClick={() => handleMonthClick(monthData.month)}
              >
                <div className="month-card-header">
                  <i className="fas fa-calendar-week"></i>
                </div>
                <div className="month-card-body">
                  <div className="month-name">{MONTH_NAMES[monthData.month - 1]}</div>
                  <div className="month-year">{year}</div>
                  <div className="month-info">
                    <i className="fas fa-calendar-day"></i>
                    <span>{monthData.days.length} {monthData.days.length === 1 ? 'día' : 'días'}</span>
                  </div>
                </div>
                <div className="month-card-footer">
                  <span className="card-action-text">
                    Clic para ver días <i className="fas fa-arrow-right"></i>
                  </span>
                </div>
              </div>
            ))}
          </div>

          {months.length === 0 && (
            <div className="empty-state">
              <i className="fas fa-calendar-times"></i>
              <h3>No hay datos disponibles</h3>
              <p>No se encontraron meses con información para el año {year}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
