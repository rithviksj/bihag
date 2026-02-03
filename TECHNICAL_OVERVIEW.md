# Bihag - Technical Overview & Crib Notes

**Project**: Radio Playlist → YouTube Playlist Converter
**Live URL**: https://bihag.vercel.app
**Owner**: Rithvik Javgal
**Status**: Production ✅
**Last Updated**: 2026-02-02

---

## 🎯 What It Does

Converts radio station playlists (Billboard, local stations) into YouTube playlists automatically.

**User Flow**:
1. Paste radio playlist URL
2. App scrapes song list
3. User signs in with Google
4. App searches YouTube for each song
5. Creates playlist in user's account
6. Shows success with YouTube link

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                         │
│              (Next.js 14 App Router - Client)                │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Vercel Edge Runtime                       │
│                 (Next.js API Routes - Server)                │
│                                                              │
│  /api/scrape-playlist   ────► Cheerio (HTML parsing)        │
│  /api/visitor-count     ────► Redis (Upstash)               │
│  /api/user-activity     ────► Redis + Geolocation APIs      │
│  /api/visitor-locations ────► Redis (read activity logs)    │
│  /api/playlist-count    ────► Redis (count playlists)       │
│  /api/feedback          ────► Redis (store feedback)        │
│  /api/debug            ────► Redis diagnostics              │
└──────────────────────────┬──────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
    ┌──────────┐    ┌───────────┐    ┌──────────┐
    │  YouTube │    │  Upstash  │    │   Geo    │
    │ Data API │    │   Redis   │    │   APIs   │
    │  (OAuth) │    │ (Analytics)│   │(ip lookup)│
    └──────────┘    └───────────┘    └──────────┘
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: JavaScript (React Server Components + Client Components)
- **Styling**: Tailwind CSS
- **UI Components**: Custom components (shadcn/ui pattern)
- **State**: React useState/useEffect hooks
- **Auth**: Google OAuth 2.0 (client-side token flow)

### Backend
- **Runtime**: Vercel Edge Functions (serverless)
- **API Routes**: Next.js API Routes (App Router)
- **Scraping**: Cheerio (HTML parsing)
- **Database**: Upstash Redis (serverless Redis)
- **Geolocation**:
  - Primary: Vercel geo headers (`x-vercel-ip-*`)
  - Fallback: ipapi.co
  - Tertiary: ipgeolocation.app

### External APIs
- **YouTube Data API v3**:
  - `search.list` - Find videos
  - `playlists.insert` - Create playlist
  - `playlistItems.insert` - Add videos to playlist
- **OAuth 2.0**: Google Identity Services (GSI)

### Deployment
- **Hosting**: Vercel
- **Domain**: bihag.vercel.app
- **CI/CD**: GitHub → Vercel auto-deploy
- **Environment**: Production + Preview deployments

---

## 📊 Data Flow

### 1. Playlist Creation Flow

```
User pastes URL
    ↓
[POST /api/scrape-playlist]
    ↓ (Cheerio scrapes HTML)
Parse songs → Return [{artist, title, combined}]
    ↓
Display 20 songs (client-side)
    ↓
User clicks "Sign in with Google"
    ↓
OAuth 2.0 flow → Get access_token
    ↓
User enters playlist name → Click "Create YouTube Playlist"
    ↓
[Client-side YouTube API calls]
    ├─► POST playlists (create) → playlistId
    ├─► GET search (per song) → videoId
    └─► POST playlistItems (add to playlist)
    ↓
Show success + YouTube playlist link
    ↓
[POST /api/user-activity] (log playlist_created)
```

### 2. Analytics Flow

```
User visits homepage
    ↓
[VisitorCounter component mounts]
    ↓
POST /api/visitor-count {email: null}
    ├─► Redis: SADD unique_visitors ${ip}
    └─► Return count
    ↓
POST /api/user-activity {action: "page_visit"}
    ├─► Get IP from headers
    ├─► Get geolocation:
    │   1. Check Vercel headers (x-vercel-ip-latitude/longitude)
    │   2. Fallback: ipapi.co/${ip}/json
    │   3. Fallback: ipgeolocation.app/lookup/${ip}
    ├─► Store in Redis:
    │   ZADD user_activity_log ${timestamp} ${JSON.stringify(entry)}
    └─► Return success
    ↓
[VisitorMap component polls every 2 minutes]
    ↓
GET /api/visitor-locations?limit=100
    ├─► Redis: ZRANGE user_activity_log (last 100)
    ├─► Parse entries, extract unique locations
    └─► Return [{lat, lng, city, country, count}]
    ↓
Render dots on SVG map (Equirectangular projection)
```

### 3. Admin Dashboard Flow

```
Visit /admin
    ↓
GET /api/user-activity?limit=100
    ├─► Redis: ZRANGE user_activity_log (last 100)
    └─► Return logs + stats
    ↓
Display table with:
    - Timestamp, User email, Action, Location, IP, Details
    - Filters: all/authenticated/anonymous
    - Stats: total logs, unique users, unique IPs
```

---

## 🔑 Key Implementation Details

### YouTube API Quota Usage

| Operation | Quota Cost | Count (20 songs) | Subtotal |
|-----------|-----------|------------------|----------|
| Create playlist | 50 | 1 | 50 |
| Search video | 100 | 20 | 2,000 |
| Insert to playlist | 50 | 20 | 1,000 |
| **Total per playlist** | | | **3,050** |

**Daily Limit**: 10,000 units = ~3 playlists/day
**Pending**: Quota increase to 100,000 units = ~32 playlists/day

### Redis Data Structures

```javascript
// Unique visitors (set)
SADD unique_visitors ${ip}
SCARD unique_visitors // Get count

// Authenticated users (set)
SADD authenticated_users ${email}

// Activity log (sorted set, score = timestamp)
ZADD user_activity_log ${timestamp} ${JSON.stringify({
  timestamp, email, ip, userAgent, action, location, metadata
})}

// Get last N entries
ZRANGE user_activity_log ${start} -1
```

### Geolocation Priority

1. **Vercel Headers** (instant, free, most reliable):
   - `x-vercel-ip-city`
   - `x-vercel-ip-country`
   - `x-vercel-ip-latitude`
   - `x-vercel-ip-longitude`

2. **ipapi.co** (fallback, 1000 req/day free):
   - `GET https://ipapi.co/${ip}/json/`

3. **ipgeolocation.app** (tertiary, unlimited free):
   - `GET https://api.ipgeolocation.app/lookup/${ip}`

### Critical Bug Fixes (Lessons Learned)

1. **Redis Query Issue**:
   - ❌ `zrangebyscore(key, 0, "+inf", {byScore: true})` → Returns empty
   - ✅ `zrange(key, startRank, -1)` → Works correctly

2. **JSON Parsing Issue**:
   - Upstash Redis REST API **auto-deserializes** JSON
   - ❌ `JSON.parse(entry)` when entry is already object → Parse error
   - ✅ Check `typeof entry === 'string'` before parsing

3. **Edge Runtime Compatibility**:
   - ❌ `AbortSignal.timeout(3000)` → Not available in edge
   - ✅ `new AbortController()` + `setTimeout()` → Works

---

## 🎨 Key Components

### Frontend Components

**Location**: `/src/components/`

```javascript
VisitorCounter.js
├─ Fetches visitor count from /api/visitor-count
├─ POSTs to /api/user-activity on mount
└─ Updates every page load

PlaylistCounter.js
├─ Fetches playlist count from /api/playlist-count
└─ Refreshes every 30 seconds

VisitorMap.js
├─ Fetches locations from /api/visitor-locations
├─ Renders SVG world map (Equirectangular projection)
├─ Plots dots at lat/lng coordinates
└─ Refreshes every 2 minutes

FeedbackWidget.js
└─ Floating feedback button (bottom-right)

WorkflowDiagram.js
└─ Shows 6-step process diagram
```

### API Routes

**Location**: `/src/app/api/`

```javascript
scrape-playlist/route.js
├─ Scrapes HTML from radio station URL
├─ Extracts songs using Cheerio
└─ Returns [{artist, title, combined}]

visitor-count/route.js
├─ GET: Returns unique visitor count
└─ POST: Increments visitor (Redis SADD)

user-activity/route.js
├─ POST: Logs activity with geolocation
└─ GET: Returns recent activity logs

visitor-locations/route.js
└─ GET: Extracts locations from activity logs

playlist-count/route.js
└─ GET: Counts playlist_created actions

feedback/route.js
└─ POST: Stores user feedback

debug/route.js
├─ ?action=status → Redis connection & counts
├─ ?action=recent_activity → Last 5 logs
├─ ?action=locations → Extracted locations
└─ ?action=env → Environment variable check
```

---

## 🚀 Deployment

### Environment Variables (Vercel)

```bash
# Required
UPSTASH_REDIS_REST_URL=https://related-escargot-62677.upstash.io
UPSTASH_REDIS_REST_TOKEN=AfTVAAIncDE2ZGYwNzkwZTFlMWU0ZmI0YTIwMmYwMWEzNDQ5Y2UyNnAxNjI2Nzc

# Optional (embedded in code for now)
NEXT_PUBLIC_YOUTUBE_CLIENT_ID=79438826423-8grkihuiaedjn815odj871rv1cj540j3.apps.googleusercontent.com
```

### Deployment Flow

```bash
# Local development
npm run dev  # http://localhost:3000

# Build & test
npm run build

# Deploy (auto via GitHub)
git push origin main
    ↓
GitHub webhook triggers Vercel
    ↓
Vercel builds Next.js app
    ↓
Deploys to edge network
    ↓
Live at https://bihag.vercel.app (~2 minutes)
```

### Google Cloud Console Setup

1. **Project**: YouTube Playlist Converter
2. **APIs Enabled**:
   - YouTube Data API v3
3. **OAuth 2.0 Client**:
   - Type: Web application
   - Authorized JavaScript origins: `https://bihag.vercel.app`
   - Authorized redirect URIs: `https://bihag.vercel.app`
4. **OAuth Consent Screen**:
   - External (public access)
   - Scopes: `youtube` (manage YouTube account)

---

## 🐛 Troubleshooting

### Quota Error Banner Not Showing?
- Check browser console for errors
- Verify error message contains "quota" or "exceeded"
- Check that `quotaError` state is being set

### Map Dots Not Appearing?
1. Check `/api/debug?action=locations` → Should show locations array
2. Check `/api/debug?action=recent_activity` → Should show logs with location.lat/lng
3. Verify Vercel geo headers are present (check function logs)
4. Check Redis has data: `/api/debug?action=status`

### Redis Not Working?
1. Check environment variables: `/api/debug?action=env`
2. Verify Upstash console shows database is active
3. Check Vercel function logs for Redis errors
4. Test write/read: `/api/test-activity`

### Playlist Creation Fails?
1. Check YouTube API quota: https://console.cloud.google.com/apis/api/youtube.googleapis.com/quotas
2. Verify OAuth token is valid (check browser console)
3. Check authorized domains in Google Cloud Console
4. Review browser console for specific API errors

---

## 📈 Analytics & Monitoring

### Check Visitor Stats
```
Homepage: Visitor count (top) + Map (bottom)
Admin: https://bihag.vercel.app/admin
Debug: https://bihag.vercel.app/api/debug?action=status
```

### Vercel Logs
```
Vercel Dashboard → bihag → Deployments → Latest
→ Functions → Select API route → View logs
```

### Redis Console
```
https://console.upstash.com
→ related-escargot-62677
→ Data Browser / CLI
```

---

## 🎯 Future Optimizations (If Needed)

### 1. Search Result Caching
```javascript
// Before searching YouTube, check cache:
const cacheKey = `yt_search:${song.combined}`;
const cached = await redis.get(cacheKey);
if (cached) return cached.videoId;

// After search, cache result:
await redis.set(cacheKey, {videoId, title}, {ex: 30*24*60*60}); // 30 days
```
**Impact**: 80% quota savings on popular songs

### 2. Song Count Selector
```javascript
// Let users choose:
<select value={songCount} onChange={setSongCount}>
  <option value={5}>Quick (5 songs)</option>
  <option value={10}>Standard (10 songs)</option>
  <option value={20}>Full (20 songs)</option>
</select>
```
**Impact**: 50-80% quota savings if users choose smaller playlists

### 3. Batch Processing (No quota savings, just faster)
```javascript
// Search all songs in parallel:
const searches = songs.map(song =>
  fetch(`/youtube/v3/search?q=${song}`)
);
const results = await Promise.all(searches);
```
**Impact**: 10x faster (but same quota usage)

---

## 📝 Key Files Reference

```
bihag/
├── src/
│   ├── app/
│   │   ├── page.js                    # Main homepage component
│   │   ├── layout.js                  # Root layout (metadata, globals)
│   │   ├── admin/
│   │   │   └── page.js                # Admin dashboard
│   │   └── api/
│   │       ├── scrape-playlist/route.js
│   │       ├── visitor-count/route.js
│   │       ├── user-activity/route.js
│   │       ├── visitor-locations/route.js
│   │       ├── playlist-count/route.js
│   │       ├── feedback/route.js
│   │       ├── debug/route.js
│   │       └── test-activity/route.js
│   ├── components/
│   │   ├── VisitorCounter.js
│   │   ├── PlaylistCounter.js
│   │   ├── VisitorMap.js
│   │   ├── FeedbackWidget.js
│   │   ├── WorkflowDiagram.js
│   │   └── ui/                        # Base UI components
│   │       ├── button.js
│   │       ├── card.js
│   │       └── input.js
│   ├── lib/
│   │   └── playlistScraper.js         # Cheerio scraping logic
│   └── styles/
│       └── globals.css                # Tailwind base styles
├── public/                            # Static assets
├── .env.local                         # Environment variables (local)
├── package.json                       # Dependencies
├── tailwind.config.js                 # Tailwind configuration
├── next.config.js                     # Next.js configuration
├── README.md                          # User-facing documentation
├── TECHNICAL_OVERVIEW.md              # This file
└── PROJECTS.md                        # Bug repro automation project
```

---

## 🎉 Project Stats

**Lines of Code**: ~2,500
**Components**: 6 UI components + 7 API routes
**Dependencies**: 12 npm packages
**Build Time**: ~15 seconds
**Deploy Time**: ~2 minutes
**Total Development Time**: ~8 hours (with debugging)

**Key Achievements**:
✅ Full playlist creation workflow
✅ Real-time visitor analytics with geolocation
✅ Beautiful quota error handling with donation CTA
✅ Admin dashboard for activity monitoring
✅ Global visitor map with live dots
✅ Responsive design (mobile + desktop)
✅ Production-ready error handling
✅ Optimized for Vercel edge runtime

---

## 💡 Design Decisions

### Why Next.js App Router?
- Modern React patterns (Server Components)
- Built-in API routes (no separate backend)
- Edge runtime support (fast global response)
- Vercel optimization (same team)

### Why Upstash Redis?
- Serverless (no server management)
- Edge-compatible REST API
- Free tier sufficient for current scale
- Pay-as-you-grow pricing

### Why Client-Side YouTube API Calls?
- Avoids storing user OAuth tokens
- User's token = user's quota (not shared)
- Simpler security model
- Direct user-to-YouTube connection

### Why Cheerio for Scraping?
- Lightweight (vs Puppeteer)
- Fast (synchronous parsing)
- Edge-compatible (no browser needed)
- jQuery-like syntax (familiar)

---

## 🤝 Contributing / Extending

### Add New Radio Station Support
Edit `/src/lib/playlistScraper.js`:
```javascript
// Add new selector pattern:
if (url.includes('newstation.com')) {
  songs = $('.song-title').map((i, el) => ({
    artist: $(el).find('.artist').text(),
    title: $(el).find('.title').text()
  }));
}
```

### Add New Analytics Metric
1. Create new API route: `/src/app/api/new-metric/route.js`
2. Create component: `/src/components/NewMetric.js`
3. Add to homepage: Import and render in `page.js`

### Add Caching
See "Future Optimizations" section above for Redis-based search caching.

---

## 📞 Support & Resources

**Live App**: https://bihag.vercel.app
**Admin Dashboard**: https://bihag.vercel.app/admin
**Debug Endpoint**: https://bihag.vercel.app/api/debug?action=status

**External Dashboards**:
- Vercel: https://vercel.com/dashboard
- Google Cloud: https://console.cloud.google.com
- Upstash Redis: https://console.upstash.com
- YouTube Quota: https://console.cloud.google.com/apis/api/youtube.googleapis.com/quotas

**Documentation**:
- Next.js: https://nextjs.org/docs
- YouTube API: https://developers.google.com/youtube/v3
- Upstash Redis: https://docs.upstash.com/redis
- Tailwind CSS: https://tailwindcss.com/docs

---

## 🏆 Status: Production Ready ✅

**Last Deployment**: 2026-02-02
**Health**: All systems operational
**Known Issues**: None
**Pending**: YouTube API quota increase (2-5 business days)

---

**Built with ❤️ by Rithvik Javgal**
**Assisted by Claude Sonnet 4.5**

*Now go enjoy that $1M donation! 🎉*
