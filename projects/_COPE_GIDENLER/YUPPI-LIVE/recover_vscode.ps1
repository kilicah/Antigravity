$historyDir = [System.Environment]::ExpandEnvironmentVariables("%APPDATA%\Code\User\History")
$recoveryDir = Join-Path (Get-Location) "RECOVERED_FILES"

if (!(Test-Path $recoveryDir)) {
    New-Item -ItemType Directory -Path $recoveryDir | Out-Null
}

$targets = @(
    "OrderEntryForm.tsx",
    "OrderEntryForm_Backup.tsx",
    "OrderEntryForm_Backup_utf8.tsx",
    "SalesContractDocument.tsx",
    "Step2Items.tsx",
    "Step3Terms.tsx"
)

Write-Host "Searching VS Code history in: $historyDir"

$entriesFiles = Get-ChildItem -Path $historyDir -Filter "entries.json" -Recurse -File

foreach ($entriesFile in $entriesFiles) {
    try {
        $content = Get-Content $entriesFile.FullName -Raw | ConvertFrom-Json
        $resource = $content.resource
        
        foreach ($target in $targets) {
            if ($resource -like "*$target*") {
                Write-Host "`nFound history for: $resource"
                
                $entries = $content.entries
                if (!$entries) { continue }
                
                # Sort entries descending by timestamp
                $sortedEntries = $entries | Sort-Object -Property timestamp -Descending
                
                # Take top 5
                $count = 0
                foreach ($entry in $sortedEntries) {
                    if ($count -ge 5) { break }
                    
                    $entryId = $entry.id
                    $sourcePath = Join-Path $entriesFile.DirectoryName $entryId
                    
                    if (Test-Path $sourcePath) {
                        $timestampMs = $entry.timestamp
                        $dt = (Get-Date "1970-01-01 00:00:00.000Z").AddMilliseconds($timestampMs).ToLocalTime()
                        $timeStr = $dt.ToString("yyyy-MM-dd_HH-mm-ss")
                        
                        $destFilename = "${target}_${timeStr}.tsx"
                        $destPath = Join-Path $recoveryDir $destFilename
                        
                        Copy-Item -Path $sourcePath -Destination $destPath
                        $size = (Get-Item $destPath).Length
                        Write-Host "  -> Recovered: $destFilename (Size: $size bytes)"
                        $count++
                    }
                }
            }
        }
    } catch {
        # Ignore errors reading specific files
    }
}

Write-Host "`nDone. Check the $recoveryDir folder."
