"use client";

import { useEffect, useState } from "react";

export default function VisitorMap() {
  const [visitors, setVisitors] = useState([
    { lat: 37.7749, lng: -122.4194, name: "San Francisco" },
    { lat: 40.7128, lng: -74.0060, name: "New York" },
    { lat: 51.5074, lng: -0.1278, name: "London" },
    { lat: 48.8566, lng: 2.3522, name: "Paris" },
    { lat: 35.6762, lng: 139.6503, name: "Tokyo" },
    { lat: -33.8688, lng: 151.2093, name: "Sydney" },
    { lat: 19.0760, lng: 72.8777, name: "Mumbai" },
    { lat: 1.3521, lng: 103.8198, name: "Singapore" },
    { lat: -23.5505, lng: -46.6333, name: "São Paulo" },
    { lat: 55.7558, lng: 37.6173, name: "Moscow" },
    { lat: 52.5200, lng: 13.4050, name: "Berlin" },
    { lat: 25.2048, lng: 55.2708, name: "Dubai" },
  ]);

  // Convert lat/lng to SVG coordinates (Equirectangular projection)
  const latLngToXY = (lat, lng) => {
    const x = ((lng + 180) / 360) * 1000;
    const y = ((90 - lat) / 180) * 500;
    return { x, y };
  };

  return (
    <div className="text-center space-y-4">
      <h3 className="text-xl font-semibold text-gray-800">🌍 Global Visitor Map</h3>
      <div className="bg-[#E5E5E5] rounded-xl p-6 shadow-2xl">
        <svg viewBox="0 0 1000 500" className="w-full h-auto" style={{ background: '#E5E5E5' }}>
          {/* Use an embedded world map image as background */}
          <image
            href="https://upload.wikimedia.org/wikipedia/commons/8/83/Equirectangular_projection_SW.jpg"
            x="0"
            y="0"
            width="1000"
            height="500"
            opacity="0.3"
          />

          {/* Grid lines for reference */}
          <g stroke="#999" strokeWidth="0.5" opacity="0.3">
            {/* Latitude lines */}
            {[0, 100, 200, 300, 400, 500].map(y => (
              <line key={`lat-${y}`} x1="0" y1={y} x2="1000" y2={y} />
            ))}
            {/* Longitude lines */}
            {[0, 200, 400, 600, 800, 1000].map(x => (
              <line key={`lng-${x}`} x1={x} y1="0" x2={x} y2="500" />
            ))}
          </g>

          {/* Visitor dots */}
          {visitors.map((visitor, i) => {
            const { x, y } = latLngToXY(visitor.lat, visitor.lng);
            return (
              <g key={i}>
                {/* Pulsing circle effect */}
                <circle cx={x} cy={y} r="6" fill="#06b6d4" opacity="0.4">
                  <animate attributeName="r" from="6" to="18" dur="2s" begin={`${i * 0.15}s`} repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.4" to="0" dur="2s" begin={`${i * 0.15}s`} repeatCount="indefinite" />
                </circle>
                {/* Dot */}
                <circle cx={x} cy={y} r="6" fill="#0891b2" stroke="#06b6d4" strokeWidth="2">
                  <title>{visitor.name}</title>
                </circle>
              </g>
            );
          })}
        </svg>
        <p className="text-sm text-gray-600 mt-4 font-sans">
          📍 {visitors.length} active visitors from around the world
        </p>
      </div>
    </div>
  );
}
