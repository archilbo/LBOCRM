# ====================================================================
# XAMPP MySQL Auto-Repair Script
# ====================================================================

# Require Run as Administrator
if (!([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Warning "Please run this script as an Administrator."
    Pause
    exit
}

$mysqlPath = "C:\xampp\mysql"
$dataDir = "$mysqlPath\data"
$backupDir = "$mysqlPath\backup"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$oldDataDir = "$mysqlPath\data_old_$timestamp"

Write-Host "Starting XAMPP MySQL Database Repair..." -ForegroundColor Cyan

# 1. Check if paths exist
if (!(Test-Path $dataDir)) {
    Write-Host "Error: Cannot find the data folder at $dataDir" -ForegroundColor Red
    Pause; exit
}
if (!(Test-Path $backupDir)) {
    Write-Host "Error: Cannot find the backup folder at $backupDir" -ForegroundColor Red
    Pause; exit
}

# 2. Kill MySQL process if it is stubbornly running in the background
Write-Host "Ensuring MySQL is stopped..."
Stop-Process -Name "mysqld" -Force -ErrorAction SilentlyContinue

# 3. Rename current data folder
Write-Host "Backing up corrupted data folder to: data_old_$timestamp"
Rename-Item -Path $dataDir -NewName "data_old_$timestamp"

# 4. Create fresh data folder from backup
Write-Host "Creating fresh data folder..."
Copy-Item -Path $backupDir -Destination $dataDir -Recurse

# 5. Restore user databases (excluding system defaults)
$excludeFolders = @("mysql", "performance_schema", "phpmyadmin", "test")
$userDatabases = Get-ChildItem -Path $oldDataDir -Directory | Where-Object { $_.Name -notin $excludeFolders }

Write-Host "Restoring your custom databases..."
foreach ($db in $userDatabases) {
    Write-Host " -> Restoring: $($db.Name)"
    Copy-Item -Path $db.FullName -Destination $dataDir -Recurse
}

# 6. Restore the main ibdata1 file
$ibdata1File = "$oldDataDir\ibdata1"
if (Test-Path $ibdata1File) {
    Write-Host "Restoring ibdata1 file..."
    Copy-Item -Path $ibdata1File -Destination $dataDir -Force
} else {
    Write-Warning "Could not find ibdata1 in the old data folder. Things might be deeply corrupted."
}

Write-Host "==================================================" -ForegroundColor Green
Write-Host "Repair Complete! You can now open XAMPP and start MySQL." -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Pause