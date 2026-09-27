param (
    [string]$PublicIP = "16.16.70.142",
    [string]$KeyPath = "C:\Users\Prem\Downloads\story_bot.pem"
)

Write-Host "Connecting to EC2 ($PublicIP)..."

# 1. Test SSH
& ssh -i $KeyPath -o StrictHostKeyChecking=no ubuntu@$PublicIP "uname -s"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to connect to EC2."
    exit 1
}

Write-Host "SSH connection successful."

# 2. Package
Write-Host "Creating deployment archive..."
$tarFile = "campushire-deploy.tar.gz"
tar --exclude=node_modules --exclude=.git --exclude=dist -czvf $tarFile backend frontend docker-compose.yml .env.example README.md deploy_ec2.sh

# 3. SCP
Write-Host "Uploading project to EC2..."
& scp -i $KeyPath -o StrictHostKeyChecking=no $tarFile "ubuntu@${PublicIP}:~/"

# 4. Extract and deploy on EC2
Write-Host "Extracting and starting containers on EC2..."
& ssh -i $KeyPath -o StrictHostKeyChecking=no ubuntu@$PublicIP "mkdir -p ~/campushire && tar -xzvf ~/campushire-deploy.tar.gz -C ~/campushire && cd ~/campushire && chmod +x deploy_ec2.sh && bash deploy_ec2.sh"

Remove-Item $tarFile -Force -ErrorAction SilentlyContinue

Write-Host "Deployment finished! Visit: http://$PublicIP"
