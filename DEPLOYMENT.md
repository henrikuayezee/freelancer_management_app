# Deployment Guide - Render.com

This guide will help you deploy the AyaData Freelancer Platform to Render.com (100% FREE).

## Why Render?

✅ **Free Forever Plan** - Unlike Railway (30 days trial), Render offers a permanent free tier
✅ **PostgreSQL Database** - Free PostgreSQL database included
✅ **Static Site Hosting** - Free frontend hosting with global CDN
✅ **Auto-deploy from GitHub** - Automatic deployments on every push

---

## Prerequisites

1. GitHub account (you already have this!)
2. Render.com account (free)
3. SendGrid account (optional, for emails)

---

## Deployment Steps

### Step 1: Create Render Account

1. Go to https://render.com
2. Click **"Get Started for Free"**
3. Sign up with your GitHub account
4. Verify your email

### Step 2: Deploy Using render.yaml (Automatic!)

Your project already has a `render.yaml` file configured. This makes deployment super easy:

1. **In Render Dashboard:**
   - Click **"New +"** → **"Blueprint"**
   - Connect your GitHub account if not already connected
   - Select your repository: `Freelancer Platform`
   - Render will automatically detect the `render.yaml` file
   - Click **"Apply"**

2. **Render will automatically create:**
   - ✅ PostgreSQL database (`freelancer-db`)
   - ✅ Backend API service (`freelancer-backend`)
   - ✅ Frontend static site (`freelancer-platform-frontend`)

3. **Wait for deployment:**
   - Database: ~2 minutes
   - Backend: ~3-5 minutes (includes migrations)
   - Frontend: ~2-3 minutes

### Step 3: Update URLs (Important!)

After deployment, you'll get actual URLs. You need to update them:

1. **Get your actual URLs from Render:**
   - Backend: `https://freelancer-backend-XXXX.onrender.com`
   - Frontend: `https://freelancer-platform-frontend-XXXX.onrender.com`

2. **Update Backend Environment Variables:**
   - Go to `freelancer-backend` → **Environment**
   - Update these variables with your actual URLs:
     ```
     FRONTEND_URL=https://freelancer-platform-frontend-XXXX.onrender.com
     BACKEND_URL=https://freelancer-backend-XXXX.onrender.com
     ALLOWED_ORIGINS=https://freelancer-platform-frontend-XXXX.onrender.com
     ```
   - Click **"Save Changes"** (backend will auto-redeploy)

3. **Update Frontend Environment Variable:**
   - Go to `freelancer-platform-frontend` → **Environment**
   - Update:
     ```
     VITE_API_URL=https://freelancer-backend-XXXX.onrender.com
     ```
   - Click **"Save Changes"** (frontend will auto-redeploy)

### Step 4: Optional - Add SendGrid for Emails

1. **Get SendGrid API Key:**
   - Sign up at https://sendgrid.com (free tier: 100 emails/day)
   - Create an API key
   - Copy the key

2. **Update Backend Environment:**
   - Go to `freelancer-backend` → **Environment**
   - Update `SENDGRID_API_KEY` with your actual key
   - Save changes

### Step 5: Create Your First Admin User

**Option A: Using Render Shell (Recommended)**

1. Go to `freelancer-backend` service
2. Click **"Shell"** tab
3. Run these commands:
   ```bash
   cd /opt/render/project/src/backend
   npm run db:seed
   ```

**Option B: Using PostgreSQL Console**

1. Go to `freelancer-db` database
2. Click **"Connect"** → **"PSQL Command"**
3. Copy and run locally, or use **"Web Shell"**
4. Run this SQL:
   ```sql
   INSERT INTO "User" (id, email, password, role, "isActive", "createdAt", "updatedAt")
   VALUES (
     gen_random_uuid(),
     'admin@ayadata.com',
     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyJ8QVPo2GBu',
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

**Default Admin Credentials:**
- Email: `admin@ayadata.com`
- Password: `Admin123!`

---

## Testing Your Deployment

1. Visit your frontend URL
2. Click **"Login"**
3. Use admin credentials above
4. Create a test application as a freelancer
5. Approve/reject applications

---

## Important URLs

After deployment, save these URLs:

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | https://freelancer-platform-frontend-XXXX.onrender.com | User interface |
| Backend API | https://freelancer-backend-XXXX.onrender.com | API server |
| Database | (Internal only) | PostgreSQL |

---

## Troubleshooting

### Backend won't start
- Check **Logs** tab in Render dashboard
- Verify all environment variables are set
- Ensure database is running
- Check if migrations ran successfully

### Frontend shows blank page
- Check browser console for errors
- Verify `VITE_API_URL` is set correctly
- Check if backend is running

### Database connection errors
- Render automatically sets `DATABASE_URL`
- Check if database is in "Available" status
- Try redeploying backend

### CORS errors
- Verify `ALLOWED_ORIGINS` matches your frontend URL exactly
- No trailing slashes in URLs
- Must use HTTPS (not HTTP)

---

## Free Tier Limitations

**Render Free Tier includes:**
- ✅ Unlimited static sites (frontend)
- ✅ Web services that spin down after 15 min of inactivity
- ✅ 90-day PostgreSQL database retention
- ✅ 750 hours/month free (enough for 1 service 24/7)

**Important Notes:**
1. **Backend will sleep after 15 min of inactivity** - First request will be slow (~30 seconds)
2. **Database is free but deleted after 90 days of inactivity** - Keep backups!
3. **No custom domains on free tier** - Use Render subdomains

---

## Keeping Your Backend Awake (Optional)

Use a free uptime monitor to ping your backend every 10 minutes:

1. **UptimeRobot** (free): https://uptimerobot.com
2. **Cron-job.org** (free): https://cron-job.org
3. Set URL: `https://freelancer-backend-XXXX.onrender.com/health`
4. Interval: Every 10 minutes

---

## Updating Your App

**Automatic Deployments:**
- Every `git push` to `master` branch triggers auto-deploy
- Backend and frontend deploy independently
- Database migrations run automatically

**Manual Deploy:**
- Go to service → **"Manual Deploy"** → **"Clear build cache & deploy"**

---

## Next Steps

1. ✅ Change admin password after first login
2. ✅ Configure SendGrid for production emails
3. ✅ Set up uptime monitoring (optional)
4. ✅ Add custom domain (paid feature)
5. ✅ Enable Render metrics and logs

---

## Cost Breakdown

| Service | Cost |
|---------|------|
| Frontend (Static) | **$0/month** (Free forever) |
| Backend (Web Service) | **$0/month** (Free tier) |
| PostgreSQL Database | **$0/month** (Free tier, 90-day retention) |
| **TOTAL** | **$0/month** |

---

## Support & Documentation

- Render Docs: https://render.com/docs
- Render Community: https://community.render.com
- Prisma Docs: https://www.prisma.io/docs
- Project GitHub: [Your repo URL]

---

## Upgrading to Paid (Optional)

If you need more power:

| Feature | Free | Starter ($7/mo) |
|---------|------|-----------------|
| Always-on backend | ❌ (sleeps) | ✅ 24/7 |
| Database retention | 90 days | Forever |
| Custom domains | ❌ | ✅ |
| Build minutes | 750/mo | Unlimited |

---

**🎉 Congratulations! Your app is now live on Render.com for FREE!**
