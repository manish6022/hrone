# Pammi Greenland - Environment Configuration Guide

## Environment Variables Setup

### 1. Development (.env.local)

Copy from `.env.example` and customize for local development:

```bash
cp .env.example .env.local
```

### 2. Production Deployment

#### For Render.com (Current Deployment)

Set these environment variables in your Render dashboard:

**Environment Variables:**

```
NEXT_PUBLIC_API_URL=https://hrone-69dz.onrender.com
NEXT_PUBLIC_COOKIE_EXPIRES_DAYS=30
NEXT_PUBLIC_TOKEN_CHECK_INTERVAL_MINUTES=2
NODE_ENV=production
```

**Steps:**

1. Go to your Render dashboard
2. Select your Pammi Greenland service
3. Go to "Environment"
4. Add the variables listed above

#### For Other Platforms

**Vercel:**

```bash
vercel env add NEXT_PUBLIC_API_URL
vercel env add NEXT_PUBLIC_COOKIE_EXPIRES_DAYS
vercel env add NEXT_PUBLIC_TOKEN_CHECK_INTERVAL_MINUTES
```

**Netlify:**

Add to `build & deploy > environment variables` in Netlify dashboard.

### 3. Environment Files

- `.env.example` - Documentation (committed to git)
- `.env.local` - Local development (ignored by git)
- `.env.production` - Production reference (committed to git)
- Platform-specific env vars set in deployment dashboard

### 4. Variable Explanations

| Variable                           | Purpose                      | Default    | Production |
|------------------------------------|------------------------------|------------|------------|
| `NEXT_PUBLIC_API_URL`             | Backend API endpoint        | localhost  | Render URL |
| `NEXT_PUBLIC_COOKIE_EXPIRES_DAYS` | Session duration            | 7          | 30         |
| `NEXT_PUBLIC_TOKEN_CHECK_INTERVAL_MINUTES` | Token validation frequency | 5          | 2          |
| `NODE_ENV`                        | Environment mode            | development| production |

## Security Notes

- Never commit `.env.local` or `.env.*.local` files
- Use platform environment variables for sensitive data
- `NEXT_PUBLIC_*` variables are exposed to the browser
- Server-side variables (without `NEXT_PUBLIC_`) are not exposed
