@echo off
REM ============================================================================
REM Maintly — launcher para Windows
REM Doble click en este archivo para arrancar la app
REM ============================================================================

REM Cambiar al directorio del script
cd /d "%~dp0"

cls
echo.
echo =================================================
echo   Maintly - Iniciando la app
echo =================================================
echo.

REM ----------------------------------------------------------------------------
REM 1. Verificar que Node.js este instalado
REM ----------------------------------------------------------------------------
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo [X] Node.js no esta instalado.
  echo.
  echo Para usar Maintly necesitas Node.js 20 o superior.
  echo Instalalo desde: https://nodejs.org
  echo.
  echo Voy a abrir la pagina ahora...
  timeout /t 2 /nobreak >nul
  start https://nodejs.org/es/download
  echo.
  echo Despues de instalarlo, volve a hacer doble click en este archivo.
  echo.
  pause
  exit /b 1
)

REM Check Node version
for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
echo [OK] Node.js %NODE_VER% detectado

REM ----------------------------------------------------------------------------
REM 2. Instalar dependencias si es la primera vez
REM ----------------------------------------------------------------------------
if not exist "node_modules" (
  echo.
  echo Primera vez. Instalando dependencias...
  echo Esto tarda 1-2 minutos. No cierres esta ventana.
  echo.
  call npm install
  if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [X] Fallo la instalacion.
    echo Mandame screenshot del mensaje de arriba.
    echo.
    pause
    exit /b 1
  )
  echo.
  echo [OK] Listo, todo instalado
)

REM ----------------------------------------------------------------------------
REM 3. Abrir el navegador en 4 segundos (paralelo al server)
REM ----------------------------------------------------------------------------
start /b cmd /c "timeout /t 4 /nobreak >nul && start http://localhost:3000"

REM ----------------------------------------------------------------------------
REM 4. Levantar el server
REM ----------------------------------------------------------------------------
echo.
echo =================================================
echo   Maintly corriendo en http://localhost:3000
echo =================================================
echo.
echo Para CERRAR la app: presiona Ctrl+C en esta ventana
echo (o simplemente cierra la ventana)
echo.

call npm run dev
