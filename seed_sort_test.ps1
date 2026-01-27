$baseUrl = "http://localhost:9002/api"

# 1. Create Category (using plural /categories)
$catData = @{
    name        = "Sort Test"
    description = "Testing sorting logic"
    id          = "sort-test"
} | ConvertTo-Json

Write-Host "Creating Category..."
try {
    # Check if category exists first
    $allCats = Invoke-RestMethod -Uri "$baseUrl/categories" -Method Get
    $existing = $allCats.data | Where-Object { $_.id -eq "sort-test" }
    
    $slug = "sort-test"

    if (-not $existing) {
        $catRes = Invoke-RestMethod -Uri "$baseUrl/categories" -Method Post -Body $catData -ContentType "application/json"
        
        if ($catRes.success) {
            $slug = $catRes.data.id
            if (-not $slug) { $slug = "sort-test" }
            Write-Host "Category created: $slug"
        }
        else {
            Write-Host "Category create failed: $($catRes.error)"
            exit
        }
    }
    else {
        Write-Host "Category already exists: $slug"
    }

    # 2. Create Products
    $products = @(
        @{ name = "Sort P1 (Stock 0)"; price = 100; stock = 0; category = $slug; image = "/placeholder.jpg"; description = "desc"; id = "p1-stock0" },
        @{ name = "Sort P2 (Stock 10)"; price = 100; stock = 10; category = $slug; image = "/placeholder.jpg"; description = "desc"; id = "p2-stock10" },
        @{ name = "Sort P3 (Stock 0)"; price = 100; stock = 0; category = $slug; image = "/placeholder.jpg"; description = "desc"; id = "p3-stock0" },
        @{ name = "Sort P4 (Stock 5)"; price = 100; stock = 5; category = $slug; image = "/placeholder.jpg"; description = "desc"; id = "p4-stock5" }
    )

    foreach ($p in $products) {
        $pJson = $p | ConvertTo-Json
        try {
            $res = Invoke-RestMethod -Uri "$baseUrl/products" -Method Post -Body $pJson -ContentType "application/json"
            if ($res.success) {
                Write-Host "Created/Found $($p.name)"
            }
            else {
                # Ignore if duplicate
                Write-Host "Failed (maybe duplicate): $($p.name) - $($res.error)"
            }
        }
        catch {
            Write-Host "Error creating $($p.name): $_"
        }
    }
}
catch {
    Write-Host "Fatal Error: $_"
}
