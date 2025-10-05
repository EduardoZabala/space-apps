"""
Proveedor de datos climatológicos sintéticos pero realistas.
Genera datos basados en patrones meteorológicos reales y ubicación geográfica.
"""
import numpy as np
import pandas as pd
from datetime import datetime
from .base import WeatherDataProvider

class MockProvider(WeatherDataProvider):
    """
    Genera datos meteorológicos sintéticos basados en climatología real.
    Utiliza modelos de variación estacional, latitudinal y aleatoria realista.
    Ideal para desarrollo y demostración sin necesidad de conexión a NASA.
    """
    
    def fetch_historical_data(
        self,
        lat: float,
        lon: float,
        target_month: int,
        target_day: int,
        years_back: int = 20
    ) -> pd.DataFrame:
        """
        Genera datos climatológicos sintéticos basados en ubicación y época del año.
        
        Factores considerados:
        - Latitud: Temperatura base según distancia del ecuador
        - Estacionalidad: Variación según mes del año
        - Hemisferio: Estaciones invertidas en hemisferio sur
        - Variabilidad interanual: Cambios año a año realistas
        - Patrones de precipitación y humedad correlacionados con temperatura
        """
        # Semilla basada en ubicación para consistencia
        np.random.seed(int(abs(lat * 1000 + lon * 100 + target_month * 10 + target_day)))
        
        current_year = datetime.now().year
        years = list(range(current_year - years_back, current_year))
        
        # Determinar hemisferio para ajustar estaciones
        is_northern = lat >= 0
        effective_month = target_month if is_northern else ((target_month + 6) % 12) or 12
        
        # Temperatura base según latitud (más cálido cerca del ecuador)
        abs_lat = abs(lat)
        if abs_lat < 23.5:  # Trópicos
            base_temp = 25 + (23.5 - abs_lat) * 0.3
            temp_variation = 5
        elif abs_lat < 35:  # Subtrópicos
            base_temp = 20 + (35 - abs_lat) * 0.4
            temp_variation = 8
        elif abs_lat < 50:  # Templadas
            base_temp = 12 + (50 - abs_lat) * 0.5
            temp_variation = 12
        elif abs_lat < 66.5:  # Subpolares
            base_temp = 5 + (66.5 - abs_lat) * 0.3
            temp_variation = 15
        else:  # Polares
            base_temp = -10
            temp_variation = 20
        
        # Ajuste estacional (máximo en verano, mínimo en invierno)
        seasonal_factor = np.sin(2 * np.pi * (effective_month - 3) / 12)
        
        data = []
        for year in years:
            # Variación año a año (simula El Niño, La Niña, etc.)
            year_anomaly = np.random.normal(0, 1.5)
            
            # Temperatura con todos los factores
            temp = base_temp + (seasonal_factor * temp_variation) + year_anomaly
            temp += np.random.normal(0, 2)  # Variabilidad diaria
            
            # Humedad (inversamente proporcional a temperatura en general)
            humidity_base = 70 - (temp - 15) * 1.5
            # Ajuste por proximidad al agua (simplificado)
            if abs(lon) > 150 or abs(lon) < 30:  # Cerca de océanos
                humidity_base += 10
            humidity = max(20, min(100, humidity_base + np.random.normal(0, 8)))
            
            # Viento (mayor en latitudes medias y costas)
            wind_base = 5 + abs(abs_lat - 45) * 0.1
            if abs(lon) > 150 or abs(lon) < 30:  # Costas
                wind_base += 3
            wind_speed = max(0, wind_base + np.random.normal(0, 3))
            
            # Dirección del viento (predominantemente del oeste en latitudes medias)
            if 30 < abs_lat < 60:
                wind_dir = np.random.normal(270, 45) % 360  # Del oeste
            else:
                wind_dir = np.random.uniform(0, 360)
            
            # Precipitación (correlacionada con humedad y estación)
            if humidity > 70:
                precip_rate = 2.5
            elif humidity > 50:
                precip_rate = 1.0
            else:
                precip_rate = 0.3
            
            # Más lluvia en verano en trópicos, en invierno en mediterráneo
            if abs_lat < 35 and seasonal_factor > 0:
                precip_rate *= 1.8
            elif 35 < abs_lat < 45 and seasonal_factor < 0:
                precip_rate *= 1.5
                
            precipitation = max(0, np.random.exponential(precip_rate))
            
            # Nuevas variables climáticas
            # Cobertura de nubes (correlacionada con humedad)
            cloud_cover = min(100, max(0, humidity * 0.8 + np.random.normal(0, 15)))
            
            # Presión atmosférica (varía con altitud y clima)
            # Presión base a nivel del mar: ~1013 hPa
            altitude_effect = abs_lat * 0.5  # Simplificación
            pressure = 1013 - altitude_effect + np.random.normal(0, 10)
            
            # Punto de rocío (relacionado con temperatura y humedad)
            dew_point = temp - ((100 - humidity) / 5)
            
            # Índice UV (mayor cerca del ecuador, en verano, con cielo despejado)
            uv_base = 11 - (abs_lat / 9)  # Más alto cerca del ecuador
            uv_seasonal = seasonal_factor * 2  # Más alto en verano
            uv_cloud_reduction = (cloud_cover / 100) * 5  # Nubes reducen UV
            uv_index = max(0, min(11, uv_base + uv_seasonal - uv_cloud_reduction))
            
            # Sensación térmica (wind chill o heat index)
            if temp < 10 and wind_speed > 5:
                # Wind chill
                feels_like = temp - (wind_speed * 0.5)
            elif temp > 27 and humidity > 40:
                # Heat index simplificado
                feels_like = temp + (humidity - 40) * 0.2
            else:
                feels_like = temp
            
            data.append({
                "year": year,
                "temperatureC": round(temp, 1),
                "humidity": round(humidity, 1),
                "windSpeed": round(wind_speed, 1),
                "windDirection": round(wind_dir, 1),
                "precipitation": round(precipitation, 1),
                "cloudCover": round(cloud_cover, 1),
                "pressure": round(pressure, 1),
                "dewPoint": round(dew_point, 1),
                "uvIndex": round(uv_index, 1),
                "feelsLike": round(feels_like, 1)
            })
        
        return pd.DataFrame(data)
