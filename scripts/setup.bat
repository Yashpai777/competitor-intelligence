@echo off
echo =================================================
echo   Competitor Intelligence Dashboard - Setup
echo =================================================

:: Check Node
where node >nul 2>&1 || (echo Node.js is required. Please install from nodejs.org && exit /b 1)
where npm >nul 2>&1 || (echo npm is required. && exit /b 1)
where docker >nul 2>&1 || (echo Docker is required. Please install Docker Desktop. && exit /b 1)

echo.
echo Copying .env file...
if not exist .env (
    copy .env.example .env
    echo Created .env file - please configure your API keys
) else (
    echo .env file already exists
)

echo.
echo Installing dependencies...
npm install

echo.
echo Starting Docker infrastructure...
docker compose -f docker-compose.dev.yml up -d

echo.
echo Waiting for PostgreSQL...
timeout /t 8 /nobreak >nul

echo.
echo Setting up database...
cd packages\database
call npm run db:generate
call npm run db:push
call npm run db:seed
cd ..\..

echo.
echo =================================================
echo   Setup Complete!
echo =================================================
echo.
echo   Start with: npm run dev
echo.
echo   Frontend:   http://localhost:3000
echo   API:        http://localhost:3001
echo   API Docs:   http://localhost:3001/api/docs
echo =================================================
pause
