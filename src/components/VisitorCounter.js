"use client";

import { useEffect, useState } from "react";

export default function VisitorCounter() {
  const [count, setCount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Increment visitor count on mount
    const incrementVisitor = async () => {
      try {
        const response = await fetch("/api/visitor-count", {
          method: "POST",
        });
        const data = await response.json();
        setCount(data.count);
      } catch (error) {
        console.error("Error tracking visitor:", error);
        // Fallback: fetch current count
        try {
          const response = await fetch("/api/visitor-count");
          const data = await response.json();
          setCount(data.count);
        } catch (e) {
          console.error("Error fetching count:", e);
        }
      } finally {
        setLoading(false);
      }
    };

    // Debounce to avoid double-counting in strict mode
    const timeout = setTimeout(incrementVisitor, 100);
    return () => clearTimeout(timeout);
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
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
      </svg>
      <span className="text-lg">👥 {count.toLocaleString()} visitor{count !== 1 ? "s" : ""}</span>
    </div>
  );
}
