#!/bin/bash

# AWS Deployment Script for WhatsApp Clone
# Make sure to configure AWS CLI first: aws configure

set -e

# Configuration
AWS_REGION="us-east-1"
ECR_REPOSITORY="whatsapp-clone"
CLUSTER_NAME="whatsapp-cluster"
SERVICE_NAME="whatsapp-service"
TASK_DEFINITION="whatsapp-clone"

echo "🚀 Starting AWS deployment..."

# 1. Build and push Docker image to ECR
echo "📦 Building Docker image..."
docker build -t $ECR_REPOSITORY .

# Get ECR login token
echo "🔐 Logging into ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $(aws sts get-caller-identity --query Account --output text).dkr.ecr.$AWS_REGION.amazonaws.com

# Create ECR repository if it doesn't exist
aws ecr describe-repositories --repository-names $ECR_REPOSITORY --region $AWS_REGION || aws ecr create-repository --repository-name $ECR_REPOSITORY --region $AWS_REGION

# Tag and push image
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_URI="$ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY"

docker tag $ECR_REPOSITORY:latest $ECR_URI:latest
docker push $ECR_URI:latest

echo "✅ Image pushed to ECR: $ECR_URI:latest"

# 2. Update task definition with new image URI
echo "📝 Updating task definition..."
sed "s|YOUR_ECR_URI|$ECR_URI|g" aws/ecs-task-definition.json > aws/ecs-task-definition-updated.json
sed -i "s|YOUR_ACCOUNT_ID|$ACCOUNT_ID|g" aws/ecs-task-definition-updated.json

# Register new task definition
aws ecs register-task-definition --cli-input-json file://aws/ecs-task-definition-updated.json --region $AWS_REGION

# 3. Update ECS service
echo "🔄 Updating ECS service..."
aws ecs update-service --cluster $CLUSTER_NAME --service $SERVICE_NAME --task-definition $TASK_DEFINITION --region $AWS_REGION

echo "✅ Deployment completed! Check ECS console for deployment status."
echo "🌐 Your app will be available at the load balancer URL once deployment is complete."

# Cleanup
rm aws/ecs-task-definition-updated.json
