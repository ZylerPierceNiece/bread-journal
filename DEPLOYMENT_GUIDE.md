# Deployment Guide for Bread Rating Platform

## Prerequisites
- GitHub account
- Railway account (sign up at railway.app)
- Vercel account (sign up at vercel.com)

## Part 1: Push to GitHub

1. Create a new repository on GitHub (https://github.com/new)
   - Name it "bread-rating-platform" or similar
   - Make it public or private (your choice)
   - DO NOT initialize with README (we already have one)

2. Copy the commands GitHub shows you for "push an existing repository":
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git branch -M main
   git push -u origin main
   ```

## Part 2: Deploy Backend to Railway

### 2.1: Create Railway Project

1. Go to https://railway.app and sign in
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your bread-rating-platform repository
5. Railway will detect it's a Node.js app

### 2.2: Add PostgreSQL Database

1. In your Railway project, click "+ New"
2. Select "Database" → "PostgreSQL"
3. Railway will create a database and provide a `DATABASE_URL`

### 2.3: Configure Backend Service

1. Click on your backend service
2. Go to "Settings" → "Root Directory" and set it to: `server`
3. Go to "Variables" tab and add these environment variables:

```
DATABASE_URL=<automatically set by Railway from PostgreSQL>
JWT_SECRET=6ccca18e119e7d5a4326119b76f8922bc596d7c01aed893e2fcf6ad8543564193141f59a54d78e7a16f43263a9b91b1c7899846cd61b7c37717f0f5b970d4b3f
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=3000
CLIENT_URL=<you'll get this from Vercel in step 3>
```

4. Railway will automatically deploy when you push to GitHub

### 2.4: Get Backend URL

1. Go to "Settings" → "Networking"
2. Click "Generate Domain"
3. Copy the URL (like `https://your-app.railway.app`)
4. Save this - you'll need it for the frontend!

## Part 3: Deploy Frontend to Vercel

### 3.1: Create Vercel Project

1. Go to https://vercel.com and sign in
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `dist` (default)

### 3.2: Set Environment Variables

In the "Environment Variables" section, add:

```
VITE_API_URL=<your Railway backend URL from step 2.4>
```

### 3.3: Deploy

1. Click "Deploy"
2. Wait for deployment to complete (~2 minutes)
3. You'll get a URL like `https://your-app.vercel.app`

## Part 4: Connect Frontend to Backend

### 4.1: Update Backend CORS

1. Go back to Railway
2. Update the `CLIENT_URL` environment variable to your Vercel URL:
   ```
   CLIENT_URL=https://your-app.vercel.app
   ```
3. Railway will automatically redeploy

### 4.2: Update Frontend API Calls

You need to update your frontend to use the environment variable for API calls.

**Current:** API calls use `/api/...` (works locally with Vite proxy)

**For Production:** Need to create a vite.config.js that handles this

## Part 5: Test Your Deployment

1. Visit your Vercel URL
2. Try to sign up for a new account
3. Post a bread
4. Test following users
5. Test messaging

## Troubleshooting

### Backend won't start
- Check Railway logs for errors
- Verify DATABASE_URL is set
- Ensure JWT_SECRET is set

### Frontend can't connect to backend
- Check CORS settings (CLIENT_URL matches Vercel URL)
- Verify VITE_API_URL is set correctly
- Check browser console for errors

### Database errors
- Ensure PostgreSQL service is running in Railway
- Check if migrations ran (check Railway logs)

## Production JWT Secret

Your production JWT secret is:
```
6ccca18e119e7d5a4326119b76f8922bc596d7c01aed893e2fcf6ad8543564193141f59a54d78e7a16f43263a9b91b1c7899846cd61b7c37717f0f5b970d4b3f
```

**IMPORTANT:** Never commit this to Git! It's only in Railway environment variables.

## Ongoing Development

After deployment, your workflow will be:

1. Make changes locally
2. Test locally
3. Commit: `git add . && git commit -m "Your message"`
4. Push: `git push`
5. Railway and Vercel automatically redeploy!

## Need Help?

- Railway docs: https://docs.railway.app
- Vercel docs: https://vercel.com/docs
- PostgreSQL docs: https://www.postgresql.org/docs
