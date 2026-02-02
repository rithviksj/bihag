import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

// Initialize Redis client
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Fallback in-memory storage for development (resets on server restart)
let visitorCount = 0;
const visitedIPs = new Set();

export async function GET() {
  try {
    if (redis) {
      // Fetch total unique visitors from Redis
      const count = await redis.scard("unique_visitors") || 0;
      return NextResponse.json({ count: Number(count) });
    }

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

    const body = await request.json();
    const { email } = body; // Email from OAuth authentication

    let isNewVisitor = false;

    if (redis) {
      // Use IP-based tracking for unique visitors
      const added = await redis.sadd("unique_visitors", ip);
      isNewVisitor = added === 1;

      // If email provided, also track authenticated users
      if (email) {
        await redis.sadd("authenticated_users", email);

        // Store visitor info with geolocation
        const visitorKey = `visitor:${ip}`;
        await redis.hset(visitorKey, {
          ip,
          email,
          lastVisit: new Date().toISOString(),
        });

        // Set expiry: 30 days
        await redis.expire(visitorKey, 30 * 24 * 60 * 60);
      }

      // Get updated count
      const totalCount = await redis.scard("unique_visitors");

      return NextResponse.json({
        count: Number(totalCount),
        isNewVisitor,
      });
    } else {
      // Fallback: in-memory
      if (!visitedIPs.has(ip)) {
        visitedIPs.add(ip);
        visitorCount++;
        isNewVisitor = true;
      }

      return NextResponse.json({
        count: visitorCount,
        isNewVisitor,
      });
    }
  } catch (error) {
    console.error("Error incrementing visitor count:", error);
    return NextResponse.json({ count: visitorCount || 0 });
  }
}
