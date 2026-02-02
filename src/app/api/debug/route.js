import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

/**
 * Debug endpoint to check Redis data
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "status";

    if (!redis) {
      return NextResponse.json({
        error: "Redis not configured",
        status: "Redis client is null - check environment variables",
      });
    }

    if (action === "status") {
      // Get counts
      const visitorCount = await redis.scard("unique_visitors") || 0;
      const activityCount = await redis.zcard("user_activity_log") || 0;
      const authenticatedCount = await redis.scard("authenticated_users") || 0;

      return NextResponse.json({
        status: "Redis connected",
        counts: {
          uniqueVisitors: visitorCount,
          activityLogs: activityCount,
          authenticatedUsers: authenticatedCount,
        },
      });
    }

    if (action === "recent_activity") {
      // Get recent activity entries
      const entries = await redis.zrangebyscore(
        "user_activity_log",
        0,
        "+inf",
        { rev: true, count: 5 }
      );

      const logs = entries.map((entry) => {
        try {
          return JSON.parse(entry);
        } catch {
          return { error: "Parse error", raw: entry };
        }
      });

      return NextResponse.json({
        recentActivity: logs,
        count: logs.length,
      });
    }

    if (action === "locations") {
      // Get activity entries with locations
      const entries = await redis.zrangebyscore(
        "user_activity_log",
        0,
        "+inf",
        { rev: true, count: 100 }
      );

      const locationMap = new Map();

      for (const entry of entries) {
        try {
          const log = JSON.parse(entry);
          if (log.location && log.location.lat && log.location.lng) {
            const key = `${log.location.lat},${log.location.lng}`;
            if (!locationMap.has(key)) {
              locationMap.set(key, {
                lat: log.location.lat,
                lng: log.location.lng,
                city: log.location.city || "Unknown",
                country: log.location.country || "Unknown",
                count: 1,
              });
            } else {
              locationMap.get(key).count++;
            }
          }
        } catch (parseError) {
          console.error("Parse error:", parseError);
        }
      }

      const locations = Array.from(locationMap.values());

      return NextResponse.json({
        locations,
        total: locations.length,
        totalEntries: entries.length,
      });
    }

    return NextResponse.json({
      availableActions: ["status", "recent_activity", "locations"],
      usage: "/api/debug?action=status",
    });

  } catch (error) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json(
      { error: "Debug failed", details: error.message },
      { status: 500 }
    );
  }
}
