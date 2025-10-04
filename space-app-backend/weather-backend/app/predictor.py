"""
Lógica de predicción meteorológica basada en análisis estadístico de datos históricos.
"""
import numpy as np
import pandas as pd
from typing import Tuple, List, Dict, Any
from .providers.base import WeatherDataProvider
from .utils import (
    wind_deg_to_compass,
    describe_conditions,
    describe_precipitation,
    describe_visibility
)

def predict_for_point(
    provider: WeatherDataProvider,
    lat: float,
    lon: float,
    target_date_str: str
) -> Tuple[Dict[str, Any], List[Dict[str, Any]], str, str, int, int]:
    """
    Genera predicción meteorológica para un punto y fecha específicos.
    
    Args:
        provider: Proveedor de datos históricos
        lat: Latitud
        lon: Longitud
        target_date_str: Fecha objetivo en formato "YYYY-MM-DD"
        
    Returns:
        Tupla con:
        - prediction: Dict con la predicción y rangos
        - historical_rows: Lista de datos históricos
        - trend_text: Texto de análisis de tendencias
        - notes: Notas adicionales
        - years_analyzed: Número de años analizados
        - data_points: Número de puntos de datos
    """
    import datetime as dt
    
    # Parsear fecha objetivo
    target_date = dt.date.fromisoformat(target_date_str)
    target_month = target_date.month
    target_day = target_date.day
    
    # Obtener datos históricos
    df = provider.fetch_historical_data(
        lat=lat,
        lon=lon,
        target_month=target_month,
        target_day=target_day,
        years_back=10
    )
    
    if df.empty:
        raise ValueError("No se encontraron datos históricos para esta ubicación")
    
    # Estadísticas de temperatura
    t_mean = df["temperatureC"].mean()
    t_std = df["temperatureC"].std()
    t_min = df["temperatureC"].min()
    t_max = df["temperatureC"].max()
    
    # Estadísticas de humedad
    h_mean = df["humidity"].mean()
    h_std = df["humidity"].std()
    h_min = df["humidity"].min()
    h_max = df["humidity"].max()
    
    # Estadísticas de viento
    w_mean = df["windSpeed"].mean()
    w_std = df["windSpeed"].std()
    w_min = df["windSpeed"].min()
    w_max = df["windSpeed"].max()
    
    # Dirección de viento predominante
    wind_dir = df["windDirection"].mean()
    
    # Precipitación
    precip_mean = df["precipitation"].mean() if "precipitation" in df.columns else 0
    precip_max = df["precipitation"].max() if "precipitation" in df.columns else 0
    
    # Calcular confianza basada en:
    # 1. Cantidad de datos
    # 2. Consistencia (menor desviación estándar = mayor confianza)
    data_quality = min(len(df) / 10, 1.0)  # Máximo con 10 años
    temp_consistency = max(0, 1 - (t_std / 10))  # Penalizar alta variabilidad
    humidity_consistency = max(0, 1 - (h_std / 20))
    
    confidence = round((data_quality * 0.4 + temp_consistency * 0.3 + humidity_consistency * 0.3) * 100, 1)
    
    # Generar descripciones textuales
    cond_text = describe_conditions(t_mean, h_mean, precip_mean)
    precip_text = describe_precipitation(precip_mean, precip_max)
    vis_text = describe_visibility(h_mean, precip_mean)
    
    # Crear respuesta de predicción
    response = {
        "temperatureC": round(t_mean, 1),
        "temperatureMin": round(t_min, 1),
        "temperatureMax": round(t_max, 1),
        "humidity": round(h_mean, 1),
        "humidityMin": round(h_min, 1),
        "humidityMax": round(h_max, 1),
        "windSpeed": round(w_mean, 1),
        "windSpeedMin": round(w_min, 1),
        "windSpeedMax": round(w_max, 1),
        "windDirection": wind_deg_to_compass(wind_dir),
        "conditions": cond_text,
        "precipitation": precip_text,
        "visibility": vis_text,
        "confidence": confidence
    }
    
    # Convertir datos históricos a formato de respuesta
    historical_rows = []
    for _, row in df.iterrows():
        historical_rows.append({
            "year": int(row["year"]),
            "temperatureC": round(row["temperatureC"], 1),
            "humidity": round(row["humidity"], 1),
            "windSpeed": round(row["windSpeed"], 1),
            "conditions": describe_conditions(
                row["temperatureC"],
                row["humidity"],
                row.get("precipitation", 0)
            )
        })
    
    # Análisis de tendencias
    years = df["year"].tolist()
    temps = df["temperatureC"].tolist()
    
    trend_text = generate_trend_analysis(years, temps, t_mean, t_std, h_mean, w_mean, precip_mean)
    
    # Notas
    notes = generate_notes(lat, lon, len(df), confidence)
    
    return response, historical_rows, trend_text, notes, len(years), len(df)


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
