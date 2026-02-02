import { NextResponse } from "next/server";

// Simple in-memory storage (resets on server restart)
let feedbackData = {
  positive: 0,
  negative: 0,
};

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
      const positive = await redis.get("feedback_positive") || 0;
      const negative = await redis.get("feedback_negative") || 0;
      return NextResponse.json({
        positive: Number(positive),
        negative: Number(negative),
        total: Number(positive) + Number(negative),
      });
    }
    */

    return NextResponse.json({
      positive: feedbackData.positive,
      negative: feedbackData.negative,
      total: feedbackData.positive + feedbackData.negative,
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json({ positive: 0, negative: 0, total: 0 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { type } = body;

    if (type !== "positive" && type !== "negative") {
      return NextResponse.json(
        { error: "Invalid feedback type" },
        { status: 400 }
      );
    }

    if (type === "positive") {
      feedbackData.positive++;
    } else {
      feedbackData.negative++;
    }

    /*
    // Redis implementation
    if (redis) {
      if (type === "positive") {
        await redis.incr("feedback_positive");
      } else {
        await redis.incr("feedback_negative");
      }
    }
    */

    return NextResponse.json({
      success: true,
      positive: feedbackData.positive,
      negative: feedbackData.negative,
      total: feedbackData.positive + feedbackData.negative,
    });
  } catch (error) {
    console.error("Error recording feedback:", error);
    return NextResponse.json(
      { error: "Failed to record feedback" },
      { status: 500 }
    );
  }
}
