import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

/**
 * Get visitor locations for the global map visualization
 * Returns array of {lat, lng, city, country} from recent activity logs
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");

    if (redis) {
      // Fetch recent activity logs with location data
      const entries = await redis.zrangebyscore(
        "user_activity_log",
        0,
        "+inf",
        { rev: true, count: limit }
      );

      // Parse and extract unique locations
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
              // Increment count for this location
              const loc = locationMap.get(key);
              loc.count++;
            }
          }
        } catch (parseError) {
          console.error("Parse error for visitor location:", parseError.message);
        }
      }

      const locations = Array.from(locationMap.values());

      return NextResponse.json({
        locations,
        total: locations.length,
      });
    } else {
      // Fallback: return empty for development
      return NextResponse.json({
        locations: [],
        total: 0,
        message: "Redis not configured. Using in-memory storage.",
      });
    }
  } catch (error) {
    console.error("Error fetching visitor locations:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch locations",
        locations: [],
        total: 0,
      },
      { status: 500 }
    );
  }
}
