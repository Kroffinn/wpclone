# 🐳 Docker + AWS Deployment Guide

## Local Development with Docker

### Quick Start
```bash
# 1. Copy environment file
cp .env.docker .env

# 2. Start all services
docker-compose up -d

# 3. Check logs
docker-compose logs -f

# 4. Access app at http://localhost
```

### Services
- **App**: http://localhost:3000 (via nginx proxy at port 80)
- **MongoDB**: localhost:27017
- **Nginx**: Port 80 (HTTP) / 443 (HTTPS)

## AWS Production Deployment

### Prerequisites
1. AWS CLI configured: `aws configure`
2. Docker installed
3. ECR repository access

### Option 1: ECS Fargate (Recommended)

1. **Create ECS Cluster**:
   ```bash
   aws ecs create-cluster --cluster-name whatsapp-cluster
   ```

2. **Set up secrets in AWS Secrets Manager**:
   ```bash
   aws secretsmanager create-secret --name whatsapp-mongodb-uri --secret-string "mongodb://your-mongodb-connection"
   aws secretsmanager create-secret --name whatsapp-session-secret --secret-string "your-super-secret-key"
   ```

3. **Deploy**:
   ```bash
   chmod +x deploy-aws.sh
   ./deploy-aws.sh
   ```

### Option 2: AWS Lightsail (Simple)

1. **Create Lightsail instance**:
   - Choose "OS Only" → Ubuntu
   - $10/month instance (1 GB RAM, 1 vCPU)

2. **Install Docker on instance**:
   ```bash
   sudo apt update
   sudo apt install docker.io docker-compose -y
   sudo usermod -aG docker $USER
   ```

3. **Deploy your app**:
   ```bash
   git clone https://github.com/Kroffinn/WhatsApp-clone.git
   cd WhatsApp-clone
   cp .env.docker .env
   docker-compose up -d
   ```

### Option 3: EC2 with Load Balancer

1. **Launch EC2 instance** (t3.medium recommended)
2. **Install Docker** (same as Lightsail)
3. **Set up Application Load Balancer** pointing to your EC2
4. **Configure SSL certificate** via AWS Certificate Manager

## Environment Configuration

### Required Environment Variables
```bash
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://admin:password123@mongodb:27017/whatsapp?authSource=admin
SESSION_SECRET=your-super-secret-session-key
CORS_ORIGIN=https://your-domain.com
```

### Optional (WhatsApp Business API)
```bash
WHATSAPP_BUSINESS_ACCOUNT_ID=your_account_id
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token
```

## Security Checklist

- ✅ Use strong MongoDB passwords
- ✅ Enable SSL/TLS in production
- ✅ Use AWS Secrets Manager for sensitive data
- ✅ Configure security groups to allow only necessary ports
- ✅ Set up CloudWatch logging
- ✅ Use IAM roles with minimal permissions

## Monitoring

### Health Check Endpoint
- `GET /api/health` - Returns service status

### Docker Health Checks
```bash
docker-compose ps  # Check service status
docker-compose logs app  # Check app logs
```

### AWS CloudWatch
- ECS service metrics
- Application logs
- Custom metrics for message counts, etc.

## Scaling

### Docker Compose (Local)
```yaml
# In docker-compose.yml
services:
  whatsapp-app:
    deploy:
      replicas: 3  # Run 3 instances
```

### AWS ECS
- Auto Scaling based on CPU/memory
- Application Load Balancer for traffic distribution
- Multiple AZ deployment for high availability

## Backup Strategy

### MongoDB Backup
```bash
# Daily backup script
docker exec mongodb mongodump --out /backup/$(date +%Y%m%d)
```

### AWS Backup
- EBS snapshots for persistent storage
- MongoDB Atlas for managed database
- S3 for backup storage

## Cost Optimization

### AWS Lightsail: ~$10-20/month
- Simple, predictable pricing
- Good for small to medium traffic

### AWS ECS Fargate: ~$30-100/month
- Pay for what you use
- Auto-scaling capabilities
- Better for variable traffic

### AWS EC2: ~$20-80/month
- More control over infrastructure
- Can be cheaper with reserved instances
