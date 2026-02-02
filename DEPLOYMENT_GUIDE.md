# 🚀 Bihag v2.0 - Production Deployment Guide

## ✅ Beta Backup Complete!

Your beta version is safely backed up:
- **Git commit**: Tagged as `v2.0-beta`
- **Local backup**: Full git history preserved
- **Rollback command**: `git checkout v2.0-beta` (if needed)

---

## 🎯 Deploy to Production (3 Simple Steps)

### Step 1: Login to Vercel

```bash
cd /Users/rjavgal/bihag
vercel login
```

This will open your browser to authenticate with GitHub/GitLab/email.

### Step 2: Deploy to Production

```bash
vercel --prod
```

**What this does:**
- Builds your Next.js app
- Deploys to Vercel's global CDN
- Assigns a production URL (e.g., bihag.vercel.app)
- Automatically sets up HTTPS

**Expected output:**
```
✔ Production deployment ready!
🔗 https://bihag.vercel.app
```

### Step 3: Verify Deployment

Visit your new production URL and test:
- ✅ Sign in with Google works
- ✅ Paste a radio station URL
- ✅ Playlist generation works
- ✅ Visitor counter increments
- ✅ Feedback widget appears
- ✅ Mobile responsive

---

## 🎨 Optional: Custom Domain

After deployment, you can add a custom domain:

1. Go to https://vercel.com/dashboard
2. Select your "bihag" project
3. Click "Settings" → "Domains"
4. Add your custom domain (e.g., bihag.io)
5. Follow DNS setup instructions

**Cost:** ~$12/year for .com domain

---

## 📊 Post-Deployment Setup (Optional)

### 1. Request YouTube API Quota Increase

Current limit: 10,000 units/day (~3 playlists)

**To increase:**
1. Go to https://console.cloud.google.com
2. Navigate to "APIs & Services" → "Quotas"
3. Find "YouTube Data API v3"
4. Request increase to 100,000 units/day (~32 playlists)
5. Justification: "Educational music discovery tool"

**Response time:** 1-3 business days

### 2. Add Upstash Redis (Persistent Analytics)

For persistent visitor counter & feedback:

1. Go to https://console.upstash.com
2. Create a Redis database (free tier)
3. Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
4. Add to Vercel environment variables:
   ```bash
   vercel env add UPSTASH_REDIS_REST_URL
   vercel env add UPSTASH_REDIS_REST_TOKEN
   ```
5. Redeploy: `vercel --prod`

### 3. Set Up ClustrMaps (Visitor Map)

1. Go to https://clustrmaps.com
2. Register for free widget
3. Get embed code
4. Update `src/components/VisitorMap.js` with your widget URL
5. Commit and redeploy

---

## 🔧 Environment Variables

**Required:**
- `NEXT_PUBLIC_YOUTUBE_CLIENT_ID` - Already set in vercel.json

**Optional (for production features):**
- `UPSTASH_REDIS_REST_URL` - For persistent analytics
- `UPSTASH_REDIS_REST_TOKEN` - For persistent analytics
- `NEXT_PUBLIC_BASE_URL` - Your custom domain (if using)

**To add via CLI:**
```bash
vercel env add UPSTASH_REDIS_REST_URL production
vercel env add UPSTASH_REDIS_REST_TOKEN production
```

**Or via Dashboard:**
https://vercel.com/dashboard → Project → Settings → Environment Variables

---

## 🐛 Troubleshooting

### Build fails on Vercel

```bash
# Test build locally first
npm run build

# If successful, redeploy
vercel --prod --force
```

### YouTube API not working

- Check Google Cloud Console has YouTube Data API enabled
- Verify OAuth consent screen is configured
- Check authorized redirect URIs include your Vercel domain

### Visitor counter resets

- This is normal with in-memory storage
- Set up Upstash Redis for persistence (see above)

---

## 📈 Monitoring & Analytics

**Vercel Dashboard:**
- https://vercel.com/dashboard
- View deployment status
- Check build logs
- Monitor bandwidth usage
- See visitor analytics

**YouTube API Quota:**
- https://console.cloud.google.com/apis/api/youtube.googleapis.com/quotas
- Monitor daily usage
- Request increase if needed

---

## 🎉 Success Checklist

After deployment, verify:

- [ ] Production URL is live
- [ ] HTTPS works (automatic)
- [ ] Google Sign-in works
- [ ] Can scrape radio station URLs
- [ ] YouTube playlist creation works
- [ ] Visitor counter increments
- [ ] Feedback widget appears
- [ ] Mobile responsive
- [ ] SEO tags visible (view page source)
- [ ] Buy Me a Coffee link works

---

## 🔄 Future Updates

To update your live site:

```bash
# Make changes to code
git add .
git commit -m "Your update message"

# Deploy
vercel --prod
```

Vercel automatically builds and deploys updates!

---

## 📞 Support

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **YouTube API Docs**: https://developers.google.com/youtube/v3

---

## 🎊 You're Ready!

Run this now:
```bash
cd /Users/rjavgal/bihag
vercel login
vercel --prod
```

Then share your new app with the world! 🌍
