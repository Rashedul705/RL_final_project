$baseUrl = "http://localhost:9002/api"
$timestamp = Get-Date -Format "yyyyMMddHHmmss"

Write-Host "=== STARTING MASTER SYSTEM VERIFICATION ===" -ForegroundColor Cyan

# 1. AUTH & USERS
Write-Host "`n[1/6] USER REGISTRATION"
$adminEmail = "admin_master_$timestamp@rodela.com"
$userEmail = "user_master_$timestamp@rodela.com"

# Register Admin
$adminData = @{ name = "Master Admin"; email = $adminEmail; password = "password123" } | ConvertTo-Json
$regAdmin = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $adminData -ContentType "application/json"

# Register User
$userData = @{ name = "Master User"; email = $userEmail; password = "password123" } | ConvertTo-Json
$regUser = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $userData -ContentType "application/json"

if ($regAdmin.success -and $regUser.success) {
    Write-Host "   SUCCESS: Created Admin ($adminEmail) and User ($userEmail)" -ForegroundColor Green
    $adminId = $regAdmin.data._id
    if (-not $adminId) { $adminId = $regAdmin.data.id }
    $userId = $regUser.data._id
    if (-not $userId) { $userId = $regUser.data.id }
}
else {
    Write-Host "   FAILURE: Registration failed. $($regAdmin.error) $($regUser.error)" -ForegroundColor Red
    exit
}

# 2. ROLE MANAGEMENT
Write-Host "`n[2/6] ROLE PROMOTION"
$promoteData = @{ userId = $adminId; action = "update_role"; role = "admin" } | ConvertTo-Json
try {
    $promote = Invoke-RestMethod -Uri "$baseUrl/users" -Method Put -Body $promoteData -ContentType "application/json"
    if ($promote.success -and $promote.data.role -eq "admin") {
        Write-Host "   SUCCESS: Promoted $adminEmail to Admin." -ForegroundColor Green
    }
    else {
        Write-Host "   FAILURE: Promotion failed." -ForegroundColor Red
    }
}
catch {
    Write-Host "   ERROR: $_" -ForegroundColor Red
}

# 3. PRODUCT MANAGEMENT
Write-Host "`n[3/6] CREATE PRODUCT"
$productId = "PROD-$timestamp"
$productData = @{
    id          = $productId
    name        = "Master Verification Product"
    description = "A product for testing everything"
    price       = 5000
    image       = "https://via.placeholder.com/300"
    category    = "Testing"
    stock       = 100
} | ConvertTo-Json

try {
    $prod = Invoke-RestMethod -Uri "$baseUrl/products" -Method Post -Body $productData -ContentType "application/json"
    if ($prod.success) {
        Write-Host "   SUCCESS: Created Product $productId" -ForegroundColor Green
    }
    else {
        Write-Host "   FAILURE: Product creation failed." -ForegroundColor Red
    }
}
catch {
    Write-Host "   ERROR: $_" -ForegroundColor Red
}

# 4. ORDER PLACEMENT
Write-Host "`n[4/6] PLACE ORDER"
$orderData = @{
    email    = $userEmail
    customer = "Master User"
    phone    = "01700000000"
    address  = "Master Address"
    amount   = 5000
    date     = (Get-Date).ToString("yyyy-MM-dd")
    products = @(@{ productId = $productId; name = "Master Verification Product"; quantity = 1; price = 5000 })
} | ConvertTo-Json

try {
    $order = Invoke-RestMethod -Uri "$baseUrl/orders" -Method Post -Body $orderData -ContentType "application/json"
    if ($order.success) {
        Write-Host "   SUCCESS: Order Placed ($($order.data.id))" -ForegroundColor Green
        $orderId = $order.data.id
    }
    else {
        Write-Host "   FAILURE: Order failed. $($order.error)" -ForegroundColor Red
    }
}
catch {
    Write-Host "   ERROR: $_" -ForegroundColor Red
}

# 5. USER PROFILE CHECK
Write-Host "`n[5/6] VERIFY PROFILE ORDER"
try {
    $profileOrders = Invoke-RestMethod -Uri "$baseUrl/orders?email=$userEmail" -Method Get
    if ($profileOrders.success -and ($profileOrders.data | Where-Object { $_.id -eq $orderId })) {
        Write-Host "   SUCCESS: Order $orderId found in User Profile." -ForegroundColor Green
    }
    else {
        Write-Host "   FAILURE: Order not found in profile." -ForegroundColor Red
    }
}      
catch {
    Write-Host "   ERROR: $_" -ForegroundColor Red
}

# 6. ADMIN DASHBOARD DATA CHECK
Write-Host "`n[6/6] VERIFY ADMIN DATA"
try {
    $users = Invoke-RestMethod -Uri "$baseUrl/users" -Method Get
    $foundUser = $users.data | Where-Object { $_.email -eq $userEmail }
    
    if ($foundUser) {
        Write-Host "   SUCCESS: Admin can see new user." -ForegroundColor Green
    }   
    else {
        Write-Host "   FAILURE: User not found in Admin User List." -ForegroundColor Red
    }
}
catch {
    Write-Host "   ERROR: $_" -ForegroundColor Red
}

Write-Host "`n=== VERIFICATION COMPLETE ===" -ForegroundColor Cyan
