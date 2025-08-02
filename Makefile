# Makefile for Task - Microservices File Processing System
# This file provides convenient commands for managing the entire microservices stack
.PHONY: help up down restart logs build clean exec status network test

# Colors for better output
RED=\033[0;31m
GREEN=\033[0;32m
YELLOW=\033[1;33m
BLUE=\033[0;34m
NC=\033[0m # No Color

@if [ -z "$$(docker network ls --filter name=task-net --format '{{.Name}}')" ]; then \
		echo "Creating Docker network 'task-net'..."; \
		docker network create task-net; \
else \
	echo "Docker network 'task-net' already exists."; \
fi
# Default target
help:
	@echo "$(BLUE)================================================$(NC)"
	@echo "$(BLUE)    Task - Microservices Management System     $(NC)"
	@echo "$(BLUE)================================================$(NC)"
	@echo ""
	@echo "$(GREEN)🚀 Main Operations:$(NC)"
	@echo "  make up         - Start all services (infrastructure + applications)"
	@echo "  make down       - Stop and remove all services"
	@echo "  make restart    - Restart all services"
	@echo "  make build      - Build all application services"
	@echo "  make logs       - Show logs for all services"
	@echo "  make clean      - Clean up containers, networks, and volumes"
	@echo "  make status     - Show status of all services"
	@echo "  make test       - Run all tests"
	@echo ""
	@echo "$(YELLOW)🏗️ Infrastructure Commands:$(NC)"
	@echo "  make infra-up   - Start only infrastructure services (MongoDB, Kafka)"
	@echo "  make infra-down - Stop only infrastructure services"
	@echo "  make infra-logs - Show infrastructure logs"
	@echo ""
	@echo "$(YELLOW)📱 Application Commands:$(NC)"
	@echo "  make apps-up    - Start only application services"
	@echo "  make apps-down  - Stop only application services"
	@echo "  make apps-logs  - Show application logs"
	@echo "  make apps-build - Build only application services"
	@echo "  make apps-test  - Run tests for all application services"
	@echo ""
	@echo "$(BLUE)🎯 Individual Service Commands:$(NC)"
	@echo "  make user-up    - Start user service"
	@echo "  make user-down  - Stop user service"
	@echo "  make user-logs  - Show user service logs"
	@echo "  make user-exec  - Execute bash in user service container"
	@echo "  make user-test  - Run user service tests"
	@echo ""
	@echo "  make file-up    - Start file management service"
	@echo "  make file-down  - Stop file management service"
	@echo "  make file-logs  - Show file management logs"
	@echo "  make file-exec  - Execute bash in file management container"
	@echo ""
	@echo "  make email-up   - Start email service"
	@echo "  make email-down - Stop email service"
	@echo "  make email-logs - Show email service logs"
	@echo "  make email-exec - Execute bash in email service container"
	@echo ""
	@echo "$(GREEN)⚡ Quick Commands:$(NC)"
	@echo "  make dev-setup  - Complete development environment setup"
	@echo "  make health     - Check health of all services"
	@echo "  make monitor    - Monitor all services (logs + status)"
	@echo ""

# Network setup
network:
	@echo "$(YELLOW)Creating external network 'task-net'...$(NC)"
	@docker network create task-net 2>/dev/null || echo "$(GREEN)Network 'task-net' already exists$(NC)"

# Full stack commands
up: network infra-up apps-up
	@echo "$(GREEN)✅ All services are starting up...$(NC)"
	@echo "$(BLUE)🌐 Services will be available at:$(NC)"
	@echo "  - User Service: http://localhost:3001"
	@echo "  - File Management: http://localhost:3002"
	@echo "  - Email Service: http://localhost:3003"
	@echo "  - MongoDB: localhost:27017"
	@echo "  - Kafka: localhost:9092"

down: apps-down infra-down
	@echo "$(GREEN)✅ All services stopped$(NC)"

restart: down up
	@echo "$(GREEN)✅ All services restarted$(NC)"

build:
	@echo "$(YELLOW)🔨 Building all application services...$(NC)"
	@cd user-service && docker-compose build
	@cd file-management && docker-compose build
	@cd email-service && docker-compose build
	@echo "$(GREEN)✅ All services built successfully$(NC)"

logs:
	@echo "$(BLUE)📋 Showing logs for all services...$(NC)"
	@docker-compose -f infra/docker-compose.yml logs -f --tail=50 &
	@cd user-service && docker-compose logs -f --tail=50 &
	@cd file-management && docker-compose logs -f --tail=50 &
	@cd email-service && docker-compose logs -f --tail=50 &
	@wait

status:
	@echo "$(BLUE)📊 Service Status Overview$(NC)"
	@echo "$(YELLOW)=== Infrastructure Services ===$(NC)"
	@docker-compose -f infra/docker-compose.yml ps
	@echo ""
	@echo "$(YELLOW)=== User Service ===$(NC)"
	@cd user-service && docker-compose ps
	@echo ""
	@echo "$(YELLOW)=== File Management Service ===$(NC)"
	@cd file-management && docker-compose ps
	@echo ""
	@echo "$(YELLOW)=== Email Service ===$(NC)"
	@cd email-service && docker-compose ps

clean: down
	@echo "$(RED)🧹 Cleaning up containers, networks, and volumes...$(NC)"
	@docker system prune -f
	@docker volume prune -f
	@docker network rm task-net 2>/dev/null || echo "$(YELLOW)Network 'task-net' already removed$(NC)"
	@echo "$(GREEN)✅ Cleanup completed$(NC)"

# Testing commands
test: user-test
	@echo "$(GREEN)✅ All tests completed$(NC)"

user-test:
	@echo "$(BLUE)🧪 Running user service tests...$(NC)"
	@cd user-service && npm test

apps-test: user-test
	@echo "$(GREEN)✅ All application tests completed$(NC)"

# Infrastructure commands
infra-up: network
	@echo "$(YELLOW)🏗️ Starting infrastructure services...$(NC)"
	@docker-compose -f infra/docker-compose.yml up -d
	@echo "$(GREEN)✅ Infrastructure services started$(NC)"

infra-down:
	@echo "$(YELLOW)🛑 Stopping infrastructure services...$(NC)"
	@docker-compose -f infra/docker-compose.yml down
	@echo "$(GREEN)✅ Infrastructure services stopped$(NC)"

infra-logs:
	@echo "$(BLUE)📋 Showing infrastructure logs...$(NC)"
	@docker-compose -f infra/docker-compose.yml logs -f --tail=50

# Application commands
apps-up: network
	@echo "$(YELLOW)📱 Starting application services...$(NC)"
	@cd user-service && docker-compose up -d
	@cd file-management && docker-compose up -d
	@cd email-service && docker-compose up -d
	@echo "$(GREEN)✅ Application services started$(NC)"

apps-down:
	@echo "$(YELLOW)🛑 Stopping application services...$(NC)"
	@cd user-service && docker-compose down
	@cd file-management && docker-compose down
	@cd email-service && docker-compose down
	@echo "$(GREEN)✅ Application services stopped$(NC)"

apps-logs:
	@echo "$(BLUE)📋 Showing application logs...$(NC)"
	@cd user-service && docker-compose logs -f --tail=50 &
	@cd file-management && docker-compose logs -f --tail=50 &
	@cd email-service && docker-compose logs -f --tail=50 &
	@wait

apps-build:
	@echo "$(YELLOW)🔨 Building application services...$(NC)"
	@cd user-service && docker-compose build
	@cd file-management && docker-compose build
	@cd email-service && docker-compose build
	@echo "$(GREEN)✅ Application services built$(NC)"

# User service commands
user-up: network
	@echo "Starting user service..."
	@cd user-service && docker-compose up -d

user-down:
	@echo "Stopping user service..."
	@cd user-service && docker-compose down

user-logs:
	@echo "Showing user service logs..."
	@cd user-service && docker-compose logs -f --tail=50

user-exec:
	@echo "Executing bash in user service container..."
	@cd user-service && docker-compose exec user-service /bin/bash || docker-compose exec user-service /bin/sh

user-build:
	@echo "$(YELLOW)🔨 Building user service...$(NC)"
	@cd user-service && docker-compose build
	@echo "$(GREEN)✅ User service built$(NC)"

user-test:
	@echo "$(BLUE)🧪 Running user service tests...$(NC)"
	@cd user-service && npm test

# File management service commands
file-up: network
	@echo "Starting file management service..."
	@cd file-management && docker-compose up -d

file-down:
	@echo "Stopping file management service..."
	@cd file-management && docker-compose down

file-logs:
	@echo "Showing file management logs..."
	@cd file-management && docker-compose logs -f --tail=50

file-exec:
	@echo "Executing bash in file management container..."
	@cd file-management && docker-compose exec file-management /bin/bash || docker-compose exec file-management /bin/sh

file-build:
	@echo "Building file management service..."
	@cd file-management && docker-compose build

# Email service commands
email-up: network
	@echo "Starting email service..."
	@cd email-service && docker-compose up -d

email-down:
	@echo "Stopping email service..."
	@cd email-service && docker-compose down

email-logs:
	@echo "Showing email service logs..."
	@cd email-service && docker-compose logs -f --tail=50

email-exec:
	@echo "Executing bash in email service container..."
	@cd email-service && docker-compose exec email-service /bin/bash || docker-compose exec email-service /bin/sh

email-build:
	@echo "Building email service..."
	@cd email-service && docker-compose build

# Development helpers
dev-setup: network build
	@echo "$(BLUE)🚀 Setting up development environment...$(NC)"
	@make infra-up
	@echo "$(YELLOW)⏳ Waiting for infrastructure to be ready...$(NC)"
	@sleep 15
	@make apps-up
	@echo "$(GREEN)✅ Development environment ready!$(NC)"
	@make health

# Health check for all services
health:
	@echo "$(BLUE)🏥 Checking service health...$(NC)"
	@echo "$(YELLOW)User Service:$(NC)"
	@curl -s http://localhost:3001/api/health 2>/dev/null && echo " ✅" || echo " ❌"
	@echo "$(YELLOW)File Management:$(NC)"
	@curl -s http://localhost:3002/api/health 2>/dev/null && echo " ✅" || echo " ❌"
	@echo "$(YELLOW)Email Service:$(NC)"
	@curl -s http://localhost:3003/api/health 2>/dev/null && echo " ✅" || echo " ❌"

# Monitor services (combined status and logs)
monitor:
	@echo "$(BLUE)📊 Service Monitoring Dashboard$(NC)"
	@make status
	@echo ""
	@echo "$(YELLOW)📋 Recent Logs (Press Ctrl+C to stop):$(NC)"
	@make logs

# Quick commands for common operations
quick-restart-apps: apps-down apps-up
	@echo "$(GREEN)✅ Applications restarted quickly$(NC)"

quick-restart-infra: infra-down infra-up
	@echo "$(GREEN)✅ Infrastructure restarted quickly$(NC)"

quick-logs-user: user-logs
quick-logs-file: file-logs  
quick-logs-email: email-logs
