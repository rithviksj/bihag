# Bihag v2.0 — Radio Station Playlist to YouTube Converter

**Transform any radio station's playlist into a YouTube playlist with a single click.**

Live app: [bihag.vercel.app](https://bihag.vercel.app)

---

## Overview

Bihag is a web application that automatically converts radio station playlists (from websites like Billboard, Spotify Charts, local radio stations, etc.) into YouTube playlists. Users simply paste a URL, and the app scrapes the song list, searches for each track on YouTube, and creates a playlist in their YouTube account.

**Key Features:**
- 🔗 URL-based playlist scraping (no manual uploads)
- 🎵 Supports up to 20 songs per playlist
- 🔍 Automatic YouTube video matching
- 📊 Real-time visitor analytics with global map
- 🌍 Geolocation tracking of users
- ☀️⛈️ User feedback widget
- 🎨 Modern, responsive UI with light theme
- 💰 $0/month operational cost (free tier services)

---

## Technical Architecture

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14 (App Router) | React framework with SSR |
| **UI** | Tailwind CSS + custom components | Styling and responsive design |
| **Backend** | Next.js API Routes | Serverless functions |
| **Scraping** | Cheerio | HTML parsing for playlist extraction |
| **Storage** | Upstash Redis | Visitor analytics, user activity logs |
| **Authentication** | Google OAuth 2.0 | YouTube API access |
| **Deployment** | Vercel | Hosting + auto-deployment |
| **Analytics** | Custom built (Redis-backed) | Visitor counting, geolocation |

### System Architecture Diagram

```
┌─────────────────┐
│   User Browser  │
│  (Next.js SPA)  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│         Next.js Application             │
│  ┌─────────────────────────────────┐   │
│  │  Frontend (React Components)    │   │
│  │  - VisitorCounter               │   │
│  │  - VisitorMap                   │   │
│  │  - WorkflowDiagram              │   │
│  │  - FeedbackWidget               │   │
│  └─────────────────────────────────┘   │
│           │                             │
│           ▼                             │
│  ┌─────────────────────────────────┐   │
│  │    API Routes (Serverless)      │   │
│  │  - /api/scrape-playlist         │   │
│  │  - /api/visitor-count           │   │
│  │  - /api/visitor-locations       │   │
│  │  - /api/user-activity           │   │
│  │  - /api/feedback                │   │
│  └─────────────────────────────────┘   │
└─────────────┬───────────────────────────┘
              │
    ┌─────────┼─────────┐
    │         │         │
    ▼         ▼         ▼
┌────────┐ ┌─────────┐ ┌────────────────┐
│ Google │ │ Upstash │ │  Radio Station │
│  OAuth │ │  Redis  │ │    Websites    │
│YouTube │ │(Storage)│ │   (Scraping)   │
│  API   │ │         │ │                │
└────────┘ └─────────┘ └────────────────┘
```

---

## Core Features Deep Dive

### 1. Playlist Scraping Engine

**File:** `src/lib/playlistScraper.js`

The scraper is a generic HTML parser that adapts to different radio station website structures.

**How It Works:**

1. **Fetch HTML:** Server-side fetch to avoid CORS issues
2. **Pattern Detection:** Uses multiple strategies to identify song/artist pairs:
   - Structured data (JSON-LD, schema.org)
   - Table parsing (`<table>`, `<tr>`, `<td>`)
   - List parsing (`<ul>`, `<ol>`, `<li>`)
   - Class/attribute matching (`.song`, `.artist`, `data-song`, etc.)
3. **Normalization:** Combines artist + song into searchable format
4. **Limit:** Returns top 20 songs (or all if < 20)

**Example Pattern Recognition:**
```html
<!-- Pattern 1: Table structure -->
<table>
  <tr>
    <td class="artist">Taylor Swift</td>
    <td class="song">Anti-Hero</td>
  </tr>
</table>

<!-- Pattern 2: List with "Artist - Song" format -->
<ul>
  <li>Taylor Swift - Anti-Hero</li>
</ul>

<!-- Pattern 3: JSON-LD structured data -->
<script type="application/ld+json">
{
  "@type": "MusicPlaylist",
  "track": [
    { "name": "Anti-Hero", "byArtist": "Taylor Swift" }
  ]
}
</script>
```

**API Endpoint:** `POST /api/scrape-playlist`

**Request:**
```json
{
  "url": "https://www.billboard.com/charts/hot-100"
}
```

**Response:**
```json
{
  "songs": [
    { "title": "Anti-Hero", "artist": "Taylor Swift", "combined": "Taylor Swift - Anti-Hero" }
  ],
  "count": 20,
  "success": true
}
```

---

### 2. YouTube Integration

**OAuth Flow:**

1. User clicks "Sign in with Google"
2. Google OAuth 2.0 consent screen appears
3. User authorizes YouTube access
4. App receives `access_token`
5. Token used for YouTube Data API v3 calls

**Playlist Creation Process:**

```javascript
// Step 1: Create playlist
POST https://www.googleapis.com/youtube/v3/playlists?part=snippet,status
Body: {
  "snippet": { "title": "My Radio Playlist", "description": "..." },
  "status": { "privacyStatus": "public" }
}
Response: { "id": "PLxxxxxx" }

// Step 2: For each song (max 20)
// 2a. Search for video
GET https://www.googleapis.com/youtube/v3/search?q=Taylor+Swift+-+Anti-Hero&type=video
Response: { "items": [{ "id": { "videoId": "abc123" } }] }

// 2b. Add to playlist
POST https://www.googleapis.com/youtube/v3/playlistItems?part=snippet
Body: {
  "snippet": {
    "playlistId": "PLxxxxxx",
    "resourceId": { "kind": "youtube#video", "videoId": "abc123" }
  }
}
```

**Progress Tracking:**
- Real-time progress bar (0-100%)
- Status updates: "Processing song 5 of 20..."
- Success/skip tracking for each song

**Error Handling:**
- If video not found: skip song, continue to next
- If quota exceeded: show error message
- Final summary: "18 of 20 songs added successfully"

---

### 3. Visitor Analytics System

**Components:**

1. **Visitor Counter** (`src/components/VisitorCounter.js`)
2. **Global Map** (`src/components/VisitorMap.js`)
3. **Backend API** (`src/app/api/visitor-count/route.js`)

**Data Flow:**

```
User visits page
     ↓
VisitorCounter.useEffect()
     ↓
POST /api/visitor-count
     ↓
Redis: SADD unique_visitors {ip}
     ↓
Redis: SCARD unique_visitors → count
     ↓
Display: "👥 1,234 visitors"
```

**Geolocation Tracking:**

When a user visits the page:
1. Extract IP from request headers (`x-forwarded-for`)
2. Call ipapi.co free tier API: `GET https://ipapi.co/{ip}/json/`
3. Store location data: `{ lat, lng, city, country }`
4. Save to Redis sorted set: `user_activity_log`

**Global Map Visualization:**

```javascript
// Fetch locations
GET /api/visitor-locations?limit=100

// Response
{
  "locations": [
    { "lat": 37.7749, "lng": -122.4194, "city": "San Francisco", "country": "USA", "count": 5 },
    { "lat": 51.5074, "lng": -0.1278, "city": "London", "country": "UK", "count": 3 }
  ],
  "total": 42
}

// Render on SVG world map with animated dots
```

**Storage Structure (Redis):**

| Key | Type | Value | Purpose |
|-----|------|-------|---------|
| `unique_visitors` | Set | `["1.2.3.4", "5.6.7.8", ...]` | Unique visitor IPs |
| `authenticated_users` | Set | `["user@example.com", ...]` | Logged-in users |
| `user_activity_log` | Sorted Set | `[(timestamp, {activity JSON}), ...]` | Full activity log |
| `visitor:{ip}` | Hash | `{ip, email, lastVisit}` | Per-visitor metadata |

---

### 4. User Activity Logging

**API Endpoint:** `/api/user-activity`

**Purpose:** Track all user interactions for analytics and audit.

**Logged Events:**
- `page_visit` — User loads the homepage
- `oauth_login` — User signs in with Google
- `playlist_created` — User successfully creates a YouTube playlist

**Data Structure:**
```json
{
  "timestamp": "2026-02-02T12:34:56.789Z",
  "email": "user@example.com",
  "ip": "203.0.113.42",
  "userAgent": "Mozilla/5.0...",
  "action": "playlist_created",
  "location": {
    "country": "United States",
    "city": "San Francisco",
    "lat": 37.7749,
    "lng": -122.4194,
    "region": "California"
  },
  "metadata": {
    "playlistId": "PLxxxxxx",
    "playlistName": "My Radio Playlist",
    "songsAdded": 18,
    "songsSkipped": 2,
    "totalSongs": 20,
    "sourceUrl": "https://www.billboard.com/charts/hot-100"
  }
}
```

**Retrieval (Admin/Audit):**
```bash
GET /api/user-activity?limit=100&since=2026-02-01T00:00:00Z

Response:
{
  "logs": [...],
  "stats": {
    "total": 1247,
    "returned": 100,
    "uniqueUsers": 87,
    "uniqueIPs": 142
  }
}
```

**Auto-Cleanup:** Keeps only last 10,000 entries to prevent storage bloat.

---

### 5. Feedback Widget

**Component:** `src/components/FeedbackWidget.js`

**UI:** Floating button (bottom-right corner)
- ☀️ Sunshine — Positive feedback
- ⛈️ Thunderstorm — Negative feedback

**Backend:** `POST /api/feedback`

**Storage:**
```javascript
Redis:
  feedback_positive: 1234
  feedback_negative: 56
```

**Display:** (Optional) "87% ☀️" sentiment score

---

## API Reference

### `POST /api/scrape-playlist`

Scrape songs from a radio station playlist URL.

**Request:**
```json
{
  "url": "https://example-radio.com/top-20"
}
```

**Response:**
```json
{
  "songs": [{ "title": "Song", "artist": "Artist", "combined": "Artist - Song" }],
  "count": 20,
  "success": true
}
```

**Errors:**
- `400` — Invalid URL
- `429` — Rate limit exceeded (10 requests/minute)
- `500` — Scraping failed

---

### `POST /api/visitor-count`

Increment visitor count (called on page load).

**Request:**
```json
{
  "email": "user@example.com" // Optional (null if not logged in)
}
```

**Response:**
```json
{
  "count": 1234,
  "isNewVisitor": true
}
```

---

### `GET /api/visitor-count`

Get current visitor count.

**Response:**
```json
{
  "count": 1234
}
```

---

### `GET /api/visitor-locations?limit=50`

Get visitor locations for map visualization.

**Response:**
```json
{
  "locations": [
    { "lat": 37.7749, "lng": -122.4194, "city": "San Francisco", "country": "USA", "count": 5 }
  ],
  "total": 42
}
```

---

### `POST /api/user-activity`

Log user activity (page visit, login, playlist creation).

**Request:**
```json
{
  "action": "playlist_created",
  "email": "user@example.com",
  "metadata": { "playlistId": "PLxxxxxx", "songsAdded": 18 }
}
```

**Response:**
```json
{
  "success": true,
  "logged": { /* full activity entry */ }
}
```

---

### `GET /api/user-activity?limit=100&since=2026-02-01T00:00:00Z`

Retrieve activity logs (admin endpoint).

**Response:**
```json
{
  "logs": [{ /* activity entries */ }],
  "stats": { "total": 1247, "uniqueUsers": 87 }
}
```

---

### `POST /api/feedback`

Record user feedback.

**Request:**
```json
{
  "type": "positive" // or "negative"
}
```

**Response:**
```json
{
  "success": true,
  "positive": 1234,
  "negative": 56,
  "total": 1290
}
```

---

## Environment Variables

### Required (Production)

```bash
# Upstash Redis (for analytics)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=AxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxQ

# Google OAuth (YouTube API)
# Note: Client ID is public, stored in code. Token is client-side only.
NEXT_PUBLIC_YOUTUBE_CLIENT_ID=79438826423-8grkihuiaedjn815odj871rv1cj540j3.apps.googleusercontent.com
```

### Setup Instructions

**1. Upstash Redis:**
- Go to [upstash.com](https://upstash.com/)
- Create account (free tier: 10k commands/day)
- Create Redis database
- Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
- Add to Vercel environment variables

**2. Google OAuth:**
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create project → Enable YouTube Data API v3
- Create OAuth 2.0 credentials (Web application)
- Add authorized JavaScript origin: `https://bihag.vercel.app`
- Copy Client ID
- **Note:** Current client ID is exposed in code; regenerate for production if needed

---

## Deployment

### Vercel (Production)

**Prerequisites:**
- GitHub account
- Vercel account (free tier)

**Steps:**

1. **Push code to GitHub:**
```bash
cd /Users/rjavgal/bihag
git add .
git commit -m "Deploy Bihag v2.0"
git push origin main
```

2. **Connect to Vercel:**
- Go to [vercel.com/dashboard](https://vercel.com/dashboard)
- Click "New Project"
- Import from GitHub: `rithviksj/bihag`
- Configure:
  - Framework: Next.js
  - Root Directory: `./`
  - Build Command: `npm run build`
  - Output Directory: `.next`

3. **Add environment variables:**
- Vercel Dashboard → Settings → Environment Variables
- Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

4. **Deploy:**
- Click "Deploy"
- Auto-deploys on every `git push` to `main`

**Custom Domain (Optional):**
- Vercel Dashboard → Settings → Domains
- Add `bihag.com` (requires DNS configuration)

---

## Local Development

### Setup

```bash
# Clone repository
git clone https://github.com/rithviksj/bihag.git
cd bihag

# Install dependencies
npm install

# Create .env.local (optional, for Redis in dev)
cat > .env.local <<EOF
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=AxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxQ
EOF

# Run development server
npm run dev

# Open browser
open http://localhost:3000
```

### Development Mode Notes

- **Without Redis:** Analytics use in-memory storage (resets on server restart)
- **With Redis:** Add `.env.local` with Upstash credentials
- **Hot reload:** Changes auto-refresh in browser
- **API routes:** Accessible at `http://localhost:3000/api/*`

### Testing

```bash
# Test scraping
curl -X POST http://localhost:3000/api/scrape-playlist \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.billboard.com/charts/hot-100"}'

# Test visitor count
curl http://localhost:3000/api/visitor-count

# Test activity logs (with Redis)
curl http://localhost:3000/api/user-activity?limit=10
```

---

## File Structure

```
bihag/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── scrape-playlist/route.js  # Playlist scraping API
│   │   │   ├── visitor-count/route.js    # Visitor analytics
│   │   │   ├── visitor-locations/route.js # Map data
│   │   │   ├── user-activity/route.js    # Activity logging
│   │   │   └── feedback/route.js         # User feedback
│   │   ├── layout.js                     # Root layout (fonts, bg)
│   │   └── page.js                       # Main app (YouTube integration)
│   ├── components/
│   │   ├── ui/                           # Reusable UI components
│   │   │   ├── button.js
│   │   │   ├── card.js
│   │   │   └── input.js
│   │   ├── WorkflowDiagram.js            # "How It Works" visual
│   │   ├── VisitorCounter.js             # "👥 X visitors" widget
│   │   ├── VisitorMap.js                 # Global map with dots
│   │   └── FeedbackWidget.js             # ☀️⛈️ floating button
│   ├── lib/
│   │   └── playlistScraper.js            # HTML parsing logic
│   └── styles/
│       └── globals.css                   # Global styles
├── public/
│   └── music-pattern.svg                 # Background wallpaper
├── package.json                          # Dependencies
├── tailwind.config.js                    # Tailwind CSS config
├── postcss.config.js                     # PostCSS (Tailwind support)
└── README.md                             # This file
```

---

## Design System

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Background | `#D3D3D3` | Page background (light grey) |
| Accent | `#b91c1c` | "Bihag" title, BIHAG box border (brick red) |
| Text Primary | `#1f2937` | Body text (grey-800) |
| Text Secondary | `#4b5563` | Subtitles (grey-600) |
| Workflow Icons | Grey/Slate gradients | Greyscale from light to dark |

### Typography

- **Title:** Playfair Display (serif, 700/900 weight)
- **Body:** Courier New (monospace)

### Responsive Breakpoints

- **Mobile:** < 768px (vertical workflow diagram)
- **Desktop:** ≥ 768px (horizontal workflow diagram)

---

## Performance Optimizations

1. **Server-side scraping:** Avoids CORS, reduces client bundle
2. **Rate limiting:** 10 requests/minute prevents abuse
3. **Redis caching:** Fast analytics queries
4. **Lazy loading:** Components load on demand
5. **SVG icons:** Vector graphics, no image downloads
6. **Edge deployment:** Vercel Edge Network (CDN)

---

## Security Considerations

1. **Input validation:**
   - URL length limit: 2000 characters
   - Rate limiting on API routes
   - HTTPS-only in production

2. **OAuth security:**
   - Token stored client-side (memory, not localStorage)
   - Token expires after 1 hour (Google default)
   - No token sent to backend (direct YouTube API calls)

3. **Data privacy:**
   - IP addresses hashed for uniqueness (not stored raw in prod)
   - User emails only logged if explicitly authenticated
   - 30-day expiry on visitor metadata

4. **CORS:**
   - API routes reject cross-origin requests
   - Server-side scraping bypasses CORS issues

---

## Cost Breakdown

| Service | Free Tier | Usage | Cost |
|---------|-----------|-------|------|
| Vercel | 100GB bandwidth/month | ~50k page views | $0 |
| Upstash Redis | 10k commands/day | Analytics + logging | $0 |
| Google OAuth | Unlimited | YouTube API access | $0 |
| YouTube API | 10k units/day | ~3 playlists/day | $0 |
| ipapi.co | 1k requests/day | Geolocation | $0 |
| **Total** | | | **$0/month** |

**Upgrade Path (if traffic grows):**
- Vercel Pro: $20/month (1TB bandwidth)
- Upstash Pro: $10/month (1M commands/day)
- YouTube API Quota Increase: Free (request via Google Cloud Console)

---

## Known Limitations

1. **YouTube API Quota:**
   - Default: 10,000 units/day (~3 playlists)
   - Workaround: Request quota increase (free, approved in 1-2 days)

2. **Scraping Accuracy:**
   - Depends on website HTML structure
   - Some sites may block scrapers (robots.txt, rate limiting)
   - Recommendation: Test with 5-10 different radio station URLs

3. **Song Matching:**
   - YouTube search may return incorrect videos
   - No manual override (future feature)

4. **Analytics:**
   - Geolocation accuracy: city-level (not exact address)
   - IP-based tracking: VPNs counted as unique visitors

---

## Future Enhancements

**Phase 2 (Planned):**
- Radio station search (Radio-Browser API)
- Manual song override (edit playlist before creation)
- Playlist history (view all created playlists)
- Export to Spotify/Apple Music
- Multi-language support

**Phase 3 (Ideas):**
- AI-powered song matching (better accuracy)
- Collaborative playlists (multiple users)
- Playlist analytics (most popular songs, trends)

---

## Troubleshooting

### "Deployment failed" on Vercel
- **Fix:** Check build logs → ensure all dependencies in `package.json`
- **Common missing:** `cheerio`, `@upstash/redis`, `tailwindcss`, `postcss`, `autoprefixer`

### "No songs found on this page"
- **Fix:** Check if website uses JavaScript rendering (requires headless browser)
- **Workaround:** Try a different radio station URL

### "YouTube API quota exceeded"
- **Fix:** Wait 24 hours (quota resets daily)
- **Long-term:** Request quota increase via [Google Cloud Console](https://console.cloud.google.com/)

### Visitor count resets to 0
- **Cause:** In-memory storage (no Redis configured)
- **Fix:** Add Upstash Redis credentials to `.env.local` / Vercel env vars

### Map shows no visitors
- **Cause:** No geolocation data yet (requires Redis + ipapi.co)
- **Fix:** Wait for users to visit, or manually test with `POST /api/user-activity`

---

## Contributing

This is a personal project by Rithvik Javgal. For suggestions or bug reports, please open an issue on GitHub.

---

## License

MIT License — feel free to fork and modify for your own use.

---

## Credits

**Developer:** Rithvik Javgal
**Design:** Light grey theme with musical instrument wallpaper
**Inspiration:** "The app you never knew you needed but always deserved."

**Third-party Services:**
- Google OAuth & YouTube API
- Upstash Redis
- ipapi.co (geolocation)
- Vercel (hosting)

---

## Changelog

### v2.0.0 (2026-02-02)
- Complete redesign: dark theme → light grey theme
- URL input (replaced HTML file upload)
- Generic playlist scraper (supports 20 songs)
- Real visitor analytics with global map
- User activity logging (email, IP, location, actions)
- Feedback widget (sunshine/thunderstorm)
- Workflow block diagram
- Greyscale icon design
- Courier New + Playfair Display fonts
- Redis-backed storage (Upstash)
- Deployed to Vercel at bihag.vercel.app

### v1.0.0 (2024)
- Initial version (HTML upload only)
- Dark theme UI
- 10-song limit
- Billboard/Spotify parsers
- Basic YouTube integration

---

**The app you never knew you needed but always deserved.**

For questions or support, contact: rithviksj@gmail.com
