"""
Servicio de geocodificación inversa para convertir coordenadas en información de ubicación.
Utiliza OpenStreetMap Nominatim API (gratuita, sin API key requerida).
"""
import requests
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

class GeocodingService:
    """Servicio para geocodificación inversa usando OpenStreetMap Nominatim"""
    
    def __init__(self):
        self.base_url = "https://nominatim.openstreetmap.org"
        self.session = requests.Session()
        # User-Agent requerido por Nominatim
        self.session.headers.update({
            'User-Agent': 'WeatherPredictionAPI/1.0 (weather-app@example.com)'
        })
        
        # Mapeo de nombres de ciudades en español
        self.spanish_city_names = {
            'New York': 'Nueva York',
            'London': 'Londres', 
            'Paris': 'París',
            'Moscow': 'Moscú',
            'Beijing': 'Pekín',
            'Tokyo': 'Tokio',
            'Sydney': 'Sídney',
            'Rome': 'Roma',
            'Athens': 'Atenas',
            'Vienna': 'Viena',
            'Prague': 'Praga',
            'Warsaw': 'Varsovia',
        }
        
        # Mapeo de nombres de países en español
        self.spanish_country_names = {
            'United States': 'Estados Unidos',
            'United Kingdom': 'Reino Unido',
            'France': 'Francia',
            'Germany': 'Alemania',
            'Italy': 'Italia',
            'Spain': 'España',
            'Russia': 'Rusia',
            'China': 'China',
            'Japan': 'Japón',
            'Australia': 'Australia',
            'Brazil': 'Brasil',
            'Canada': 'Canadá',
        }
    
    def reverse_geocode(self, latitude: float, longitude: float) -> Optional[Dict[str, Any]]:
        """
        Realiza geocodificación inversa para obtener información de ubicación.
        
        Args:
            latitude: Latitud en grados decimales
            longitude: Longitud en grados decimales
            
        Returns:
            Dict con información de ubicación o None si falla
        """
        try:
            params = {
                'format': 'json',
                'lat': latitude,
                'lon': longitude,
                'zoom': 10,
                'addressdetails': 1,
                'accept-language': 'es,en',  # Preferir español, fallback a inglés
                'namedetails': 1
            }
            
            url = f"{self.base_url}/reverse"
            response = self.session.get(url, params=params, timeout=5)
            response.raise_for_status()
            
            data = response.json()
            
            if not data or 'address' not in data:
                logger.warning(f"No se encontró información para coordenadas {latitude}, {longitude}")
                return None
            
            # Extraer información relevante
            address = data.get('address', {})
            
            # Determinar ciudad - puede estar en diferentes campos
            city = (
                address.get('city') or 
                address.get('town') or 
                address.get('village') or 
                address.get('municipality') or
                address.get('suburb')
            )
            
            # Determinar estado/región
            state = (
                address.get('state') or
                address.get('province') or
                address.get('region')
            )
            
            # Limpiar y normalizar texto
            def clean_text(text):
                if not text:
                    return None
                # Asegurar que el texto esté en UTF-8 y sea legible
                try:
                    if isinstance(text, bytes):
                        text = text.decode('utf-8')
                    return text.strip()
                except:
                    return None
            
            # Traducir nombres a español si están disponibles
            def translate_to_spanish(text, mapping_dict):
                if not text:
                    return text
                cleaned = clean_text(text)
                return mapping_dict.get(cleaned, cleaned)
            
            result = {
                'city': translate_to_spanish(city, self.spanish_city_names),
                'state': clean_text(state),
                'country': translate_to_spanish(address.get('country'), self.spanish_country_names),
                'country_code': clean_text(address.get('country_code', '')).upper() if address.get('country_code') else None,
                'formatted_address': clean_text(data.get('display_name')),
                'raw_response': data  # Para debugging
            }
            
            logger.info(f"Geocodificación exitosa: {latitude}, {longitude} -> {city}, {state}, {result['country']}")
            return result
            
        except requests.exceptions.Timeout:
            logger.error(f"Timeout en geocodificación para {latitude}, {longitude}")
            return None
        except requests.exceptions.RequestException as e:
            logger.error(f"Error en solicitud de geocodificación: {e}")
            return None
        except Exception as e:
            logger.error(f"Error inesperado en geocodificación: {e}")
            return None
    
    def get_location_info(self, latitude: float, longitude: float) -> Dict[str, Optional[str]]:
        """
        Obtiene información de ubicación formateada para usar en LocationOut.
        
        Returns:
            Dict con campos compatibles con LocationOut schema
        """
        geocoded = self.reverse_geocode(latitude, longitude)
        
        if not geocoded:
            return {
                'name': f"Lat: {latitude:.2f}, Lon: {longitude:.2f}",
                'city': None,
                'state': None,
                'country': None,
                'formatted_address': None
            }
        
        # Crear nombre legible
        name_parts = []
        if geocoded['city']:
            name_parts.append(geocoded['city'])
        if geocoded['state']:
            name_parts.append(geocoded['state'])
        if geocoded['country']:
            name_parts.append(geocoded['country'])
        
        name = ", ".join(name_parts) if name_parts else f"Lat: {latitude:.2f}, Lon: {longitude:.2f}"
        
        return {
            'name': name,
            'city': geocoded['city'],
            'state': geocoded['state'], 
            'country': geocoded['country'],
            'formatted_address': geocoded['formatted_address']
        }

# Instancia global del servicio
geocoding_service = GeocodingService()