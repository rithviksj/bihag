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
 * Test endpoint to manually create activity log and verify Redis write/read
 */
export async function GET(request) {
  try {
    if (!redis) {
      return NextResponse.json({
        error: "Redis not configured",
      });
    }

    // Create a test activity entry
    const testEntry = {
      timestamp: new Date().toISOString(),
      email: "test@example.com",
      ip: "127.0.0.1",
      userAgent: "Test Agent",
      action: "test_action",
      location: {
        country: "United States",
        city: "San Francisco",
        lat: 37.7749,
        lng: -122.4194,
        region: "California",
      },
      metadata: {
        test: true,
      },
    };

    // Write to Redis
    const score = Date.now();
    await redis.zadd("user_activity_log", {
      score,
      member: JSON.stringify(testEntry),
    });

    // Read back from Redis (last 5 entries by rank, not score)
    const entries = await redis.zrange(
      "user_activity_log",
      -5,
      -1,
      {
        rev: false // Get last 5 items
      }
    );

    const logs = entries.map((entry) => {
      try {
        return JSON.parse(entry);
      } catch {
        return { error: "Parse error", raw: entry };
      }
    });

    // Get total count
    const totalCount = await redis.zcard("user_activity_log");

    return NextResponse.json({
      success: true,
      testEntryWritten: testEntry,
      totalLogsInRedis: totalCount,
      recentLogs: logs,
      message: "Test activity log created and retrieved successfully",
    });

  } catch (error) {
    console.error("Test activity error:", error);
    return NextResponse.json(
      {
        error: "Test failed",
        details: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
