"use client";

import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head />
      <body className="relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
          {[...Array(20)].map((_, i) => (
            <span
              key={i}
              className="absolute text-white opacity-30 text-xl"
              style={{
                left: `${Math.random() * 100}%`,
                animation: `drizzle 6s linear infinite`, animationDelay: `${Math.random() * 8}s`
              }}
            >
              🎵
            </span>
          ))}
        </div>
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
