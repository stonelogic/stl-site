@echo off
setlocal
cd /d "%~dp0.."

set "PY=C:\Users\SJWJ\AppData\Local\Programs\Python\Python314\python.exe"
if not exist "%PY%" set "PY=python"
set "LOG=%~dp0sync_forum.log"
set "GIT_TERMINAL_PROMPT=0"
set "GCM_INTERACTIVE=never"

if exist "D:\服务端正式\tools\PortableGit\cmd\git.exe" set "PATH=D:\服务端正式\tools\PortableGit\cmd;%PATH%"
if exist "C:\Program Files\Git\cmd\git.exe" set "PATH=C:\Program Files\Git\cmd;%PATH%"
if exist "D:\workbuddy\resources\vendor\PortableGit\cmd\git.exe" set "PATH=D:\workbuddy\resources\vendor\PortableGit\cmd;%PATH%"

echo [%date% %time%] start>>"%LOG%"
where git >nul 2>&1
if errorlevel 1 ( echo [%date% %time%] git not found>>"%LOG%" & exit /b 0 )

git add forum.json>>"%LOG%" 2>&1
if errorlevel 1 ( echo [%date% %time%] git add fail>>"%LOG%" & exit /b 0 )
git diff --cached --quiet
if not errorlevel 1 exit /b 0
git commit -q -m "forum: sync posts">>"%LOG%" 2>&1
if errorlevel 1 ( echo [%date% %time%] git commit fail>>"%LOG%" & exit /b 0 )
git push -q origin master>>"%LOG%" 2>&1
if errorlevel 1 ( echo [%date% %time%] git push fail>>"%LOG%" & exit /b 0 )
echo [%date% %time%] pushed>>"%LOG%"
exit /b 0
