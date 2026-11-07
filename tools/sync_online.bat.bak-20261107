@echo off
rem 在线名单定时同步：RCON 读名单 -> 写 online.json -> 只在有变化时提交推送
setlocal
cd /d "%~dp0.."
set PY=C:\Users\SJWJ\AppData\Local\Programs\Python\Python314\python.exe
if not exist "%PY%" set PY=python

rem 计划任务在后台跑，绝不能让 git 卡在等待输入上
set GIT_TERMINAL_PROMPT=0
set GCM_INTERACTIVE=never

"%PY%" "%~dp0export_online.py" >nul 2>&1
if errorlevel 1 exit /b 0

git add online.json
git diff --cached --quiet
if not errorlevel 1 exit /b 0

git commit -q -m "chore: 在线名单自动同步"
git push -q origin master
exit /b 0
