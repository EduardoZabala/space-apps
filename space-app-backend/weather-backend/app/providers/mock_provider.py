"""
Proveedor de datos sintéticos para desarrollo y pruebas.
"""
import numpy as np
import pandas as pd
from .base import WeatherDataProvider

class MockProvider(WeatherDataProvider):
    """
    Genera datos meteorológicos sintéticos pero realistas.
    Útil para desarrollo sin necesidad de datos reales de NASA.
    """
    
    def fetch_historical_data(
        self,
        lat: float,
        lon: float,
        target_month: int,
        target_day: int,
        years_back: int = 10
    ) -> pd.DataFrame:
        """
        Genera datos sintéticos basados en patrones estacionales.
        """
        np.random.seed(int(abs(lat * 1000 + lon * 100)))  # Seed basado en ubicación
        
        current_year = 2024
        years = list(range(current_year - years_back, current_year))
        
        # Patrón base según mes (simulando estaciones)
        base_temp = 15 + 10 * np.sin(2 * np.pi * (target_month - 3) / 12)
        base_humidity = 60 + 20 * np.cos(2 * np.pi * (target_month - 6) / 12)
        
        data = []
        for year in years:
            # Variabilidad año a año
            temp_variation = np.random.normal(0, 3)
            humidity_variation = np.random.normal(0, 10)
            
            temp = base_temp + temp_variation + (lat / 10)  # Ajuste por latitud
            humidity = max(20, min(100, base_humidity + humidity_variation))
            wind_speed = abs(np.random.normal(8, 3))
            wind_dir = np.random.uniform(0, 360)
            precip = max(0, np.random.exponential(2) if humidity > 70 else np.random.exponential(0.5))
            
            data.append({
                "year": year,
                "temperatureC": round(temp, 1),
                "humidity": round(humidity, 1),
                "windSpeed": round(wind_speed, 1),
                "windDirection": round(wind_dir, 1),
                "precipitation": round(precip, 1)
            })
        
        return pd.DataFrame(data)
