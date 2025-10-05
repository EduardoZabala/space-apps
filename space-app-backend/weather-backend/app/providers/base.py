"""
Interfaz base para proveedores de datos históricos meteorológicos.
"""
from abc import ABC, abstractmethod
from typing import List, Tuple
import pandas as pd

class WeatherDataProvider(ABC):
    """
    Interfaz abstracta para proveedores de datos meteorológicos.
    Permite intercambiar entre fuentes de datos (mock, OPeNDAP, etc.)
    """
    
    @abstractmethod
    def fetch_historical_data(
        self,
        lat: float,
        lon: float,
        target_month: int,
        target_day: int,
        years_back: int = 10
    ) -> pd.DataFrame:
        """
        Obtiene datos históricos para un punto y fecha específicos.
        
        Args:
            lat: Latitud del punto
            lon: Longitud del punto
            target_month: Mes objetivo (1-12)
            target_day: Día objetivo (1-31)
            years_back: Número de años históricos a consultar
            
        Returns:
            DataFrame con columnas:
                - year: int
                - temperatureC: float
                - humidity: float
                - windSpeed: float
                - windDirection: float (grados)
                - precipitation: float
        """
        pass
