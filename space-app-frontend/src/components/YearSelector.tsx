import { useState } from 'react'

interface Year {
  year: number
  months: number[]
}

interface YearSelectorProps {
  years: Year[]
  onSelectYear: (year: number) => void
}

export default function YearSelector({ years, onSelectYear }: YearSelectorProps) {
  const [selectedYear, setSelectedYear] = useState<number | null>(null)

  const handleYearClick = (year: number) => {
    setSelectedYear(year)
    onSelectYear(year)
  }

  return (
    <div className="weather-container">
      <div className="weather-page">
        <div className="weather-header">
          <div className="weather-header-content">
            <h1 className="weather-title">
              <i className="fas fa-calendar"></i>
              Selecciona un Año
            </h1>
          </div>
        </div>

        <div className="cards-level-container">
          <div className="level-info">
            <i className="fas fa-layer-group"></i>
            <span>Nivel 1: Años disponibles</span>
          </div>

          <div className="year-cards-grid">
            {years.map((yearData) => (
              <div
                key={yearData.year}
                className={`year-card ${selectedYear === yearData.year ? 'selected' : ''}`}
                onClick={() => handleYearClick(yearData.year)}
              >
                <div className="year-card-header">
                  <i className="fas fa-calendar-alt"></i>
                </div>
                <div className="year-card-body">
                  <div className="year-number">{yearData.year}</div>
                  <div className="year-info">
                    <i className="fas fa-calendar-week"></i>
                    <span>{yearData.months.length} {yearData.months.length === 1 ? 'mes' : 'meses'}</span>
                  </div>
                </div>
                <div className="year-card-footer">
                  <span className="card-action-text">
                    Clic para ver meses <i className="fas fa-arrow-right"></i>
                  </span>
                </div>
              </div>
            ))}
          </div>

          {years.length === 0 && (
            <div className="empty-state">
              <i className="fas fa-calendar-times"></i>
              <h3>No hay datos disponibles</h3>
              <p>No se encontraron años con información para el rango de fechas seleccionado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
