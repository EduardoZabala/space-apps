import './App.css'
import WeatherReport from './components/WeatherReport'

function App() {
  return (
    <div className="container py-5">
      <h1 className="mb-4">Space Apps — Plantilla de reporte meteorológico</h1>

      <WeatherReport />
    </div>
  )
}

export default App