cd "E:\Projects\ehospitals"

Write-Output "Pulling latest code..."
git pull origin main

Write-Output "Restarting application..."

# If using Docker
docker-compose up -d --build

# If using backend service (optional)
# Restart-Service -Name "your-service-name"

Write-Output "Deployment completed!"