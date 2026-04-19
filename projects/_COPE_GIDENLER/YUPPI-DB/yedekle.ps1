$sourceFile = "C:\X\Antigravity\projects\YUPPI\prisma\dev.db"
$destFolder = "Z:\Z.Backup\YUPPI_Database_Yedekleri"
$dateStr = Get-Date -Format "yyyyMMdd_HHmmss"
$destFile = "$destFolder\dev_backup_$dateStr.db"

# Klasör yoksa oluştur
if (!(Test-Path -Path $destFolder)) {
    New-Item -ItemType Directory -Path $destFolder | Out-Null
}

# Veritabanını NAS'a kopyala
try {
    Copy-Item -Path $sourceFile -Destination $destFile -Force
    Write-Output "Yedekleme basarili: $destFile"
    
    # NAS'ın kapasitesi dolmasın diye 30 günden eski yedekleri siler
    Get-ChildItem -Path $destFolder -Filter "dev_backup_*.db" | Where-Object { $_.CreationTime -lt (Get-Date).AddDays(-30) } | Remove-Item -Force -ErrorAction SilentlyContinue
} catch {
    Write-Error "Yedekleme sirasinda hata olustu: $_"
}
