import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Fallback in-memory storage for development
let activityLog = [];

/**
 * Log user activity (page visit, playlist creation, etc.)
 * Stores: timestamp, user email, IP, location, action type
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { email, action, metadata } = body;

    // Get client IP and user agent
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const userAgent = request.headers.get("user-agent") || "unknown";

    // Fetch geolocation from IP (using ipapi.co free tier)
    let location = { country: "Unknown", city: "Unknown", lat: null, lng: null };

    if (ip !== "unknown" && !ip.startsWith("192.168.") && !ip.startsWith("127.")) {
      try {
        const geoResponse = await fetch(`https://ipapi.co/${ip}/json/`, {
          headers: { "User-Agent": "Bihag-Analytics/2.0" },
        });

        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          location = {
            country: geoData.country_name || "Unknown",
            city: geoData.city || "Unknown",
            lat: geoData.latitude || null,
            lng: geoData.longitude || null,
            region: geoData.region || null,
          };
        }
      } catch (geoError) {
        console.error("Geolocation fetch error:", geoError.message);
      }
    }

    const activityEntry = {
      timestamp: new Date().toISOString(),
      email: email || "anonymous",
      ip,
      userAgent,
      action: action || "page_visit",
      location,
      metadata: metadata || {},
    };

    if (redis) {
      // Store in Redis with sorted set (sorted by timestamp)
      const score = Date.now();
      await redis.zadd("user_activity_log", {
        score,
        member: JSON.stringify(activityEntry),
      });

      // Keep only last 10,000 entries (auto-cleanup)
      const totalEntries = await redis.zcard("user_activity_log");
      if (totalEntries > 10000) {
        await redis.zremrangebyrank("user_activity_log", 0, totalEntries - 10001);
      }
    } else {
      // Fallback: in-memory storage
      activityLog.push(activityEntry);
      if (activityLog.length > 1000) {
        activityLog = activityLog.slice(-1000);
      }
    }

    return NextResponse.json({ success: true, logged: activityEntry });
  } catch (error) {
    console.error("Error logging user activity:", error);
    return NextResponse.json(
      { error: "Failed to log activity", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Retrieve activity logs (admin/audit endpoint)
 * Query params: limit (default 100), since (timestamp)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100");
    const since = searchParams.get("since"); // ISO timestamp

    let logs = [];

    if (redis) {
      // Fetch from Redis (most recent first)
      const minScore = since ? new Date(since).getTime() : 0;
      const entries = await redis.zrangebyscore(
        "user_activity_log",
        minScore,
        "+inf",
        { rev: true, count: limit }
      );

      logs = entries.map((entry) => {
        try {
          return JSON.parse(entry);
        } catch {
          return { error: "Parse error", raw: entry };
        }
      });
    } else {
      // Fallback: in-memory
      logs = activityLog.slice(-limit).reverse();
    }

    // Summary stats
    const totalLogs = redis ? await redis.zcard("user_activity_log") : activityLog.length;
    const uniqueUsers = new Set(logs.map((log) => log.email)).size;
    const uniqueIPs = new Set(logs.map((log) => log.ip)).size;

    return NextResponse.json({
      logs,
      stats: {
        total: totalLogs,
        returned: logs.length,
        uniqueUsers,
        uniqueIPs,
      },
    });
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch logs", details: error.message },
      { status: 500 }
    );
  }
}
