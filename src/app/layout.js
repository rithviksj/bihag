"use client";

import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head />
      <body className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 text-white">
        <div className="absolute top-0 right-0 w-1/2 h-full pointer-events-none z-0">
          {[...Array(20)].map((_, i) => {
            const randomLeft = Math.floor(Math.random() * 100);
            const randomDelay = (Math.random() * 8).toFixed(2);
            return (
              <span
                key={i}
                className="absolute text-white opacity-30 text-xl"
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

        <div className="absolute bottom-0 left-0 w-full flex justify-center mb-6 z-0">
          <img
            src="https://cdn.jsdelivr.net/gh/rithviksj/static/bihag-sketch-headphones-window.png"
            alt="Lo-fi sketch of person with headphones"
            className="w-64 h-auto opacity-80"
          />
        </div>

        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
