@echo off
rem 定时导出排行榜数据（在线时长 / 起床战争）并推送到 GitHub Pages
rem 头像导出（export_avatars.py）故意不放进来：它要联网下载皮肤，皮肤很少变，手动跑就够
rem sync_rank.log 记 bat 自己的时间戳与成败（GBK）；sync_rank.out.log 存 python 的原始输出（UTF-8）
setlocal
cd /d "%~dp0.."

set "PY=C:\Users\SJWJ\AppData\Local\Programs\Python\Python314\python.exe"
if not exist "%PY%" set "PY=python"

set "LOG=%~dp0sync_rank.log"
set "OUT=%~dp0sync_rank.out.log"

rem 计划任务的环境里没有 git（git 来自便携版 PortableGit，只有交互会话才有那个 PATH）
if exist "D:\服务端正式\tools\PortableGit\cmd\git.exe" set "PATH=D:\服务端正式\tools\PortableGit\cmd;%PATH%"
if exist "C:\Program Files\Git\cmd\git.exe" set "PATH=C:\Program Files\Git\cmd;%PATH%"
if exist "D:\workbuddy\resources\vendor\PortableGit\cmd\git.exe" set "PATH=D:\workbuddy\resources\vendor\PortableGit\cmd;%PATH%"

rem 无人值守：禁止 git 弹窗等待凭据输入
set "GIT_TERMINAL_PROMPT=0"
set "GCM_INTERACTIVE=never"

if exist "%LOG%" for %%A in ("%LOG%") do if %%~zA GTR 262144 del "%LOG%"
if exist "%OUT%" for %%A in ("%OUT%") do if %%~zA GTR 1048576 del "%OUT%"

echo [%date% %time%] 开始>>"%LOG%"

where git >nul 2>&1
if errorlevel 1 (
  echo [%date% %time%] 找不到 git，跳过推送>>"%LOG%"
  exit /b 0
)

"%PY%" "%~dp0export_playtime.py" >>"%OUT%" 2>&1
if errorlevel 1 echo [%date% %time%] export_playtime.py 失败（读不到 cyutime 数据库）>>"%LOG%"

"%PY%" "%~dp0export_bedwars.py" >>"%OUT%" 2>&1
if errorlevel 1 echo [%date% %time%] export_bedwars.py 失败（读不到 BedWars 统计文件）>>"%LOG%"

echo [%date% %time%] 完成>>"%LOG%"
exit /b 0
