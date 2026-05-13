#!/bin/bash
# ============================================================================
# Maintly — launcher para Mac y Linux
# Doble click en este archivo para arrancar la app
# ============================================================================

# Cambiar al directorio del script (importante en Mac cuando se hace doble click)
cd "$(dirname "$0")"

# Colores para que se vea bien en la terminal
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

clear
echo ""
echo -e "${BLUE}=================================================${NC}"
echo -e "${BLUE}  Maintly — Iniciando la app                      ${NC}"
echo -e "${BLUE}=================================================${NC}"
echo ""

# ----------------------------------------------------------------------------
# 1. Verificar que Node.js esté instalado
# ----------------------------------------------------------------------------
if ! command -v node &> /dev/null; then
  echo -e "${RED}✗ Node.js no está instalado.${NC}"
  echo ""
  echo "Para usar Maintly necesitás Node.js 20 o superior."
  echo "Instalalo desde: https://nodejs.org"
  echo ""
  echo "Voy a abrir la página ahora..."
  sleep 2
  if command -v open &> /dev/null; then
    open "https://nodejs.org/es/download"  # Mac
  elif command -v xdg-open &> /dev/null; then
    xdg-open "https://nodejs.org/es/download"  # Linux
  fi
  echo ""
  echo "Después de instalarlo, volvé a hacer doble click en este archivo."
  echo ""
  read -p "Presioná ENTER para cerrar esta ventana..."
  exit 1
fi

NODE_VERSION=$(node --version | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  echo -e "${RED}✗ Tu versión de Node.js es muy vieja (v$(node --version))${NC}"
  echo "Maintly necesita Node.js 20 o superior."
  echo "Actualizá desde: https://nodejs.org"
  echo ""
  read -p "Presioná ENTER para cerrar esta ventana..."
  exit 1
fi

echo -e "${GREEN}✓ Node.js $(node --version) detectado${NC}"

# ----------------------------------------------------------------------------
# 2. Instalar dependencias si es la primera vez
# ----------------------------------------------------------------------------
if [ ! -d "node_modules" ]; then
  echo ""
  echo -e "${YELLOW}Primera vez. Instalando dependencias…${NC}"
  echo "Esto tarda 1-2 minutos. No cierres esta ventana."
  echo ""
  npm install
  if [ $? -ne 0 ]; then
    echo ""
    echo -e "${RED}✗ Falló la instalación.${NC}"
    echo "Mandame screenshot del mensaje de arriba."
    echo ""
    read -p "Presioná ENTER para cerrar..."
    exit 1
  fi
  echo ""
  echo -e "${GREEN}✓ Listo, todo instalado${NC}"
fi

# ----------------------------------------------------------------------------
# 3. Abrir el navegador en 3 segundos (en paralelo al server)
# ----------------------------------------------------------------------------
(
  sleep 4
  if command -v open &> /dev/null; then
    open "http://localhost:3000"  # Mac
  elif command -v xdg-open &> /dev/null; then
    xdg-open "http://localhost:3000"  # Linux
  fi
) &

# ----------------------------------------------------------------------------
# 4. Levantar el server
# ----------------------------------------------------------------------------
echo ""
echo -e "${BLUE}=================================================${NC}"
echo -e "${GREEN}  Maintly corriendo en http://localhost:3000${NC}"
echo -e "${BLUE}=================================================${NC}"
echo ""
echo "Para CERRAR la app: presioná Ctrl+C en esta ventana"
echo "(o simplemente cerrá la ventana de terminal)"
echo ""

npm run dev
