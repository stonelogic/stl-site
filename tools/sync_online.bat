@echo off
rem 在线名单定时同步：RCON 读名单 -> 写 online.json -> 只在有变化时提交推送
rem 每一步都记日志到 tools\sync.log，方便排查「任务显示成功但没推送」的情况
setlocal
cd /d "%~dp0.."
set PY=C:\Users\SJWJ\AppData\Local\Programs\Python\Python314\python.exe
if not exist "%PY%" set PY=python
set LOG=%~dp0sync.log

rem 计划任务在后台跑，绝不能让 git 卡在等待输入上
set GIT_TERMINAL_PROMPT=0
set GCM_INTERACTIVE=never
echo [%date% %time%] 开始>>"%LOG%"

rem 日志超过 1MB 就重开，避免无限增长
if exist "%LOG%" (
  for %%A in ("%LOG%") do if %%~zA GTR 1048576 del "%LOG%"
)

"%PY%" "%~dp0export_online.py" >nul 2>&1
if errorlevel 1 (
  echo [%date% %time%] export_online.py 失败 errorlevel=%errorlevel%>>"%LOG%"
  exit /b 0
)

git add online.json >>"%LOG%" 2>&1
if errorlevel 1 (
  echo [%date% %time%] git add 失败>>"%LOG%"
  exit /b 0
)

git diff --cached --quiet
if not errorlevel 1 exit /b 0

git commit -q -m "chore: 在线名单自动同步" >>"%LOG%" 2>&1
if errorlevel 1 (
  echo [%date% %time%] git commit 失败>>"%LOG%"
  exit /b 0
)

git push -q origin master >>"%LOG%" 2>&1
if errorlevel 1 (
  echo [%date% %time%] git push 失败>>"%LOG%"
  exit /b 0
)

echo [%date% %time%] 已提交并推送>>"%LOG%"
exit /b 0
