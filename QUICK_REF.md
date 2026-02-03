# Bihag - Quick Reference Card

**TL;DR**: Radio playlist URL → YouTube playlist in user's account

---

## 🚀 Quick Start

```bash
# Local dev
npm run dev              # http://localhost:3000

# Deploy
git push origin main     # Auto-deploys to Vercel

# Debug
https://bihag.vercel.app/api/debug?action=status
```

---

## 🔑 Key Endpoints

```
/                           # Homepage
/admin                      # Admin dashboard
/api/scrape-playlist        # Parse radio URLs
/api/visitor-count          # Unique visitors
/api/visitor-locations      # Map dots data
/api/playlist-count         # Playlists created
/api/debug                  # Diagnostics
```

---

## 📊 Critical Numbers

```
YouTube API Quota:
  Daily limit: 10,000 units
  Per playlist: 3,050 units
  Max playlists/day: 3
  Pending increase: 100,000 units

Redis Storage:
  Unique visitors: Set
  Activity logs: Sorted set (timestamp)
  TTL: 30 days (search cache)
```

---

## 🐛 Quick Debug Commands

```bash
# Check Redis data
curl https://bihag.vercel.app/api/debug?action=status

# Check locations
curl https://bihag.vercel.app/api/debug?action=locations

# Check env vars
curl https://bihag.vercel.app/api/debug?action=env

# Test activity write/read
curl https://bihag.vercel.app/api/test-activity
```

---

## 🔧 Important Files

```
src/app/page.js                  # Main app logic
src/app/api/user-activity/       # Analytics core
src/components/VisitorMap.js     # Map rendering
TECHNICAL_OVERVIEW.md            # Full docs
```

---

## ⚡ Common Issues

**Map empty?**
→ Check `/api/debug?action=locations`

**Quota error?**
→ https://console.cloud.google.com/apis/api/youtube.googleapis.com/quotas

**Redis error?**
→ Check env vars in Vercel dashboard

---

## 📈 Stack at a Glance

```
Frontend:  Next.js 14 + React + Tailwind
Backend:   Vercel Edge (serverless)
Database:  Upstash Redis
APIs:      YouTube Data v3, Geolocation
Deploy:    GitHub → Vercel (auto)
```

---

**Status**: ✅ Production
**Owner**: Rithvik Javgal
**Docs**: TECHNICAL_OVERVIEW.md
