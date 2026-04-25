# 1. Disable IPv6 on iPhone Tethering and Wi-Fi adapters
Disable-NetAdapterBinding -Name "Ethernet 2" -ComponentID ms_tcpip6 -ErrorAction SilentlyContinue
Disable-NetAdapterBinding -Name "Wi-Fi" -ComponentID ms_tcpip6 -ErrorAction SilentlyContinue

# 2. Change the interface metric of the Tailscale adapter to 100
$tsAdapter = Get-NetAdapter -Name "Tailscale" -ErrorAction SilentlyContinue
if ($tsAdapter) {
    Set-NetIPInterface -InterfaceIndex $tsAdapter.ifIndex -InterfaceMetric 100
}

# 3. Disable USB Selective Suspend (Power Management) for the iPhone adapter.
$dev = Get-PnpDevice | Where-Object { $_.FriendlyName -match "Apple Mobile Device Ethernet" }
if ($dev) {
    $instanceId = $dev.InstanceId
    $regPath = "HKLM:\SYSTEM\CurrentControlSet\Enum\$instanceId\Device Parameters"
    if (Test-Path $regPath) {
        Set-ItemProperty -Path $regPath -Name "PnPCapabilities" -Value 24 -Type DWord -ErrorAction SilentlyContinue
    }
}

# 4. Set the Tailscale network profile to Private
$profile = Get-NetConnectionProfile -InterfaceAlias "Tailscale" -ErrorAction SilentlyContinue
if ($profile) {
    Set-NetConnectionProfile -InterfaceAlias "Tailscale" -NetworkCategory Private
}

# 5. Start Tailscale in unattended mode
& 'C:\Program Files\Tailscale\tailscale.exe' up --unattended --accept-routes --accept-dns

Start-Sleep -Seconds 3
