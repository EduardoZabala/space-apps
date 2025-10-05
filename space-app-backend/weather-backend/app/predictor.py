"""
Lógica de predicción meteorológica basada en análisis estadístico de datos históricos.
"""
import numpy as np
import pandas as pd
from datetime import datetime
from typing import Tuple, List, Dict, Any
from app.utils import wind_deg_to_compass, calculate_heat_index, describe_conditions
from app.providers.base import WeatherDataProvider
import logging

logger = logging.getLogger(__name__)

def determine_weather_type(temp: float, humidity: float, precip: float, cloud_cover: float, wind_speed: float) -> str:
    """
    Determina el tipo de clima basado en las condiciones meteorológicas.
    """
    # Tormenta: lluvia intensa con viento fuerte
    if precip > 10 and wind_speed > 15:
        return "stormy"
    
    # Nieve: temperatura bajo cero con precipitación
    if temp < 2 and precip > 2:
        return "snowy"
    
    # Lluvia: precipitación significativa
    if precip > 5:
        return "rainy"
    
    # Niebla: humedad muy alta
    if humidity > 90:
        return "foggy"
    
    # Nublado: cobertura de nubes alta pero sin lluvia significativa
    if cloud_cover > 60:
        return "cloudy"
    
    # Soleado: poca cobertura de nubes
    return "sunny"

def predict_for_point(
    latitude: float,
    longitude: float,
    target_date: datetime,
    data_provider: WeatherDataProvider
) -> dict:
    """
    Genera una predicción meteorológica para un punto y fecha específicos
    usando datos históricos.
    """
    # Obtener datos históricos del proveedor con descarga paralela (10 años)
    historical_data = data_provider.fetch_historical_data(
        lat=latitude,
        lon=longitude,
        target_month=target_date.month,
        target_day=target_date.day,
        years_back=10  # Aumentado a 10 años con descarga paralela y caché
    )
    
    if historical_data.empty:
        raise ValueError("No se pudieron obtener datos históricos")
    
    df = historical_data
    
    # Análisis estadístico
    stats = {
        "temperature": {
            "mean": df["temperatureC"].mean(),
            "std": df["temperatureC"].std(),
            "min": df["temperatureC"].min(),
            "max": df["temperatureC"].max()
        },
        "humidity": {
            "mean": df["humidity"].mean(),
            "std": df["humidity"].std(),
            "min": df["humidity"].min(),
            "max": df["humidity"].max()
        },
        "wind_speed": {
            "mean": df["windSpeed"].mean(),
            "std": df["windSpeed"].std(),
            "min": df["windSpeed"].min(),
            "max": df["windSpeed"].max()
        },
        "precipitation": {
            "mean": df["precipitation"].mean(),
            "std": df["precipitation"].std(),
            "total": df["precipitation"].sum()
        },
        "cloud_cover": {
            "mean": df["cloudCover"].mean(),
            "std": df["cloudCover"].std()
        },
        "pressure": {
            "mean": df["pressure"].mean(),
            "std": df["pressure"].std()
        },
        "dew_point": {
            "mean": df["dewPoint"].mean(),
            "std": df["dewPoint"].std()
        },
        "uv_index": {
            "mean": df["uvIndex"].mean(),
            "std": df["uvIndex"].std()
        },
        "feels_like": {
            "mean": df["feelsLike"].mean(),
            "std": df["feelsLike"].std()
        }
    }
    
    # Predicción (media con variación aleatoria pequeña)
    predicted_temp = stats["temperature"]["mean"] + np.random.normal(0, stats["temperature"]["std"] * 0.3)
    predicted_humidity = stats["humidity"]["mean"] + np.random.normal(0, stats["humidity"]["std"] * 0.3)
    predicted_wind_speed = stats["wind_speed"]["mean"] + np.random.normal(0, stats["wind_speed"]["std"] * 0.3)
    predicted_wind_dir = df["windDirection"].mean()
    predicted_precip = max(0, stats["precipitation"]["mean"] + np.random.normal(0, stats["precipitation"]["std"] * 0.5))
    predicted_cloud_cover = stats["cloud_cover"]["mean"] + np.random.normal(0, stats["cloud_cover"]["std"] * 0.3)
    predicted_pressure = stats["pressure"]["mean"] + np.random.normal(0, stats["pressure"]["std"] * 0.3)
    predicted_dew_point = stats["dew_point"]["mean"] + np.random.normal(0, stats["dew_point"]["std"] * 0.3)
    predicted_uv_index = stats["uv_index"]["mean"] + np.random.normal(0, stats["uv_index"]["std"] * 0.3)
    predicted_feels_like = stats["feels_like"]["mean"] + np.random.normal(0, stats["feels_like"]["std"] * 0.3)
    
    # Asegurar rangos válidos
    predicted_temp = max(-50, min(60, predicted_temp))
    predicted_humidity = max(0, min(100, predicted_humidity))
    predicted_wind_speed = max(0, min(50, predicted_wind_speed))
    predicted_wind_dir = predicted_wind_dir % 360
    predicted_cloud_cover = max(0, min(100, predicted_cloud_cover))
    predicted_pressure = max(950, min(1050, predicted_pressure))
    predicted_uv_index = max(0, min(11, predicted_uv_index))
    
    # Determinar tipo de clima
    weather_type = determine_weather_type(
        predicted_temp,
        predicted_humidity,
        predicted_precip,
        predicted_cloud_cover,
        predicted_wind_speed
    )
    
    # Calcular probabilidades de lluvia y nieve
    rain_probability = min(100, (predicted_humidity - 30) * 1.5 + (predicted_precip * 10))
    rain_probability = max(0, rain_probability)
    
    snow_probability = 0
    if predicted_temp < 5:
        snow_probability = rain_probability * (5 - predicted_temp) / 5
        rain_probability -= snow_probability
    
    # Calcular índice de calor
    heat_index = calculate_heat_index(predicted_temp, predicted_humidity)
    
    # Calcular nivel de confianza basado en desviación estándar
    temp_confidence = max(0, 100 - (stats["temperature"]["std"] * 3))
    humid_confidence = max(0, 100 - (stats["humidity"]["std"] * 2))
    confidence_score = (temp_confidence + humid_confidence) / 2
    
    # Convertir datos históricos a lista de diccionarios con formato de fecha
    historical_records = []
    for _, row in df.iterrows():
        # Crear fecha formateada (año-mes-día)
        date_str = f"{int(row['year'])}-{target_date.month:02d}-{target_date.day:02d}"
        
        # Crear registro con todos los campos incluidos temp max/min y horas
        record = {
            "date": date_str,
            "temperatureC": float(row["temperatureC"]),
            "temperatureMax": float(row.get("temperatureMax", row["temperatureC"])),
            "temperatureMin": float(row.get("temperatureMin", row["temperatureC"])),
            "temperatureAvg": float(row.get("temperatureAvg", row["temperatureC"])),
            "hourMax": int(row.get("hourMax", 14)),
            "hourMin": int(row.get("hourMin", 6)),
            "humidity": float(row["humidity"]),
            "windSpeed": float(row["windSpeed"]),
            "windDirection": float(row["windDirection"]),
            "precipitation": float(row["precipitation"]),
            "cloudCover": float(row["cloudCover"]),
            "pressure": float(row["pressure"]),
            "dewPoint": float(row["dewPoint"]),
            "uvIndex": float(row["uvIndex"]),
            "feelsLike": float(row["feelsLike"])
        }
        historical_records.append(record)
    
    return {
        "prediction": {
            "temperatureC": round(predicted_temp, 1),
            "humidity": round(predicted_humidity, 1),
            "windSpeed": round(predicted_wind_speed, 1),
            "windDirection": round(predicted_wind_dir, 1),
            "windCompass": wind_deg_to_compass(predicted_wind_dir),
            "precipitation": round(predicted_precip, 1),
            "heatIndex": round(heat_index, 1),
            "conditions": describe_conditions(predicted_temp, predicted_humidity, predicted_wind_speed),
            "weatherType": weather_type,
            "cloudCover": round(predicted_cloud_cover, 1),
            "pressure": round(predicted_pressure, 1),
            "dewPoint": round(predicted_dew_point, 1),
            "uvIndex": round(predicted_uv_index, 1),
            "feelsLike": round(predicted_feels_like, 1),
            "rainProbability": round(rain_probability, 1),
            "snowProbability": round(snow_probability, 1)
        },
        "confidence": round(confidence_score, 1),
        "historicalData": historical_records,
        "statistics": {
            "temperature": {k: round(v, 2) for k, v in stats["temperature"].items()},
            "humidity": {k: round(v, 2) for k, v in stats["humidity"].items()},
            "windSpeed": {k: round(v, 2) for k, v in stats["wind_speed"].items()},
            "precipitation": {k: round(v, 2) for k, v in stats["precipitation"].items()}
        }
    }


def generate_trend_analysis(
    years: List[int],
    temps: List[float],
    t_mean: float,
    t_std: float,
    h_mean: float,
    w_mean: float,
    precip_mean: float
) -> str:
    """
    Genera texto de análisis de tendencias basado en los datos históricos.
    """
    # Calcular tendencia lineal simple
    if len(years) > 1:
        z = np.polyfit(years, temps, 1)
        trend_slope = z[0]
        
        if trend_slope > 0.1:
            trend_desc = f"Se observa una tendencia al calentamiento de aproximadamente {abs(trend_slope):.2f}°C por año."
        elif trend_slope < -0.1:
            trend_desc = f"Se observa una tendencia al enfriamiento de aproximadamente {abs(trend_slope):.2f}°C por año."
        else:
            trend_desc = "La temperatura se ha mantenido relativamente estable."
    else:
        trend_desc = "Datos insuficientes para determinar tendencia."
    
    precip_prob = min(int((precip_mean / 5) * 100), 100) if precip_mean > 0 else 10
    
    analysis = (
        f"Basado en el análisis de los últimos {len(years)} años, se observa un patrón consistente para esta fecha. "
        f"La temperatura promedio histórica es de {t_mean:.1f}°C con una desviación estándar de {t_std:.1f}°C. "
        f"{trend_desc} "
        f"La humedad tiende a ser {'alta' if h_mean > 70 else 'moderada' if h_mean > 50 else 'baja'} (promedio {h_mean:.1f}%) "
        f"y existe una probabilidad del {precip_prob}% de precipitación basada en datos históricos. "
        f"Los vientos predominantes tienen una velocidad media de {w_mean:.1f} m/s."
    )
    
    return analysis


def generate_notes(lat: float, lon: float, data_points: int, confidence: float) -> str:
    """
    Genera notas explicativas sobre la predicción.
    """
    notes = (
        f"Esta predicción se generó utilizando algoritmos de análisis estadístico que evalúan patrones históricos. "
        f"Se analizaron {data_points} puntos de datos para las coordenadas (Lat: {lat:.2f}, Lon: {lon:.2f}). "
        f"El nivel de confianza de {confidence}% refleja la consistencia de los datos históricos. "
        f"Se recomienda verificar pronósticos actualizados más cerca de la fecha objetivo. "
        f"Los datos históricos provienen de estaciones meteorológicas en un radio de 50km de las coordenadas especificadas."
    )
    
    return notes
