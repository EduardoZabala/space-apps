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
    Genera descripción textual de las condiciones meteorológicas.
    """
    conditions = []
    
    # Temperatura
    if temp < 10:
        conditions.append("Frío")
    elif temp < 20:
        conditions.append("Templado")
    elif temp < 30:
        conditions.append("Cálido")
    else:
        conditions.append("Caluroso")
    
    # Precipitación
    if precip > 5:
        conditions.append("lluvioso")
    elif precip > 1:
        conditions.append("con llovizna")
    elif humidity > 80:
        conditions.append("muy húmedo")
    elif humidity > 60:
        conditions.append("húmedo")
    else:
        conditions.append("seco")
    
    # Nubosidad (basado en humedad como proxy)
    if humidity > 80:
        conditions.append("nublado")
    elif humidity > 60:
        conditions.append("parcialmente nublado")
    else:
        conditions.append("despejado")
    
    return ", ".join(conditions).capitalize()

def describe_precipitation(precip_mean: float, precip_max: float) -> str:
    """
    Describe la probabilidad y cantidad de precipitación.
    """
    if precip_mean < 0.5:
        return "Baja probabilidad (< 20%)"
    elif precip_mean < 2:
        return "Moderada probabilidad (~40%)"
    elif precip_mean < 5:
        return "Alta probabilidad (~60%)"
    else:
        return f"Muy alta probabilidad (~80%), precipitación esperada: {precip_mean:.1f}mm"

def describe_visibility(humidity: float, precip: float) -> str:
    """
    Estima visibilidad basada en humedad y precipitación.
    """
    if precip > 5:
        return "Reducida (2-5 km)"
    elif humidity > 90:
        return "Moderada (5-8 km)"
    elif humidity > 70:
        return "Buena (8-10 km)"
    else:
        return "Excelente (> 10 km)"
