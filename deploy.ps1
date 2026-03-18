cd "E:\Projects\ehospitals"
$logFile = "E:\Projects\ehospitals\deploy-log.txt"

Add-Content $logFile "`n---- $(Get-Date) ----"

git fetch origin main

$local = git rev-parse HEAD
$remote = git rev-parse origin/main

if ($local -ne $remote) {
    Add-Content $logFile "Changes detected. Deploying..."

    git pull origin main
    docker-compose up -d --build

    Add-Content $logFile "Deployment successful"
}
else {
    Add-Content $logFile "No changes"
}