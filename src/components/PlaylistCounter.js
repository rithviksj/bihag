"use client";

import { useEffect, useState } from "react";

export default function PlaylistCounter() {
  const [count, setCount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await fetch("/api/playlist-count");
        const data = await response.json();
        setCount(data.count);
      } catch (error) {
        console.error("Error fetching playlist count:", error);
        setCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchCount();

    // Refresh every 30 seconds
    const interval = setInterval(fetchCount, 30 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading || count === null) {
    return (
      <div className="flex items-center space-x-2 text-gray-400 text-sm">
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-gray-700 text-base font-medium">
      <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
      </svg>
      <span className="text-lg">🎵 {count.toLocaleString()} playlist{count !== 1 ? "s" : ""} created</span>
    </div>
  );
}
