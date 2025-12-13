#!/bin/bash

# 🚀 GG LOOP - AWS DEPLOYMENT TERRAFORM CONFIGURATION
# This script sets up the entire AWS infrastructure for GG Loop
# 
# Prerequisites:
# 1. AWS Account with appropriate permissions
# 2. Terraform installed (https://www.terraform.io/downloads)
# 3. AWS CLI configured with credentials
# 4. Domain registered (Route 53 or external registrar)
#
# Usage:
# chmod +x deploy-aws.sh
# ./deploy-aws.sh prod us-east-1

set -e

ENVIRONMENT=${1:-dev}
REGION=${2:-us-east-1}
PROJECT_NAME="gg-loop"

echo "🚀 Deploying GG Loop to AWS"
echo "Environment: $ENVIRONMENT"
echo "Region: $REGION"
echo ""

# Create terraform directory
mkdir -p terraform
cd terraform

# Generate terraform configuration
cat > main.tf << 'EOF'
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket         = "gg-loop-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "gg-loop-terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "gg-loop"
      Environment = var.environment
      ManagedBy   = "terraform"
      CreatedAt   = timestamp()
    }
  }
}

variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "environment" {
  type    = string
  default = "prod"
}

variable "app_name" {
  type    = string
  default = "gg-loop"
}

# ==========================================
# VPC & NETWORKING
# ==========================================

resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${var.app_name}-vpc"
  }
}

resource "aws_subnet" "public_1" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.app_name}-public-1"
  }
}

resource "aws_subnet" "public_2" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "${var.aws_region}b"
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.app_name}-public-2"
  }
}

resource "aws_subnet" "private_1" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.10.0/24"
  availability_zone = "${var.aws_region}a"

  tags = {
    Name = "${var.app_name}-private-1"
  }
}

resource "aws_subnet" "private_2" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.11.0/24"
  availability_zone = "${var.aws_region}b"

  tags = {
    Name = "${var.app_name}-private-2"
  }
}

# ==========================================
# SECURITY GROUPS
# ==========================================

resource "aws_security_group" "alb" {
  name   = "${var.app_name}-alb-sg"
  vpc_id = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "ecs_tasks" {
  name   = "${var.app_name}-ecs-tasks-sg"
  vpc_id = aws_vpc.main.id

  ingress {
    from_port       = 5000
    to_port         = 5000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "rds" {
  name   = "${var.app_name}-rds-sg"
  vpc_id = aws_vpc.main.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ==========================================
# RDS DATABASE
# ==========================================

resource "aws_db_subnet_group" "main" {
  name       = "${var.app_name}-db-subnet-group"
  subnet_ids = [aws_subnet.private_1.id, aws_subnet.private_2.id]
}

resource "aws_rds_cluster" "main" {
  cluster_identifier     = "${var.app_name}-db-cluster"
  engine                 = "aurora-postgresql"
  engine_version         = "15.3"
  database_name          = "ggloop"
  master_username        = "postgres"
  master_password        = random_password.db_password.result
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  backup_retention_period      = 30
  preferred_backup_window      = "03:00-04:00"
  preferred_maintenance_window = "mon:04:00-mon:05:00"
  
  enabled_cloudwatch_logs_exports = ["postgresql"]
  
  skip_final_snapshot = var.environment != "prod"
  
  tags = {
    Name = "${var.app_name}-db-cluster"
  }
}

resource "aws_rds_cluster_instance" "main" {
  cluster_identifier = aws_rds_cluster.main.id
  instance_class     = var.environment == "prod" ? "db.r6g.xlarge" : "db.t4g.medium"
  engine              = aws_rds_cluster.main.engine
  engine_version      = aws_rds_cluster.main.engine_version

  performance_insights_enabled = var.environment == "prod"

  tags = {
    Name = "${var.app_name}-db-instance"
  }
}

resource "random_password" "db_password" {
  length  = 32
  special = true
}

resource "aws_secretsmanager_secret" "db_password" {
  name_prefix             = "${var.app_name}-db-password-"
  recovery_window_in_days = 7
}

resource "aws_secretsmanager_secret_version" "db_password" {
  secret_id      = aws_secretsmanager_secret.db_password.id
  secret_string  = random_password.db_password.result
}

# ==========================================
# ELASTICACHE (REDIS)
# ==========================================

resource "aws_elasticache_subnet_group" "main" {
  name       = "${var.app_name}-cache-subnet-group"
  subnet_ids = [aws_subnet.private_1.id, aws_subnet.private_2.id]
}

resource "aws_security_group" "cache" {
  name   = "${var.app_name}-cache-sg"
  vpc_id = aws_vpc.main.id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_elasticache_replication_group" "main" {
  replication_group_description = "${var.app_name} Redis cluster"
  engine                        = "redis"
  engine_version                = "7.1"
  node_type                     = var.environment == "prod" ? "cache.r7g.xlarge" : "cache.t4g.micro"
  num_cache_clusters            = var.environment == "prod" ? 3 : 1
  parameter_group_name          = "default.redis7"
  port                          = 6379
  subnet_group_name             = aws_elasticache_subnet_group.main.name
  security_group_ids            = [aws_security_group.cache.id]
  automatic_failover_enabled    = var.environment == "prod"
  multi_az_enabled              = var.environment == "prod"
  
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  auth_token                 = random_password.redis_auth_token.result

  tags = {
    Name = "${var.app_name}-redis"
  }
}

resource "random_password" "redis_auth_token" {
  length  = 32
  special = false # Redis auth token doesn't support all special chars
}

# ==========================================
# ECS CLUSTER
# ==========================================

resource "aws_ecs_cluster" "main" {
  name = "${var.app_name}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name = "${var.app_name}-cluster"
  }
}

# ==========================================
# CLOUDWATCH LOG GROUP
# ==========================================

resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/ecs/${var.app_name}"
  retention_in_days = var.environment == "prod" ? 30 : 7

  tags = {
    Name = "${var.app_name}-ecs-logs"
  }
}

# ==========================================
# OUTPUTS
# ==========================================

output "rds_endpoint" {
  value       = aws_rds_cluster.main.endpoint
  description = "RDS Cluster endpoint"
}

output "redis_endpoint" {
  value       = aws_elasticache_replication_group.main.configuration_endpoint_address
  description = "Redis cluster endpoint"
}

output "ecs_cluster_name" {
  value       = aws_ecs_cluster.main.name
  description = "ECS cluster name"
}

output "db_password_secret_arn" {
  value       = aws_secretsmanager_secret.db_password.arn
  description = "Database password secret ARN"
  sensitive   = true
}

EOF

echo "✅ Terraform configuration generated!"
echo ""
echo "📋 Next steps:"
echo "1. Review the configuration: cat terraform/main.tf"
echo "2. Initialize terraform: cd terraform && terraform init"
echo "3. Plan deployment: terraform plan -var=\"environment=$ENVIRONMENT\" -var=\"aws_region=$REGION\""
echo "4. Apply configuration: terraform apply"
echo ""
echo "⏱️  Deployment typically takes 15-20 minutes"
echo ""

cd ..

