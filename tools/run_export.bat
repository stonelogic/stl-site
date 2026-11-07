@echo off
setlocal
cd /d %~dp0
set PY=C:\Users\SJWJ\AppData\Local\Programs\Python\Python314\python.exe
if not exist "%PY%" set PY=python

echo [1/4] 在线时长
"%PY%" "%~dp0export_playtime.py"
echo.
echo [2/4] 起床战争
"%PY%" "%~dp0export_bedwars.py"
echo.
echo [3/4] 玩家头像
"%PY%" "%~dp0export_avatars.py"
echo.
echo [4/4] 在线名单
"%PY%" "%~dp0export_online.py"
echo.
echo exit_code=%errorlevel%
pause
