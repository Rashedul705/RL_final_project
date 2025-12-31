$baseUrl = "http://localhost:9002/api"

# 1. Register User
$userData = @{
    name     = "Admin User"
    email    = "admin@rodela.com"
    password = "admin123"
} | ConvertTo-Json

Write-Host "1. Registering/Checking Admin User..."
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $userData -ContentType "application/json"
    if ($response.success) {
        Write-Host "   Registered/Found user: $($response.data.email)" -ForegroundColor Green
        $userId = $response.data._id
        if (-not $userId) { $userId = $response.data.id }
        
        # If registration returns the user but it's already there, we might not get ID if logic differs. 
        # But let's assume valid response.
    }
    else {
        Write-Host "   Registration failed or user exists: $($response.error)" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "   Error registering: $_" -ForegroundColor Red
}

# 2. Find User ID (if not captured above or to be sure)
Write-Host "`n2. Fetching User ID..."
try {
    $usersResponse = Invoke-RestMethod -Uri "$baseUrl/users" -Method Get
    if ($usersResponse.success) {
        $adminUser = $usersResponse.data | Where-Object { $_.email -eq "admin@rodela.com" }
        if ($adminUser) {
            $userId = $adminUser._id
            Write-Host "   Found Admin User ID: $userId" -ForegroundColor Green
            
            # 3. Promote to Admin
            Write-Host "`n3. Promoting to Admin..."
            $promoteData = @{
                userId = $userId
                action = "update_role"
                role   = "admin"
            } | ConvertTo-Json
            
            try {
                $promoteResponse = Invoke-RestMethod -Uri "$baseUrl/users" -Method Put -Body $promoteData -ContentType "application/json"
                if ($promoteResponse.success) {
                    Write-Host "   SUCCESS: User promoted to Admin!" -ForegroundColor Green
                    Write-Host "`nCredentials:" -ForegroundColor Cyan
                    Write-Host "Email: admin@rodela.com" -ForegroundColor Cyan
                    Write-Host "Password: admin123" -ForegroundColor Cyan
                }
                else {
                    Write-Host "   Failed to promote: $($promoteResponse.error)" -ForegroundColor Red
                }
            }
            catch {
                Write-Host "   Error promoting: $_" -ForegroundColor Red
            }

        }
        else {
            Write-Host "   Could not find user 'admin@rodela.com' in user list." -ForegroundColor Red
        }
    }
}
catch {
    Write-Host "   Error fetching users: $_" -ForegroundColor Red
}
