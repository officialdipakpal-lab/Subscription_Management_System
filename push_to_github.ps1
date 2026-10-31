param (
    [Parameter(Mandatory=$false)]
    [string]$Token
)

$owner = "officialdipakpal-lab"
$repo = "Subscription_Management_System"
$branch = "main"
$dir = $PSScriptRoot

if (-not $Token) {
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host "  Brightloop Direct GitHub Repository Push" -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host "To push directly, please enter your GitHub Personal Access Token (PAT):" -ForegroundColor Yellow
    $Token = Read-Host -Prompt "GitHub Token"
}

if (-not $Token) {
    Write-Host "Error: GitHub Token is required to push to $owner/$repo" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $Token"
    "Accept"        = "application/vnd.github.v3+json"
    "User-Agent"    = "Antigravity-Uploader"
}

$filesToUpload = @("index.html", "app.js", "styles.css", "package.json", "README.md")

foreach ($fileName in $filesToUpload) {
    $filePath = Join-Path $dir $fileName
    if (-not (Test-Path $filePath)) {
        Write-Host "Skipping $fileName (file not found)" -ForegroundColor DarkGray
        continue
    }

    Write-Host "Preparing $fileName..." -NoNewline

    $fileBytes = [System.IO.File]::ReadAllBytes($filePath)
    $base64Content = [System.Convert]::ToBase64String($fileBytes)

    # Check if file already exists in repo to get its SHA
    $fileSha = $null
    $getFileUrl = "https://api.github.com/repos/$owner/$repo/contents/$fileName`?ref=$branch"
    try {
        $existing = Invoke-RestMethod -Uri $getFileUrl -Headers $headers -Method Get -ErrorAction Stop
        $fileSha = $existing.sha
    } catch {
        # File doesn't exist yet
    }

    $bodyObj = @{
        message = "feat: add $fileName for Brightloop Subscription Management System"
        content = $base64Content
        branch  = $branch
    }
    if ($fileSha) {
        $bodyObj["sha"] = $fileSha
    }

    $jsonBody = $bodyObj | ConvertTo-Json -Compress

    $putUrl = "https://api.github.com/repos/$owner/$repo/contents/$fileName"
    try {
        $res = Invoke-RestMethod -Uri $putUrl -Headers $headers -Method Put -Body $jsonBody -ContentType "application/json"
        Write-Host " [SUCCESS ✅]" -ForegroundColor Green
    } catch {
        Write-Host " [FAILED ❌]" -ForegroundColor Red
        Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nAll files pushed! Check: https://github.com/$owner/$repo" -ForegroundColor Green
