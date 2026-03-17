# Hospital Selection Platform - Docker Deployment & Export Script
# This script handles building, running, and exporting Docker containers for deployment.

param (
    [Parameter(HelpMessage="Export Docker images to a tarball for air-gapped deployment")]
    [switch]$Export
)

$ScriptRoot = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
Set-Location $ScriptRoot

Write-Host "--- Hospital Selection Docker Deployment ---" -ForegroundColor Cyan

# 1. Ensure .env exists
if (-not (Test-Path ".env")) {
    Write-Host "ATTENTION: .env file not found. Creating from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
}

# 2. Check for port conflicts
# MongoDB (27017) Dev Container Still Conflicts
if (docker ps -q -f name=hospital_mongo_dev) {
    Write-Host "Stopping conflicting dev MongoDB container (hospital_mongo_dev)..." -ForegroundColor Yellow
    docker stop hospital_mongo_dev > $null
}

# 3. Build and Start Services
Write-Host "Building and starting containers..." -ForegroundColor Cyan
docker compose up --build -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "SUCCESS: Services started successfully in detached mode." -ForegroundColor Green
} else {
    Write-Host "ERROR: Error occurred during docker compose up." -ForegroundColor Red
    exit $LASTEXITCODE
}

# 3. Export for Air-Gapped Environment
if ($Export) {
    Write-Host "Exporting images for air-gapped deployment..." -ForegroundColor Cyan
    
    $BundlePath = Join-Path $ScriptRoot "hospital-selection-bundle.tar"

    Write-Host "Saving images to $BundlePath... (This may take a few minutes)" -ForegroundColor Yellow
    # docker save -o <path> <image1> <image2> ...
    docker save -o $BundlePath mongo:7 hospital-selection-backend hospital-selection-hospital-portal hospital-selection-admin-dashboard

    if ($LASTEXITCODE -eq 0) {
        Write-Host "SUCCESS: Export complete: $BundlePath" -ForegroundColor Green
        Write-Host "INSTRUCTIONS for air-gapped server:" -ForegroundColor Cyan
        Write-Host "   1. Copy the .tar file and docker-compose.yml to the server."
        Write-Host "   2. Run: docker load -i hospital-selection-bundle.tar"
        Write-Host "   3. Run: docker compose up -d"
    } else {
        Write-Host "ERROR: Failed to export images." -ForegroundColor Red
    }
}

Write-Host "`nService Status:" -ForegroundColor Cyan
docker compose ps
