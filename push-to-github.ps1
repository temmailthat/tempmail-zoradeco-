# Script để push code lên GitHub
# Chạy: .\push-to-github.ps1

Write-Host "🚀 TempMail - Push to GitHub" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra Git đã cài chưa
try {
    git --version | Out-Null
} catch {
    Write-Host "❌ Git chưa được cài đặt!" -ForegroundColor Red
    Write-Host "Download tại: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit
}

# Nhập GitHub username
Write-Host "📝 Nhập GitHub username của bạn:" -ForegroundColor Yellow
$username = Read-Host

if ([string]::IsNullOrWhiteSpace($username)) {
    Write-Host "❌ Username không được để trống!" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "✅ Sẽ push lên: https://github.com/$username/tempmail-zoradeco" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  Đảm bảo bạn đã tạo repo 'tempmail-zoradeco' trên GitHub!" -ForegroundColor Yellow
Write-Host "   Nếu chưa, vào: https://github.com/new" -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "Tiếp tục? (y/n)"
if ($confirm -ne "y") {
    Write-Host "Đã hủy." -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "📦 Đang push code..." -ForegroundColor Cyan

# Initialize git nếu chưa có
if (-not (Test-Path ".git")) {
    git init
    Write-Host "✅ Đã khởi tạo Git repository" -ForegroundColor Green
}

# Add all files
git add .
Write-Host "✅ Đã add tất cả files" -ForegroundColor Green

# Commit
git commit -m "Initial commit - TempMail for zoradeco.com"
Write-Host "✅ Đã commit" -ForegroundColor Green

# Rename branch to main
git branch -M main
Write-Host "✅ Đã đổi branch thành main" -ForegroundColor Green

# Add remote
$remoteUrl = "https://github.com/$username/tempmail-zoradeco.git"
try {
    git remote add origin $remoteUrl 2>$null
} catch {
    git remote set-url origin $remoteUrl
}
Write-Host "✅ Đã add remote: $remoteUrl" -ForegroundColor Green

# Push
Write-Host ""
Write-Host "🚀 Đang push lên GitHub..." -ForegroundColor Cyan
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🎉 THÀNH CÔNG!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📍 Repository của bạn:" -ForegroundColor Cyan
    Write-Host "   https://github.com/$username/tempmail-zoradeco" -ForegroundColor White
    Write-Host ""
    Write-Host "📋 Bước tiếp theo:" -ForegroundColor Yellow
    Write-Host "   1. Vào https://vercel.com/new" -ForegroundColor White
    Write-Host "   2. Import repository vừa tạo" -ForegroundColor White
    Write-Host "   3. Đọc file BAT_DAU_DEPLOY.md để tiếp tục" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Có lỗi xảy ra!" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Có thể do:" -ForegroundColor Yellow
    Write-Host "   - Chưa tạo repo trên GitHub" -ForegroundColor White
    Write-Host "   - Chưa login Git (chạy: git config --global user.name 'Your Name')" -ForegroundColor White
    Write-Host "   - Chưa có quyền truy cập repo" -ForegroundColor White
    Write-Host ""
}
