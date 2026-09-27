# PowerShell 1-Click Deployment to EC2
param (
    [string]$PublicIP = "",
    [string]$KeyPath = "C:\Users\Prem\Downloads\story_bot.pem"
)

if (-not $PublicIP) {
    Write-Host "⚠️ Please provide your EC2 Public IP address." -ForegroundColor Yellow
    Write-Host "Usage: .\deploy-to-ec2.ps1 -PublicIP <YOUR_EC2_PUBLIC_IP>" -ForegroundColor Cyan
    Write-Host "Note: 172.31.13.142 is AWS private IP. The Public IP can be found in AWS EC2 Console under 'Public IPv4 address'." -ForegroundColor Gray
    exit 1
}

Write-Host "🚀 Deploying DKTE Placement System to EC2 ($PublicIP)..." -ForegroundColor Green

# 1. Test SSH
Write-Host "🔑 Testing SSH connection with key: $KeyPath" -ForegroundColor Cyan
ssh -i $KeyPath -o StrictHostKeyChecking=no ubuntu@$PublicIP "echo 'SSH Connection Verified!'"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Could not connect. Please ensure:" -ForegroundColor Red
    Write-Host "   1. EC2 Public IP is correct." -ForegroundColor Red
    Write-Host "   2. Inbound Security Group allows Port 22 (SSH) and Port 80 (HTTP)." -ForegroundColor Red
    exit 1
}

# 2. Archive and transfer code
Write-Host "📦 Packaging project..." -ForegroundColor Cyan
$tarFile = "campushire-deploy.tar.gz"
tar --exclude='node_modules' --exclude='.git' --exclude='dist' -czvf $tarFile backend frontend docker-compose.yml .env.example README.md deploy_ec2.sh

Write-Host "📤 Uploading package to EC2..." -ForegroundColor Cyan
scp -i $KeyPath -o StrictHostKeyChecking=no $tarFile ubuntu@${PublicIP}:~/

# 3. Extract and launch on EC2
Write-Host "🚀 Launching 24/7 services on EC2..." -ForegroundColor Green
ssh -i $KeyPath -o StrictHostKeyChecking=no ubuntu@$PublicIP "mkdir -p ~/campushire && tar -xzvf ~/campushire-deploy.tar.gz -C ~/campushire && cd ~/campushire && chmod +x deploy_ec2.sh && bash deploy_ec2.sh"

Remove-Item $tarFile -Force -ErrorAction SilentlyContinue

Write-Host "🎉 Portal is live 24/7 at: http://$PublicIP" -ForegroundColor Green
