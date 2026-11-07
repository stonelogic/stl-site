@echo off
setlocal
cd /d %~dp0
"C:/Users/SJWJ/AppData/Local/Programs/Python/Python314/python.exe" "%~dp0export_playtime.py"
echo.
echo exit_code=%errorlevel%
pause
