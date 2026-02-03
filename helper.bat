@echo off
REM GoalRemind Helper Script for Windows
REM This script provides shortcuts for common tasks

title GoalRemind Helper

:menu
cls
echo ========================================
echo    GoalRemind Helper Script
echo ========================================
echo.
echo Select an option:
echo.
echo 1. Install dependencies
echo 2. Setup environment (generate keys)
echo 3. Setup database
echo 4. Run development server
echo 5. Build for production
echo 6. Start production server
echo 7. Generate database migrations
echo 8. Open database studio
echo 9. Backup database
echo 0. Exit
echo.

set /p choice="Enter your choice [0-9]: "

if "%choice%"=="1" goto install
if "%choice%"=="2" goto setup_env
if "%choice%"=="3" goto setup_db
if "%choice%"=="4" goto run_dev
if "%choice%"=="5" goto build
if "%choice%"=="6" goto start_prod
if "%choice%"=="7" goto gen_migrations
if "%choice%"=="8" goto studio
if "%choice%"=="9" goto backup
if "%choice%"=="0" goto end

echo Invalid option. Please try again.
pause
goto menu

:install
echo.
echo Installing dependencies...
call npm install
echo.
echo Dependencies installed!
pause
goto menu

:setup_env
echo.
echo Generating VAPID keys...
call npx tsx scripts/generate-vapid-keys.ts
echo.
echo Generating Job API secret...
call npx tsx scripts/generate-job-secret.ts
echo.
echo Don't forget to copy these values to your .env.local file!
pause
goto menu

:setup_db
echo.
echo Setting up database...
echo Generating migrations...
call npm run db:generate
echo Running migrations...
call npm run db:migrate
echo.
echo Database setup complete!
pause
goto menu

:run_dev
echo.
echo Starting development server...
call npm run dev
pause
goto menu

:build
echo.
echo Building for production...
call npm run build
echo.
echo Build complete!
pause
goto menu

:start_prod
echo.
echo Starting production server...
call npm start
pause
goto menu

:gen_migrations
echo.
echo Generating database migrations...
call npm run db:generate
echo.
echo Migrations generated!
pause
goto menu

:studio
echo.
echo Opening Drizzle Studio...
call npm run db:studio
pause
goto menu

:backup
echo.
set TIMESTAMP=%date:~-4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set BACKUP_FILE=.\data\goalremind.db.backup_%TIMESTAMP%

if exist ".\data\goalremind.db" (
    echo Backing up database...
    copy ".\data\goalremind.db" "%BACKUP_FILE%"
    echo.
    echo Database backed up to: %BACKUP_FILE%
) else (
    echo Database file not found!
)
pause
goto menu

:end
echo.
echo Goodbye!
exit
