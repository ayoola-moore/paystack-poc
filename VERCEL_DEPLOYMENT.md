# 🚀 Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install globally
   ```bash
   npm install -g vercel
   ```

## 📋 Pre-Deployment Checklist

- ✅ Vercel configuration files created
- ✅ API routes set up for serverless functions
- ✅ Environment variables configured
- ✅ Frontend build process optimized
- ✅ CORS settings updated for production

## 🔧 Environment Variables Setup

After deployment, you'll need to set these environment variables in your Vercel dashboard:

### Required Environment Variables:
```
PAYSTACK_SECRET_KEY=sk_test_d00a4f49db0448de14a9249050744e39b62e98ae
PAYSTACK_PUBLIC_KEY=pk_test_bf5c91ee31fddce94001cbdf51b7cee4ff80189f
NODE_ENV=production
```

## 🚀 Deployment Steps

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Login to Vercel**:
   ```bash
   vercel login
   ```

2. **Deploy from project root**:
   ```bash
   cd /Users/ayoolamoore/htdocs/paystack-poc
   vercel
   ```

3. **Follow the prompts**:
   - Link to existing project? `N`
   - Project name: `paystack-poc-grundy`
   - Directory: `./` (current directory)
   - Override settings? `N`

4. **Set environment variables**:
   ```bash
   vercel env add PAYSTACK_SECRET_KEY
   vercel env add PAYSTACK_PUBLIC_KEY
   vercel env add NODE_ENV
   ```

5. **Deploy to production**:
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via Git Integration

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "feat: add Vercel deployment configuration"
   git push origin main
   ```

2. **Connect in Vercel Dashboard**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Configure build settings (should auto-detect)

3. **Add Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add the required variables listed above

## 📁 Project Structure for Vercel

```
paystack-poc/
├── api/                    # Serverless functions
│   └── index.js           # Main API handler
├── frontend/              # React app
│   ├── dist/             # Build output (generated)
│   ├── src/
│   └── package.json
├── vercel.json           # Vercel configuration
├── package.json          # Root package.json
└── README.md
```

## 🔗 API Routes

After deployment, your API routes will be:
- `https://your-app.vercel.app/api/health`
- `https://your-app.vercel.app/api/checkout`
- `https://your-app.vercel.app/api/callback`
- `https://your-app.vercel.app/api/pod-callback`
- `https://your-app.vercel.app/api/orders`

## 🎯 Post-Deployment Tasks

1. **Update Paystack Webhook URL** (if using webhooks):
   - Go to Paystack Dashboard → Settings → Webhooks
   - Add: `https://your-app.vercel.app/api/webhook`

2. **Test Payment Flows**:
   - Test standard payment flow
   - Test pay-on-delivery flow
   - Verify admin panel functionality

3. **Update Domain** (optional):
   - Add custom domain in Vercel dashboard
   - Update environment variables if needed

## 🔍 Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check if all dependencies are in package.json
   - Verify Node.js version compatibility

2. **API Route Issues**:
   - Ensure environment variables are set
   - Check function logs in Vercel dashboard

3. **CORS Issues**:
   - Update allowed origins in api/index.js
   - Add your Vercel domain to CORS settings

### Debugging Commands:
```bash
# Check deployment logs
vercel logs

# Check environment variables
vercel env ls

# Redeploy
vercel --prod
```

## 📊 Monitoring

After deployment:
- Monitor via Vercel dashboard
- Check function execution logs
- Set up alerts for failed deployments

## 🎉 Success!

Your Paystack POC will be live at:
`https://your-project-name.vercel.app`

The complete marketplace with both payment flows will be fully functional in production! 🚀
