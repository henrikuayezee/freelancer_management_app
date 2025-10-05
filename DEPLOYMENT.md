# Deployment Guide

This guide will help you deploy the AyaData Freelancer Platform to production.

## Prerequisites

1. GitHub account (you already have this!)
2. Railway account (for backend + database)
3. Vercel account (for frontend)
4. SendGrid account (for emails - optional for testing)

---

## Part 1: Deploy Backend to Railway

### Step 1: Create Railway Account
1. Go to https://railway.app
2. Sign up with your GitHub account
3. Click "New Project"

### Step 2: Deploy Backend
1. Click "Deploy from GitHub repo"
2. Select your repository
3. Select the `backend` folder as the root directory
4. Railway will auto-detect it's a Node.js app

### Step 3: Add PostgreSQL Database
1. In your Railway project, click "+ New"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically create a database and set `DATABASE_URL` environment variable

### Step 4: Set Environment Variables
In Railway project settings → Variables, add these:

```
NODE_ENV=production
PORT=3000
JWT_SECRET=<generate-a-strong-random-string>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=<your-vercel-url-will-add-later>
BACKEND_URL=<your-railway-backend-url>
ALLOWED_ORIGINS=<your-vercel-url-will-add-later>
SENDGRID_API_KEY=<your-sendgrid-key>
SENDGRID_FROM_EMAIL=noreply@ayadata.com
SENDGRID_FROM_NAME=AyaData - Freelancer Platform
```

**Note:** Railway automatically sets `DATABASE_URL` for you!

### Step 5: Deploy
1. Click "Deploy" in Railway
2. Wait for deployment to complete
3. Copy your backend URL (e.g., `https://freelancer-platform-production.up.railway.app`)

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Create Vercel Account
1. Go to https://vercel.com
2. Sign up with your GitHub account

### Step 2: Deploy Frontend
1. Click "Add New" → "Project"
2. Import your GitHub repository
3. Select the repository
4. **Important:** Set Root Directory to `frontend`
5. Framework Preset: Vite (should auto-detect)
6. Click "Deploy"

### Step 3: Set Environment Variable
In Vercel project settings → Environment Variables, add:

```
VITE_API_URL=<your-railway-backend-url>
```

Example: `VITE_API_URL=https://freelancer-platform-production.up.railway.app`

### Step 4: Redeploy
1. Go to Deployments tab
2. Click "Redeploy" to apply the environment variable
3. Copy your frontend URL (e.g., `https://freelancer-platform.vercel.app`)

---

## Part 3: Update Backend with Frontend URL

### Go back to Railway:
1. Update these environment variables:
   - `FRONTEND_URL=<your-vercel-url>`
   - `ALLOWED_ORIGINS=<your-vercel-url>`
2. Redeploy the backend

---

## Part 4: Create Your First Admin User

### Option A: Using Railway CLI
1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`
3. Link project: `railway link`
4. Run seed: `railway run npm run db:seed`

### Option B: Using Database Console
1. Go to Railway → PostgreSQL → Data tab
2. Run this SQL:

```sql
INSERT INTO "User" (id, email, password, role, "isActive", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'admin@ayadata.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyJ8QVPo2GBu', -- password: Admin123!
  'ADMIN',
  true,
  NOW(),
  NOW()
);

INSERT INTO "AdminProfile" (id, "userId", "firstName", "lastName", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  (SELECT id FROM "User" WHERE email = 'admin@ayadata.com'),
  'System',
  'Administrator',
  NOW(),
  NOW()
);
```

Default credentials:
- Email: `admin@ayadata.com`
- Password: `Admin123!`

---

## Testing Your Deployment

1. Visit your Vercel URL
2. Try logging in with admin credentials
3. Create a test application as a freelancer
4. Approve/reject applications

---

## Troubleshooting

### Backend won't start
- Check Railway logs for errors
- Verify all environment variables are set
- Ensure DATABASE_URL is set by Railway

### Frontend can't connect to backend
- Check VITE_API_URL is correct
- Verify CORS settings in backend
- Check Railway backend logs

### Database migrations failed
- Railway runs migrations automatically on deploy
- Check logs for migration errors
- You can manually run: `railway run npm run db:migrate:deploy`

---

## Important Notes

1. **Database:** Railway PostgreSQL is production-ready
2. **File Storage:** If you add file uploads later, use AWS S3 or Cloudinary
3. **Monitoring:** Enable Railway metrics and Vercel analytics
4. **Custom Domain:** You can add custom domains in both Railway and Vercel settings
5. **Costs:**
   - Vercel: Free for hobby projects
   - Railway: Free $5/month credit (should be enough for small projects)

---

## Next Steps

1. Set up custom domain (optional)
2. Configure SendGrid for production emails
3. Enable monitoring and logging
4. Set up CI/CD for automatic deployments
5. Add error tracking (Sentry)

Need help? Check:
- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Prisma Docs: https://www.prisma.io/docs
