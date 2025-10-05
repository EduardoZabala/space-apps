import { useEffect } from 'react'
import '../styles/WeatherEffects.css'

interface WeatherEffectsProps {
  weatherType: string
}

export default function WeatherEffects({ weatherType }: WeatherEffectsProps) {
  useEffect(() => {
    // Limpiar efectos anteriores
    const existingEffects = document.querySelector('.weather-effects')
    if (existingEffects) {
      existingEffects.remove()
    }

    // Crear contenedor de efectos
    const effectsContainer = document.createElement('div')
    effectsContainer.className = 'weather-effects'
    document.body.appendChild(effectsContainer)

    // Generar efectos según el tipo de clima
    switch (weatherType.toLowerCase()) {
      case 'rainy':
        createRainEffect(effectsContainer)
        break
      case 'snowy':
        createSnowEffect(effectsContainer)
        break
      case 'stormy':
        createStormEffect(effectsContainer)
        break
      case 'cloudy':
        createCloudEffect(effectsContainer)
        break
      case 'sunny':
        createSunEffect(effectsContainer)
        break
      case 'foggy':
        createFogEffect(effectsContainer)
        break
      default:
        createCloudEffect(effectsContainer)
    }

    // Cleanup al desmontar
    return () => {
      const effects = document.querySelector('.weather-effects')
      if (effects) {
        effects.remove()
      }
    }
  }, [weatherType])

  return null
}

function createRainEffect(container: HTMLElement) {
  const dropCount = 150
  for (let i = 0; i < dropCount; i++) {
    const drop = document.createElement('div')
    drop.className = 'rain-drop'
    drop.style.left = `${Math.random() * 100}%`
    drop.style.animationDelay = `${Math.random() * 2}s`
    drop.style.animationDuration = `${0.5 + Math.random() * 0.5}s`
    container.appendChild(drop)
  }
}

function createSnowEffect(container: HTMLElement) {
  const flakeCount = 100
  for (let i = 0; i < flakeCount; i++) {
    const flake = document.createElement('div')
    flake.className = 'snow-flake'
    flake.innerHTML = '❄'
    flake.style.left = `${Math.random() * 100}%`
    flake.style.animationDelay = `${Math.random() * 5}s`
    flake.style.animationDuration = `${5 + Math.random() * 10}s`
    flake.style.fontSize = `${10 + Math.random() * 20}px`
    flake.style.opacity = `${0.3 + Math.random() * 0.7}`
    container.appendChild(flake)
  }
}

function createStormEffect(container: HTMLElement) {
  // Lluvia intensa
  const dropCount = 250
  for (let i = 0; i < dropCount; i++) {
    const drop = document.createElement('div')
    drop.className = 'rain-drop storm'
    drop.style.left = `${Math.random() * 100}%`
    drop.style.animationDelay = `${Math.random() * 1}s`
    drop.style.animationDuration = `${0.3 + Math.random() * 0.3}s`
    container.appendChild(drop)
  }

  // Relámpagos
  const lightning = document.createElement('div')
  lightning.className = 'lightning'
  container.appendChild(lightning)

  setInterval(() => {
    if (Math.random() > 0.8) {
      lightning.style.opacity = '1'
      setTimeout(() => {
        lightning.style.opacity = '0'
      }, 100)
    }
  }, 2000)
}

function createCloudEffect(container: HTMLElement) {
  const cloudCount = 5
  for (let i = 0; i < cloudCount; i++) {
    const cloud = document.createElement('div')
    cloud.className = 'cloud'
    cloud.style.top = `${Math.random() * 30}%`
    cloud.style.animationDelay = `${Math.random() * 10}s`
    cloud.style.animationDuration = `${30 + Math.random() * 20}s`
    cloud.style.opacity = `${0.3 + Math.random() * 0.4}`
    container.appendChild(cloud)
  }
}

function createSunEffect(container: HTMLElement) {
  const sun = document.createElement('div')
  sun.className = 'sun-effect'
  container.appendChild(sun)

  // Rayos de sol
  for (let i = 0; i < 12; i++) {
    const ray = document.createElement('div')
    ray.className = 'sun-ray'
    ray.style.transform = `rotate(${i * 30}deg)`
    sun.appendChild(ray)
  }
}

function createFogEffect(container: HTMLElement) {
  const fogLayerCount = 3
  for (let i = 0; i < fogLayerCount; i++) {
    const fog = document.createElement('div')
    fog.className = 'fog-layer'
    fog.style.animationDelay = `${i * 7}s`
    fog.style.opacity = `${0.2 + (i * 0.1)}`
    container.appendChild(fog)
  }
}
