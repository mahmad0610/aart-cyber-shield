@echo off
setlocal
set "BACKEND_PATH=%~dp0AARTv1"

echo ─────────────────────────────────────────────────────────
echo [AART] INTEGRATED SECURITY LAB LAUNCHER
echo ─────────────────────────────────────────────────────────

:: Start Backend
echo 🚀 Launching Backend API (Port 8000)...
start "AART Backend" cmd /k "cd /d %BACKEND_PATH% && .venv\Scripts\python -m uvicorn backend.api.app:app --reload --port 8000"

:: Start Tunnel
echo 🔌 Launching Secure Tunnel (Cloudflare)...
start "AART Tunnel" cmd /k "cd /d %~dp0 && npx -y cloudflared tunnel --url http://localhost:8000"

echo ─────────────────────────────────────────────────────────
echo ✅ System is booting.
echo 🌐 Backend: http://localhost:8000
echo 🔗 Tunnel:  (Look for .trycloudflare.com in the Tunnel window)
echo ─────────────────────────────────────────────────────────
pause
