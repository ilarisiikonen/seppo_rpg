param(
  [switch]$InstallDepsOnly
)

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$appDir = Join-Path $repoRoot 'seppo-react'

if (-not (Test-Path $appDir)) {
  Write-Error "Cannot find seppo-react folder at: $appDir"
}

$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
$npmCmd = Get-Command npm -ErrorAction SilentlyContinue

if (-not $nodeCmd -or -not $npmCmd) {
  Write-Host "Node.js / npm are not available on PATH." -ForegroundColor Yellow
  Write-Host "Install Node.js LTS, then re-run this script." -ForegroundColor Yellow
  Write-Host ""
  Write-Host "Recommended (Windows):" -ForegroundColor Cyan
  Write-Host "  winget install OpenJS.NodeJS.LTS"
  Write-Host ""
  Write-Host "After install, restart terminal and run:" -ForegroundColor Cyan
  Write-Host "  .\setup-windows.ps1"
  exit 1
}

Set-Location $appDir

Write-Host "Installing dependencies in seppo-react..." -ForegroundColor Cyan
npm install

if ($InstallDepsOnly) {
  Write-Host "Dependencies installed. Start dev server with: npm run dev" -ForegroundColor Green
  exit 0
}

Write-Host "Starting development server..." -ForegroundColor Cyan
npm run dev
