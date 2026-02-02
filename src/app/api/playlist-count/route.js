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

export async function GET() {
  try {
    if (redis) {
      // Count playlist_created actions in activity log
      const entries = await redis.zrange(
        "user_activity_log",
        0,
        "+inf",
        {
          byScore: true,
          rev: true,
          count: 1000 // Get up to 1000 entries
        }
      );

      let playlistCount = 0;
      for (const entry of entries) {
        try {
          const log = JSON.parse(entry);
          if (log.action === "playlist_created") {
            playlistCount++;
          }
        } catch (e) {
          // Skip parse errors
        }
      }

      return NextResponse.json({ count: playlistCount });
    }

    // Fallback
    return NextResponse.json({ count: 0 });
  } catch (error) {
    console.error("Error fetching playlist count:", error);
    return NextResponse.json({ count: 0 });
  }
}
