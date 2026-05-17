$wifiDev = Get-PnpDevice | Where-Object { $_.FriendlyName -match "Intel\(R\) Dual Band Wireless-AC 3165" }
if ($wifiDev) {
    $instanceId = $wifiDev.InstanceId
    $regPath = "HKLM:\SYSTEM\CurrentControlSet\Enum\$instanceId\Device Parameters"
    
    # 1. Disable Power Management for Wi-Fi
    if (Test-Path $regPath) {
        Set-ItemProperty -Path $regPath -Name "PnPCapabilities" -Value 24 -Type DWord
    }

    # 2. Set Roaming Aggressiveness to Lowest (1) to stop it from disconnecting Hotspot
    $driverPath = (Get-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Enum\$instanceId").Driver
    if ($driverPath) {
        $fullDriverPath = "HKLM:\SYSTEM\CurrentControlSet\Control\Class\$driverPath"
        if (Test-Path $fullDriverPath) {
            Set-ItemProperty -Path $fullDriverPath -Name "RoamingPreferredBandType" -Value "0"
            Set-ItemProperty -Path $fullDriverPath -Name "RoamAggressiveness" -Value "1"
        }
    }
}
