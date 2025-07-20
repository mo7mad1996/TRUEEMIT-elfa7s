@echo off
echo Starting deployment process...

REM Check if .env.pro exists before renaming
if exist .env.pro (
    echo Found .env.pro, renaming to .env...
    rename .env.pro .env
    if errorlevel 1 (
        echo Error: Failed to rename .env.pro to .env
        pause
        exit /b 1
    )
    echo Successfully renamed .env.pro to .env
) else (
    echo .env.pro not found, skipping rename step
)

echo Installing dependencies...
npm install && npm run build && node remove.js && start.bat


pause