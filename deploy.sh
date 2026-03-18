#!/bin/bash

cd /home/user/ehospitals || exit

echo "Pulling latest code..."
git pull origin main

echo "Restarting application..."
docker-compose up -d --build

echo "Deployment completed!"