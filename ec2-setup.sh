#!/bin/bash

# AWS EC2 Setup Script for WhatsApp Clone
# Run this script on your EC2 instance after launching it

echo "🚀 Setting up WhatsApp Clone on AWS EC2..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
echo "📦 Installing Docker..."
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Install Docker Compose
echo "📦 Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER

# Install Git
sudo apt install -y git

echo "✅ Docker and Docker Compose installed!"
echo "⚠️  Please log out and log back in for Docker permissions to take effect"
echo "Then run: sudo reboot"
