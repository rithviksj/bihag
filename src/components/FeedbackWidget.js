"use client";

import { useState } from "react";

export default function FeedbackWidget() {
  const [showFeedback, setShowFeedback] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sentiment, setSentiment] = useState(null);

  const handleFeedback = async (type) => {
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type }),
      });

      if (response.ok) {
        setSentiment(type);
        setSubmitted(true);
        setTimeout(() => {
          setShowFeedback(false);
          setSubmitted(false);
        }, 2000);
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!showFeedback && (
        <button
          onClick={() => setShowFeedback(true)}
          className="bg-white rounded-full shadow-lg p-3 hover:shadow-xl transition-all duration-200 border border-gray-200 group"
          title="Give feedback"
        >
          <svg
            className="w-6 h-6 text-gray-600 group-hover:text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </button>
      )}

      {showFeedback && !submitted && (
        <div className="bg-white rounded-lg shadow-2xl p-6 border border-gray-200 animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-800">
              How was your experience?
            </h3>
            <button
              onClick={() => setShowFeedback(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          <div className="flex space-x-4">
            {/* Sunshine - Positive */}
            <button
              onClick={() => handleFeedback("positive")}
              className="flex-1 flex flex-col items-center space-y-2 p-4 rounded-lg border-2 border-gray-200 hover:border-yellow-400 hover:bg-yellow-50 transition-all duration-200 group"
              title="Positive feedback"
            >
              <span className="text-4xl group-hover:scale-110 transition-transform">
                ☀️
              </span>
              <span className="text-xs font-medium text-gray-700">Great!</span>
            </button>

            {/* Thunderstorm - Negative */}
            <button
              onClick={() => handleFeedback("negative")}
              className="flex-1 flex flex-col items-center space-y-2 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group"
              title="Negative feedback"
            >
              <span className="text-4xl group-hover:scale-110 transition-transform">
                ⛈️
              </span>
              <span className="text-xs font-medium text-gray-700">
                Needs work
              </span>
            </button>
          </div>
        </div>
      )}

      {submitted && (
        <div className="bg-white rounded-lg shadow-2xl p-6 border border-gray-200 animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center space-x-2 text-green-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium">
              Thanks for your feedback!
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
