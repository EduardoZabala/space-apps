"""
Utilidades para cálculos meteorológicos.
"""
import numpy as np

def wind_deg_to_compass(deg: float) -> str:
    """
    Convierte grados de dirección del viento a punto cardinal.
    
    Args:
        deg: Dirección en grados (0-360)
        
    Returns:
        Punto cardinal (N, NE, E, SE, S, SW, W, NW)
    """
    directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
    idx = int((deg + 22.5) / 45) % 8
    return directions[idx]

def calculate_heat_index(temp_c: float, humidity: float) -> float:
    """
    Calcula el índice de calor (sensación térmica por humedad).
    
    Args:
        temp_c: Temperatura en Celsius
        humidity: Humedad relativa (0-100)
        
    Returns:
        Índice de calor en Celsius
    """
    # Convertir a Fahrenheit para la fórmula
    temp_f = temp_c * 9/5 + 32
    
    # Fórmula simplificada del heat index
    if temp_f < 80 or humidity < 40:
        return temp_c
    
    hi = -42.379 + 2.04901523 * temp_f + 10.14333127 * humidity
    hi += -0.22475541 * temp_f * humidity
    hi += -0.00683783 * temp_f * temp_f
    hi += -0.05481717 * humidity * humidity
    hi += 0.00122874 * temp_f * temp_f * humidity
    hi += 0.00085282 * temp_f * humidity * humidity
    hi += -0.00000199 * temp_f * temp_f * humidity * humidity
    
    # Convertir de vuelta a Celsius
    return (hi - 32) * 5/9

def describe_conditions(temp: float, humidity: float, precip: float) -> str:
    """
    Generates textual description of weather conditions.
    """
    conditions = []
    
    # Temperature
    if temp < 10:
        conditions.append("Cold")
    elif temp < 20:
        conditions.append("Mild")
    elif temp < 30:
        conditions.append("Warm")
    else:
        conditions.append("Hot")
    
    # Precipitation
    if precip > 5:
        conditions.append("rainy")
    elif precip > 1:
        conditions.append("with drizzle")
    elif humidity > 80:
        conditions.append("very humid")
    elif humidity > 60:
        conditions.append("humid")
    else:
        conditions.append("dry")
    
    # Cloudiness (based on humidity as proxy)
    if humidity > 80:
        conditions.append("cloudy")
    elif humidity > 60:
        conditions.append("partly cloudy")
    else:
        conditions.append("clear")
    
    return ", ".join(conditions).capitalize()

def describe_precipitation(precip_mean: float, precip_max: float) -> str:
    """
    Describes precipitation probability and amount.
    """
    if precip_mean < 0.5:
        return "Low probability (< 20%)"
    elif precip_mean < 2:
        return "Moderate probability (~40%)"
    elif precip_mean < 5:
        return "High probability (~60%)"
    else:
        return f"Very high probability (~80%), expected precipitation: {precip_mean:.1f}mm"

def describe_visibility(humidity: float, precip: float) -> str:
    """
    Estimates visibility based on humidity and precipitation.
    """
    if precip > 5:
        return "Reduced (2-5 km)"
    elif humidity > 90:
        return "Moderate (5-8 km)"
    elif humidity > 70:
        return "Good (8-10 km)"
    else:
        return "Excellent (> 10 km)"
