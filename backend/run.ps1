$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

$venvPython = Join-Path $projectRoot "venv\Scripts\python.exe"

if (-not (Test-Path $venvPython)) {
    Write-Host "Creating venv..."
    python -m venv venv
}

Write-Host "Checking dependencies..."
$depsOk = $true
try {
    & $venvPython -c "import fastapi, sqlalchemy, uvicorn, pydantic, passlib"
}
catch {
    $depsOk = $false
}

if (-not $depsOk) {
    Write-Host "Installing requirements..."
    & $venvPython -m pip install -r requirements.txt
}

Write-Host "Starting API..."
& $venvPython -m uvicorn app.main:app --reload
