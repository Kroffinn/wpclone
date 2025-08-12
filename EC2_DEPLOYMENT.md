# 🚀 AWS EC2 Deployment Guide

## Step 1: Launch EC2 Instance

1. **Go to AWS Console** → EC2 → Launch Instance

2. **Configure Instance**:
   - **AMI**: Ubuntu Server 22.04 LTS (Free tier eligible)
   - **Instance Type**: t3.medium (recommended) or t2.micro (free tier)
   - **Key Pair**: Create/select your key pair for SSH access
   - **Security Group**: Create new with these rules:
     ```
     SSH (22) - Your IP
     HTTP (80) - 0.0.0.0/0
     HTTPS (443) - 0.0.0.0/0
     Custom TCP (3000) - 0.0.0.0/0 (for testing)
     ```
   - **Storage**: 20 GB gp3 (minimum)

3. **Launch Instance**

## Step 2: Connect to EC2

```bash
# Replace with your key file and instance IP
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip
```

## Step 3: Setup Environment

```bash
# 1. Download and run setup script
wget https://raw.githubusercontent.com/Kroffinn/wpclone/main/ec2-setup.sh
chmod +x ec2-setup.sh
./ec2-setup.sh

# 2. Reboot (required for Docker permissions)
sudo reboot
```

## Step 4: Deploy Application

```bash
# 1. Reconnect after reboot
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip

# 2. Clone your repository
git clone https://github.com/Kroffinn/wpclone.git
cd wpclone

# 3. Set up environment
cp .env.docker .env

# 4. Edit environment variables (important!)
nano .env
```

**Edit these in .env file**:
```bash
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://admin:password123@mongodb:27017/whatsapp?authSource=admin
SESSION_SECRET=change-this-to-a-strong-secret-key
CORS_ORIGIN=http://your-ec2-public-ip,https://your-domain.com
```

## Step 5: Start Application

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

## Step 6: Access Your App

- **Direct Access**: `http://your-ec2-public-ip`
- **App Direct**: `http://your-ec2-public-ip:3000`

## Step 7: Set up Domain (Optional)

### Option A: Use Route 53
1. Buy domain in Route 53
2. Create A record pointing to EC2 public IP
3. Update CORS_ORIGIN in .env file

### Option B: Use External Domain
1. Point your domain's A record to EC2 public IP
2. Update CORS_ORIGIN in .env file

## Step 8: Enable HTTPS (Production)

```bash
# Install Certbot
sudo apt install -y certbot

# Get SSL certificate (replace with your domain)
sudo certbot certonly --standalone -d your-domain.com

# Update nginx.conf to enable HTTPS section
nano nginx.conf

# Restart services
docker-compose restart nginx
```

## Monitoring Commands

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs app
docker-compose logs mongodb
docker-compose logs nginx

# Restart services
docker-compose restart

# Update application
git pull
docker-compose build app
docker-compose up -d
```

## Backup MongoDB

```bash
# Create backup
docker exec -it wpclone-mongodb-1 mongodump --out /backup/$(date +%Y%m%d)

# Copy backup to host
docker cp wpclone-mongodb-1:/backup ./mongodb-backup
```

## Security Checklist

- ✅ Use strong passwords in .env
- ✅ Restrict Security Group to necessary IPs
- ✅ Enable HTTPS in production
- ✅ Regular security updates: `sudo apt update && sudo apt upgrade`
- ✅ Monitor logs regularly

## Troubleshooting

### App not accessible
```bash
# Check if containers are running
docker-compose ps

# Check logs for errors
docker-compose logs app

# Check if ports are open
sudo netstat -tulpn | grep :80
```

### MongoDB connection issues
```bash
# Check MongoDB logs
docker-compose logs mongodb

# Test MongoDB connection
docker exec -it wpclone-mongodb-1 mongosh
```

### Memory issues (t2.micro)
```bash
# Add swap space
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

## Cost Estimation

- **t2.micro (Free Tier)**: $0/month for 12 months
- **t3.medium**: ~$30-40/month
- **Storage**: ~$2-4/month for 20GB
- **Data Transfer**: Usually free for normal usage

## Scaling Options

1. **Vertical**: Upgrade to larger instance (t3.large, etc.)
2. **Horizontal**: Use Load Balancer + Multiple instances
3. **Database**: Migrate to RDS or MongoDB Atlas
4. **CDN**: Add CloudFront for static assets
