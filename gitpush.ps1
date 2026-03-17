# Navigate to your project folder (optional if already inside)
cd "D:\Projects\Hospital-Project\hospital-selection"

Write-Output "Checking status..."
git status

Write-Output "Adding all changes..."
git add .

# Check if there is anything to commit
$changes = git status --porcelain

if ($changes) {
    Write-Output "Committing changes..."
    git commit -m "Auto update: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

    Write-Output "Pushing to origin main..."
    git push origin main

    Write-Output "Push completed successfully!"
} else {
    Write-Output "No changes to commit."
}