$baseUrl = "http://localhost:9002/api"
try {
    $usersResponse = Invoke-RestMethod -Uri "$baseUrl/users" -Method Get
    Write-Host "Response Type: $($usersResponse.GetType().Name)"
    Write-Host "Keys: $($usersResponse.PSObject.Properties.Name)"
    
    if ($usersResponse.data) {
        Write-Host "Data count: $($usersResponse.data.Count)"
        # Print first few emails
        $usersResponse.data | Select-Object -First 5 -ExpandProperty email
        
        $verifier = $usersResponse.data | Where-Object { $_.email -match "verifier" }
        if ($verifier) {
            Write-Host "Found!"
        }
        else {
            Write-Host "Verifier not found in list."
        }
    }
    else {
        Write-Host "No data property found."
        Write-Host $usersResponse | ConvertTo-Json -Depth 2
    }

}
catch {
    Write-Host "Error: $_"
}
