# GG LOOP EMPIRE - AWS DEPLOYMENT

**Status:** TEMPLATE READY - Not yet provisioned  
**Purpose:** Future cloud deployment when ready to scale beyond homelab

## Infrastructure Overview

This directory contains AWS-ready deployment templates for GG Loop Empire:

- **Environment:** AWS (EC2, ECS Fargate, or Lightsail options)
- **Deployment Method:** Docker Compose on EC2 OR ECS/Fargate containers
- **CI/CD:** GitHub Actions pipeline (manual trigger)
- **Estimated Cost:** $50-150/month depending on scale

## Files in This Directory

```
infra/aws/
├── README.md                      # This file
├── docker-compose.aws.yml          # Docker Compose for EC2 deployment
├── ecs-task-definition.json       # ECS/Fargate task definition (alternative)
├── terraform/                      # IaC for AWS resources (optional)
│   ├── main.tf
│   ├── variables.tf
│   └── outputs.tf
└── .github/workflows/
    └── deploy-aws.yml              # CI/CD pipeline
```

## Deployment Options

### Option A: Docker Compose on EC2 (Recommended for start)

**Pros:**
- Familiar Docker Compose workflow
- Easy to migrate from homelab
- Full control over server

**Steps:**
1. Launch EC2 instance (t3.medium or larger)
2. Install Docker + Docker Compose
3. Clone repo
4. Copy `.env.aws` and fill in secrets
5. Run: `docker-compose -f infra/aws/docker-compose.aws.yml up -d`

**Cost:** ~$30-50/month (EC2 instance + data transfer)

### Option B: ECS Fargate (Serverless containers)

**Pros:**
- No server management
- Auto-scaling built-in
- AWS-native monitoring

**Steps:**
1. Push Docker images to ECR
2. Create ECS cluster
3. Deploy task definition: `ecs-task-definition.json`
4. Configure load balancer + Route53

**Cost:** ~$80-150/month (Fargate compute + RDS + ElastiCache)

### Option C: AWS Lightsail (Simplified)

**Pros:**
- Fixed pricing
- Simplified AWS interface

**Steps:**
1. Create Lightsail container service
2. Push images
3. Deploy via Lightsail console

**Cost:** ~$40-80/month fixed

## CI/CD Pipeline

GitHub Actions workflow: `.github/workflows/deploy-aws.yml`

**Trigger:** Manual or on `release/*` tags

**Steps:**
1. Build Docker images
2. Push to Amazon ECR
3. Update ECS task definition OR SSH to EC2 and redeploy
4. Run health checks
5. Notify on Slack/Discord (optional)

## Environment Variables

Copy from `.env.homelab` and add AWS-specific:

```bash
# AWS-specific
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=123456789012

# Use AWS RDS instead of local PostgreSQL
DATABASE_URL=postgresql://user:pass@gg-loop-db.abcdef.us-east-1.rds.amazonaws.com:5432/ggloop

# Use AWS ElastiCache instead of local Redis
REDIS_URL=redis://gg-loop-cache.abcdef.0001.use1.cache.amazonaws.com:6379

# CloudWatch logging
CLOUDWATCH_LOG_GROUP=/aws/ecs/gg-loop
```

## Pre-Deployment Checklist

Before deploying to AWS:

- [ ] AWS Account created
- [ ] IAM user with appropriate permissions
- [ ] AWS CLI configured locally
- [ ] Docker images tested locally
- [ ] Environment variables prepared
- [ ] Domain DNS pointed to AWS (Route53 or manual)
- [ ] SSL certificates ready (ACM or Let's Encrypt)
- [ ] Backup strategy defined
- [ ] Monitoring dashboards configured
- [ ] Cost alerts set in AWS Billing

## Cost Estimate

**Minimal Setup (EC2 + RDS):**
- EC2 t3.medium: $30/mo
- RDS db.t3.micro PostgreSQL: $15/mo
- ElastiCache t3.micro Redis: $12/mo
- Data transfer: ~$5-10/mo
- **Total:** ~$60-70/month

**Production Setup (ECS Fargate + RDS):**
- Fargate tasks (4 vCPU, 8 GB): $80-100/mo
- RDS db.t3.small: $30/mo
- ElastiCache t3.small: $25/mo
- ALB + data transfer: ~$20/mo
- **Total:** ~$150-175/month

## When to Move from Homelab to AWS

Consider migrating when:

1. **Traffic exceeds homelab capacity** (>10k daily users)
2. **99.9% uptime required** (SLA guarantees)
3. **Global CDN needed** (CloudFront)
4. **Auto-scaling required** (ECS/Fargate)
5. **Compliance mandates** (HIPAA, SOC 2)
6. **Team collaboration** (multiple developers need access)

## Support

For AWS deployment assistance:
- AWS Documentation: https://aws.amazon.com/getting-started/
- ECS Guide: https://docs.aws.amazon.com/ecs/
- Terraform AWS Provider: https://registry.terraform.io/providers/hashicorp/aws/

---

**Current Status:** Templates ready, not yet deployed  
**Next Step:** When ready, fill in AWS credentials and run deployment script
