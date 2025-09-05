# Environment Setup for IndiCentral

## Quick Setup

Run the setup script to automatically create your `.env.local` file:

```bash
./setup-env.sh
```

## Manual Setup

If you prefer to set up manually, create a `.env.local` file in the root directory with the following content:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://127.0.0.1:1339
NEXT_PUBLIC_BASE_URL=http://127.0.0.1:3003

# Production URLs (override these in production)
API_URL=http://127.0.0.1:1339
BASE_URL=http://127.0.0.1:3003
BASE_URL_INDI=http://127.0.0.1:3003

# AWS S3 Configuration
AWS_BUCKET=indi-strapi-v2
AWS_BUCKET_URL=https://indi-strapi-v2.s3.us-east-1.amazonaws.com

# Cloudflare Configuration
CLOUDFLARE_API_TOKEN=your_cloudflare_token_here
CLOUDFLARE_ZONE_ID=your_cloudflare_zone_id_here

# Maintenance Mode
MAINTENANCE_MODE=false
MAINTENANCE_END_TIME="Monday, March 3 (5:00 am, MNT). Thank you"
```

## Environment Variables Reference

### API Configuration

- `NEXT_PUBLIC_API_URL`: Strapi backend API URL (accessible on client-side)
- `NEXT_PUBLIC_BASE_URL`: Frontend application URL (accessible on client-side)
- `API_URL`: Server-side API URL (fallback to NEXT_PUBLIC_API_URL)
- `BASE_URL`: Server-side base URL (fallback to NEXT_PUBLIC_BASE_URL)
- `BASE_URL_INDI`: Additional base URL for Indi-specific services

### AWS S3 Configuration

- `AWS_BUCKET`: S3 bucket name for file storage
- `AWS_BUCKET_URL`: S3 bucket URL for accessing stored files

### Cloudflare Configuration

- `CLOUDFLARE_API_TOKEN`: API token for Cloudflare operations
- `CLOUDFLARE_ZONE_ID`: Zone ID for your Cloudflare domain

### Maintenance Mode

- `MAINTENANCE_MODE`: Set to `true` to enable maintenance mode
- `MAINTENANCE_END_TIME`: Message displayed during maintenance

## Production Configuration

For production deployment, update these environment variables:

```bash
# Production URLs
NEXT_PUBLIC_API_URL=https://axiomapi.herokuapp.com
NEXT_PUBLIC_BASE_URL=https://indicentral.ca
API_URL=https://axiomapi.herokuapp.com
BASE_URL=https://indicentral.ca
BASE_URL_INDI=https://indicentral.ca

# Update Cloudflare tokens with production values
CLOUDFLARE_API_TOKEN=your_production_token
CLOUDFLARE_ZONE_ID=your_production_zone_id
```

## Maintenance Mode

To enable maintenance mode:

1. Set `MAINTENANCE_MODE=true` in your environment file
2. Update `MAINTENANCE_END_TIME` with appropriate message
3. Restart your application

When maintenance mode is active:

- All routes redirect to `/maintenance` page
- Only essential assets and the maintenance page are accessible
- Custom maintenance message is displayed to users

## Features from Legacy Configuration

This setup replicates all functionality from the legacy project:

✅ **Environment-based API URLs** (dev vs production)
✅ **Git hash build IDs** for cache busting
✅ **Image optimization** with S3 domains
✅ **PDF file handling** via webpack
✅ **Maintenance mode** with automatic redirects
✅ **Cache control headers** for documents and static files
✅ **Security headers** for sensitive routes
✅ **AWS S3 integration** for file storage
✅ **Cloudflare integration** for CDN and DNS management

## Modern Improvements

- **TypeScript Configuration**: Fully typed environment variables
- **Middleware**: Modern NextJS 15 middleware for maintenance mode
- **Better Security**: Additional security headers for document routes
- **Type Safety**: Environment utility with validation
- **Easy Setup**: Automated setup script for quick configuration
