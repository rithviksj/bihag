"use client";

import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head />
      <body className="relative overflow-hidden text-white">
        {/* Full-screen background gradient */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#1e3a8a] via-[#6b21a8] to-[#1e40af]" />

        {/* Drizzling music notes (right side only) */}
        <div className="absolute top-0 right-0 w-1/2 h-full pointer-events-none z-10">
          {[...Array(20)].map((_, i) => {
            const randomLeft = Math.floor(Math.random() * 100);
            const randomDelay = (Math.random() * 8).toFixed(2);
            return (
              <span
                key={i}
                className="absolute text-white opacity-40 text-xl"
                style={{
                  left: `${randomLeft}%`,
                  top: "-2rem",
                  animation: `drizzle 6s linear infinite`,
                  animationDelay: `${randomDelay}s`
                }}
              >
                🎵
              </span>
            );
          })}
        </div>

        {/* Lo-fi character sketch at bottom center */}
        <div className="absolute bottom-0 left-0 w-full flex justify-center mb-6 z-10">
          <img
            src="https://cdn.jsdelivr.net/gh/rithviksj/static/bihag-sketch-headphones-window.png"
            alt="Lo-fi sketch of person with headphones"
            className="w-64 h-auto opacity-90"
          />
        </div>

        {/* Main content container with frosted backdrop */}
        <div className="relative z-20 backdrop-blur-md bg-white/10 rounded-xl shadow-lg mx-auto my-12 p-6 max-w-4xl">
          {children}
        </div>
      </body>
    </html>
  );
}
