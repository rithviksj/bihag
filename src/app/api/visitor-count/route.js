import { NextResponse } from "next/server";

// Simple in-memory counter (resets on server restart)
// For production with Upstash Redis, uncomment the Redis implementation below
let visitorCount = 0;
const visitedIPs = new Set();

/*
// Upstash Redis implementation (requires env variables)
import { Redis } from "@upstash/redis";

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;
*/

export async function GET() {
  try {
    /*
    // Redis implementation
    if (redis) {
      const count = await redis.get("visitor_count") || 0;
      return NextResponse.json({ count: Number(count) });
    }
    */

    return NextResponse.json({ count: visitorCount });
  } catch (error) {
    console.error("Error fetching visitor count:", error);
    return NextResponse.json({ count: 0 });
  }
}

export async function POST(request) {
  try {
    // Get client IP
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Only increment if this IP hasn't visited in this session
    if (!visitedIPs.has(ip)) {
      visitedIPs.add(ip);
      visitorCount++;

      /*
      // Redis implementation
      if (redis) {
        await redis.incr("visitor_count");
      }
      */
    }

    return NextResponse.json({ count: visitorCount });
  } catch (error) {
    console.error("Error incrementing visitor count:", error);
    return NextResponse.json({ count: visitorCount });
  }
}
