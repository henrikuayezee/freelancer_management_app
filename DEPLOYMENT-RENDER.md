# Deployment Guide - Render.com (FREE)

This guide will help you deploy the AyaData Freelancer Platform to production using **Render.com** (100% FREE tier).

## Why Render?

- ✅ **Completely FREE** tier (750 hours/month - enough for one app running 24/7)
- ✅ **Free PostgreSQL** database included
- ✅ **Auto-deploy** from GitHub
- ✅ Easy setup, similar to Railway
- ⚠️ Free tier apps sleep after 15 mins of inactivity (wakes up on first request)

---

## Prerequisites

1. ✅ GitHub account (you already have this!)
2. ✅ GitHub repository pushed (you already did this!)
3. 🆕 Render.com account (we'll create this)

---

## Part 1: Deploy to Render (10 minutes)

### Step 1: Create Render Account

1. Go to https://render.com
2. Click **"Get Started for Free"**
3. Sign up with your **GitHub account** (easiest option)
4. Authorize Render to access your GitHub repositories

### Step 2: Deploy Your App with Blueprint

Since I created a `render.yaml` file in your repo, Render will auto-detect everything!

1. **On Render Dashboard**, click **"New +"** button
2. Select **"Blueprint"**
3. Connect your GitHub repository: **`henrikuayezee/freelancer_management_app`**
4. Render will detect the `render.yaml` file
5. Click **"Apply"**

Render will automatically:
- ✅ Create your backend service
- ✅ Create PostgreSQL database
- ✅ Link them together
- ✅ Set up environment variables
- ✅ Deploy your app

### Step 3: Wait for Deployment (2-3 minutes)

1. You'll see a dashboard with:
   - **freelancer-backend** (your API)
   - **freelancer-db** (your database)
2. Wait for both to show **"Live"** status (green)
3. Click on **"freelancer-backend"** to see your service

### Step 4: Get Your Backend URL

1. On the backend service page, look for the URL at the top
2. It will look like: `https://freelancer-backend.onrender.com`
3. **Copy this URL** - you'll need it for the frontend!

### Step 5: Set Additional Environment Variables

The `render.yaml` sets most variables, but you need to add:

1. In your **freelancer-backend** service, click **"Environment"** tab
2. Add these variables:

```
FRONTEND_URL = <leave-blank-for-now>
BACKEND_URL = <your-render-backend-url>
ALLOWED_ORIGINS = <leave-blank-for-now>
```

For SendGrid (optional for now):
```
SENDGRID_API_KEY = <your-sendgrid-key-if-you-have-one>
```

3. Click **"Save Changes"** - Render will auto-redeploy

---

## Part 2: Deploy Frontend to Vercel (5 minutes)

### Step 1: Create Vercel Account

1. Go to https://vercel.com
2. Click **"Sign Up"**
3. Sign up with your **GitHub account**

### Step 2: Deploy Frontend

1. Click **"Add New..."** → **"Project"**
2. Import your GitHub repository: **`henrikuayezee/freelancer_management_app`**
3. **IMPORTANT:** Configure these settings:
   - **Framework Preset:** Vite (should auto-detect)
   - **Root Directory:** Click "Edit" → Enter **`frontend`**
   - **Build Command:** `npm run build` (should be default)
   - **Output Directory:** `dist` (should be default)

4. **Add Environment Variable:**
   - Click **"Environment Variables"**
   - Add:
     - **Name:** `VITE_API_URL`
     - **Value:** `<your-render-backend-url>` (from Step 4 above)
     - Example: `https://freelancer-backend.onrender.com`

5. Click **"Deploy"**

### Step 3: Get Your Frontend URL

1. Wait for deployment to complete (1-2 minutes)
2. Vercel will show your live URL
3. It will look like: `https://freelancer-platform.vercel.app`
4. **Copy this URL**

---

## Part 3: Update Backend with Frontend URL (2 minutes)

Now we need to tell the backend where the frontend is (for CORS):

1. Go back to **Render.com**
2. Click on your **freelancer-backend** service
3. Go to **"Environment"** tab
4. Update these variables with your Vercel URL:

```
FRONTEND_URL = https://freelancer-platform.vercel.app
ALLOWED_ORIGINS = https://freelancer-platform.vercel.app
```

5. Click **"Save Changes"**
6. Render will auto-redeploy (takes 1-2 minutes)

---

## Part 4: Create Your First Admin User

### Option A: Using Render Shell (Easiest)

1. Go to your **freelancer-backend** service on Render
2. Click **"Shell"** tab (in the top menu)
3. Wait for the shell to connect
4. Run this command:

```bash
npx prisma db seed
```

This creates:
- **Email:** `admin@ayadata.com`
- **Password:** `Admin123!`

### Option B: Using Database Console

1. Go to your **freelancer-db** database on Render
2. Click **"Connect"** → **"External Connection"**
3. Use a PostgreSQL client (like pgAdmin or DBeaver) to connect
4. Run this SQL:

```sql
-- Create admin user
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

-- Create admin profile
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
- **Email:** `admin@ayadata.com`
- **Password:** `Admin123!`

---

## Part 5: Test Your Deployment! 🎉

1. **Visit your Vercel URL** (e.g., `https://freelancer-platform.vercel.app`)
2. You should see the AyaData login page
3. **Log in** with:
   - Email: `admin@ayadata.com`
   - Password: `Admin123!`
4. Try creating a test application as a freelancer
5. Approve/reject applications from the admin panel

---

## Troubleshooting

### Backend won't start
- Check Render logs: Click service → "Logs" tab
- Verify DATABASE_URL is set automatically by Render
- Check if migrations ran successfully

### Frontend can't connect to backend
- Verify `VITE_API_URL` in Vercel matches your Render URL
- Check `ALLOWED_ORIGINS` in Render backend includes your Vercel URL
- Check Render backend logs for CORS errors

### Database connection failed
- Render automatically connects database
- Check if `freelancer-db` is "Live"
- Verify DATABASE_URL is set in backend environment variables

### App is slow on first request
- This is normal for Render free tier
- Apps sleep after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds to wake up
- Subsequent requests are fast

---

## Important Notes

### Free Tier Limitations

**Render Free Tier:**
- ✅ 750 hours/month (enough for one app 24/7)
- ✅ Free PostgreSQL database (1GB storage)
- ⚠️ Apps sleep after 15 mins inactivity
- ⚠️ Slower performance than paid tier

**Vercel Free Tier:**
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Always fast (no sleeping)
- ✅ Perfect for frontend apps

### Keeping Your App Awake (Optional)

If you want your backend to stay awake:

1. Use a free uptime monitor like **UptimeRobot**:
   - Sign up at https://uptimerobot.com
   - Add your backend URL
   - Set to ping every 5 minutes
   - This keeps your app awake!

2. Or upgrade to Render's **Starter plan** ($7/month) for always-on

---

## Next Steps

### Essential
1. ✅ **Change admin password** after first login
2. ✅ **Set up SendGrid** for production emails
3. ✅ **Test the application** thoroughly

### Optional (Recommended)
1. Add custom domain (available on both Render and Vercel free tiers)
2. Enable Render metrics and logs monitoring
3. Set up UptimeRobot to keep app awake
4. Configure Vercel Analytics
5. Add error tracking (Sentry has free tier)

### Future Enhancements
1. Set up CI/CD for automated testing
2. Add staging environment
3. Configure database backups
4. Set up monitoring and alerts

---

## Cost Breakdown

| Service | Cost |
|---------|------|
| Render (Backend + Database) | **FREE** |
| Vercel (Frontend) | **FREE** |
| Total Monthly Cost | **$0** 🎉 |

Optional paid services:
- Render Starter (no sleeping): $7/month
- SendGrid (emails): Free tier available (100 emails/day)
- Custom domain: ~$12/year

---

## Support

- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **Prisma Docs:** https://www.prisma.io/docs

---

## Summary

You now have:
- ✅ Backend API running on Render (free)
- ✅ PostgreSQL database on Render (free)
- ✅ Frontend on Vercel (free)
- ✅ Automatic deployments from GitHub
- ✅ Production-ready application

**Your app is LIVE!** 🚀
