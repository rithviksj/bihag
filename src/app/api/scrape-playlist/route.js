import { NextResponse } from "next/server";
import { scrapePlaylist } from "@/lib/playlistScraper";

// Rate limiting map (simple in-memory, resets on server restart)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

function checkRateLimit(ip) {
  const now = Date.now();
  const userRequests = rateLimitMap.get(ip) || [];

  // Remove expired requests
  const validRequests = userRequests.filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW
  );

  if (validRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    return false; // Rate limit exceeded
  }

  // Add current request
  validRequests.push(now);
  rateLimitMap.set(ip, validRequests);

  return true;
}

export async function POST(request) {
  try {
    // Get client IP for rate limiting
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          error:
            "Too many requests. Please wait a minute before trying again.",
        },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { url } = body;

    // Validate input
    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    if (typeof url !== "string") {
      return NextResponse.json(
        { error: "URL must be a string" },
        { status: 400 }
      );
    }

    // URL length check
    if (url.length > 2000) {
      return NextResponse.json(
        { error: "URL is too long" },
        { status: 400 }
      );
    }

    // Scrape the playlist
    const result = await scrapePlaylist(url);

    if (result.error) {
      return NextResponse.json(
        {
          error: result.error,
          songs: [],
          count: 0,
        },
        { status: 200 } // Return 200 with error message in body
      );
    }

    return NextResponse.json({
      songs: result.songs,
      count: result.count,
      success: true,
    });
  } catch (error) {
    console.error("API Error:", error);

    return NextResponse.json(
      {
        error: "Internal server error. Please try again later.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// Return 405 for non-POST requests
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST." },
    { status: 405 }
  );
}
