@echo off
rem 定时同步在线列表：RCON 玩家列表 -> 写 online.json -> 只在有变化时提交推送
rem 每次运行都记日志到 tools\sync.log，方便排查「显示成功但没推送」的问题
setlocal
cd /d "%~dp0.."

set "PY=C:\Users\SJWJ\AppData\Local\Programs\Python\Python314\python.exe"
if not exist "%PY%" set "PY=python"

set "LOG=%~dp0sync.log"

rem 计划任务的环境里没有 git（git 来自便携版 PortableGit，只有交互会话才有那个 PATH）
rem 所以把便携版目录挂到 PATH 最前面
if exist "D:\服务端正式\tools\PortableGit\cmd\git.exe" set "PATH=D:\服务端正式\tools\PortableGit\cmd;%PATH%"
if exist "C:\Program Files\Git\cmd\git.exe" set "PATH=C:\Program Files\Git\cmd;%PATH%"
if exist "D:\workbuddy\resources\vendor\PortableGit\cmd\git.exe" set "PATH=D:\workbuddy\resources\vendor\PortableGit\cmd;%PATH%"

rem 无人值守：禁止 git 弹窗等待凭据输入
set "GIT_TERMINAL_PROMPT=0"
set "GCM_INTERACTIVE=never"

rem 日志超过 1MB 先重建，避免无限增长
if exist "%LOG%" for %%A in ("%LOG%") do if %%~zA GTR 1048576 del "%LOG%"

echo [%date% %time%] 开始>>"%LOG%"

where git >nul 2>&1
if errorlevel 1 (
  echo [%date% %time%] 找不到 git，跳过推送>>"%LOG%"
  exit /b 0
)

"%PY%" "%~dp0export_online.py" >nul 2>&1
if errorlevel 1 (
  echo [%date% %time%] export_online.py 失败（RCON 连不上，服务端可能没启动）>>"%LOG%"
  exit /b 0
)

git add online.json >>"%LOG%" 2>&1
if errorlevel 1 (
  echo [%date% %time%] git add 失败>>"%LOG%"
  exit /b 0
)

git diff --cached --quiet
if not errorlevel 1 exit /b 0

git commit -q -m "chore: 在线列表自动同步" >>"%LOG%" 2>&1
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
