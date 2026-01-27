$baseUrl = "http://localhost:9002/api"

$userData = @{
    name     = "Admin Two"
    email    = "admin2@rodela.com"
    password = "admin123"
} | ConvertTo-Json

Write-Host "Registering..."
try {
    $regResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $userData -ContentType "application/json"
    Write-Host "Reg Success: $($regResponse.success)"
    
    if ($regResponse.success) {
        $userId = $regResponse.data._id
        if (-not $userId) { $userId = $regResponse.data.id }
        Write-Host "New ID: $userId"
        
        $promoteData = @{
            userId = $userId
            action = "update_role"
            role   = "admin"
        } | ConvertTo-Json
        
        $promResponse = Invoke-RestMethod -Uri "$baseUrl/users" -Method Put -Body $promoteData -ContentType "application/json"
        Write-Host "Promote Success: $($promResponse.success)"
    }
    else {
        Write-Host "Registration failed: $($regResponse.error)"
    }
}
catch {
    Write-Host "Error: $_"
}
