#!/usr/bin/env python3
"""
Script para configurar autenticación NASA EarthData en .netrc
"""
import os
from pathlib import Path

def setup_netrc(username: str, password: str):
    """
    Crea o actualiza el archivo .netrc para autenticación con NASA EarthData.
    """
    netrc_path = Path.home() / '.netrc'
    urs_host = 'urs.earthdata.nasa.gov'
    
    # Leer contenido existente si existe
    existing_content = ''
    if netrc_path.exists():
        with open(netrc_path, 'r') as f:
            existing_content = f.read()
    
    # Verificar si ya existe entrada para NASA
    if urs_host in existing_content:
        print(f"⚠️  Entrada para {urs_host} ya existe en .netrc")
        response = input("¿Deseas actualizarla? (s/n): ")
        if response.lower() != 's':
            print("Operación cancelada")
            return
        
        # Remover entrada antigua
        lines = existing_content.split('\n')
        new_lines = []
        skip = False
        for line in lines:
            if urs_host in line:
                skip = True
            elif skip and line.strip() and not line.startswith(' '):
                skip = False
            if not skip:
                new_lines.append(line)
        existing_content = '\n'.join(new_lines).strip()
    
    # Agregar nueva entrada
    netrc_entry = f"""
machine {urs_host}
    login {username}
    password {password}
"""
    
    with open(netrc_path, 'w') as f:
        if existing_content:
            f.write(existing_content + '\n')
        f.write(netrc_entry)
    
    # Establecer permisos correctos (requerido por .netrc)
    os.chmod(netrc_path, 0o600)
    
    print(f"✓ Archivo .netrc configurado en: {netrc_path}")
    print(f"✓ Usuario: {username}")
    print(f"✓ Permisos establecidos a 600")

if __name__ == '__main__':
    from dotenv import load_dotenv
    
    # Cargar variables de entorno
    env_path = Path(__file__).parent / '.env'
    load_dotenv(env_path)
    
    username = os.getenv('EARTHDATA_USERNAME')
    password = os.getenv('EARTHDATA_PASSWORD')
    
    if not username or not password:
        print("❌ Error: EARTHDATA_USERNAME y EARTHDATA_PASSWORD deben estar en .env")
        exit(1)
    
    print("🔐 Configurando autenticación NASA EarthData...")
    print(f"Usuario: {username}")
    
    setup_netrc(username, password)
    
    print("\n✓ Configuración completada!")
    print("Ahora puedes acceder a datos de NASA MERRA-2 via OPeNDAP")
