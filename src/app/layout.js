"use client";

import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head />
      <body className="relative overflow-hidden text-white">
        {/* Light blue gradient background */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-200 via-blue-300 to-blue-400" />

        {/* Main content container */}
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
