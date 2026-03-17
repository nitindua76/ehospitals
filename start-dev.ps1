# Hospital Selection Development Startup Script

$rootPath = Get-Location
$backendDir = Join-Path $rootPath "backend"
$portalDir = Join-Path $rootPath "hospital-portal"
$adminDir = Join-Path $rootPath "admin-dashboard"

Write-Host "Starting Hospital Selection Development Environment..."

# 1. Environment file setup
if (!(Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "Created root .env from .env.example"
    }
}

# Fix MONGO_URI for local dev and ensure JWT_SECRET
if (Test-Path ".env") {
    $content = Get-Content ".env"
    # Replace docker hostname with localhost for local dev
    $content = $content -replace 'mongodb://mongodb:27017', 'mongodb://localhost:27017'
    
    # Ensure JWT_SECRET is not 'your_super_secret...' if it came from example
    $content = $content -replace 'your_super_secret_jwt_key_here_change_me', 'dev_secret_key_1234567890_local_only'
    
    $content | Set-Content (Join-Path $backendDir ".env") -Encoding utf8
    Write-Host "Configured and synced backend/.env for local development."
}

# 2. Database
Write-Host "Checking MongoDB Container..."

# Stop production mongo if it's running to avoid port conflict
if (docker ps -q -f name=hospital_mongodb) {
    Write-Host "Stopping conflicting production MongoDB container (hospital_mongodb)..." -ForegroundColor Yellow
    docker stop hospital_mongodb > $null
}

docker run -d -p 27017:27017 --name hospital_mongo_dev --restart unless-stopped mongo:7 2>$null
if ($LASTEXITCODE -ne 0) {
    docker start hospital_mongo_dev 2>$null
}
Write-Host "MongoDB is ready."

# 3. Dependencies
function Install-Deps($dir, $name) {
    if (!(Test-Path (Join-Path $dir "node_modules"))) {
        Write-Host "Installing $name dependencies..."
        Set-Location $dir
        npm install
        Set-Location $rootPath
    }
}

Install-Deps $backendDir "Backend"
Install-Deps $portalDir "Portal"
Install-Deps $adminDir "Admin"

# 4. Start services in new windows
Write-Host "Launching services..."
# Backend: Wait 2 seconds before seed to ensure Mongo is reachable
$backCmd = "Set-Location '$backendDir'; Start-Sleep -Seconds 2; npm run seed; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backCmd

$portCmd = "Set-Location '$portalDir'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $portCmd

$adminCmd = "Set-Location '$adminDir'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $adminCmd

Write-Host "All services are launching. You can close this window."
Start-Sleep -Seconds 2
