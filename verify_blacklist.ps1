
$baseUrl = "http://localhost:9002/api"
$phone = "01999999999"
$reason = "Integration Test Block"

# 1. Add to Blacklist
Write-Host "1. Adding $phone to blacklist..."
$addBody = @{ phone = $phone; reason = $reason } | ConvertTo-Json
$addRes = Invoke-RestMethod -Uri "$baseUrl/blacklist" -Method Post -Body $addBody -ContentType "application/json" -ErrorAction Stop
if ($addRes.success) { Write-Host "   Success: Added to blacklist." -ForegroundColor Green }
else { Write-Host "   Failed: $($addRes.message)" -ForegroundColor Red; exit }

$blacklistId = $addRes.data._id

# 2. Try to Place Order (Should Fail)
Write-Host "2. Attempting to place order with blacklisted phone..."
$orderBody = @{
    customer = "Test User";
    phone = $phone;
    address = "Test Address";
    amount = "500";
    products = @( @{ productId = "PROD-123"; name = "Test Product"; quantity = 1; price = 500 } )
    date = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
} | ConvertTo-Json

try {
    $orderRes = Invoke-RestMethod -Uri "$baseUrl/orders" -Method Post -Body $orderBody -ContentType "application/json" -ErrorAction Stop
    Write-Host "   Failed: Order was placed successfully but should have been blocked." -ForegroundColor Red
} catch {
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $rawBody = $reader.ReadToEnd()
    Write-Host "   Raw Error Body: $rawBody" -ForegroundColor Gray
    
    $responseBody = $rawBody | ConvertFrom-Json
    
    if ($responseBody.error -match "blocked") {
        Write-Host "   Success: Order blocked as expected. Message: $($responseBody.error)" -ForegroundColor Green
    } else {
        Write-Host "   Warning: Order failed but unexpected message: $($responseBody.error)" -ForegroundColor Yellow
    }
}

# 3. Remove from Blacklist
Write-Host "3. Removing $phone from blacklist..."
$delRes = Invoke-RestMethod -Uri "$baseUrl/blacklist/$blacklistId" -Method Delete -ErrorAction Stop
if ($delRes.success) { Write-Host "   Success: Removed from blacklist." -ForegroundColor Green }
else { Write-Host "   Failed: $($delRes.message)" -ForegroundColor Red }

# 4. Try to Place Order Again (Should pass blacklist check, might fail on stock/product but that's ok)
Write-Host "4. Attempting to place order again..."
try {
    # Note: This might fail if product doesn't exist, but we check if it fails due to blacklist
    $orderRes2 = Invoke-RestMethod -Uri "$baseUrl/orders" -Method Post -Body $orderBody -ContentType "application/json"
    
    if ($orderRes2.success) {
         Write-Host "   Success: Order placed successfully." -ForegroundColor Green
    } else {
         Write-Host "   Note: Order API returned success=false: $($orderRes2.message)" -ForegroundColor Yellow
    }
} catch {
     $err = $_.Exception.Response.GetResponseStream()
     $reader = New-Object System.IO.StreamReader($err)
     $responseBody = $reader.ReadToEnd() | ConvertFrom-Json
     
     if ($responseBody.message -match "blacklisted") {
         Write-Host "   Failed: Still blocked by blacklist!" -ForegroundColor Red
     } else {
         Write-Host "   Success: Passed blacklist check (Failed on other validation: $($responseBody.message))" -ForegroundColor Green
     }
}
