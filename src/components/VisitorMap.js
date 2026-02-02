"use client";

import { useEffect, useState } from "react";

export default function VisitorMap() {
  const [visitors, setVisitors] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch real visitor locations from API
    const fetchLocations = async () => {
      try {
        const response = await fetch("/api/visitor-locations?limit=100");
        const data = await response.json();

        if (data.locations && data.locations.length > 0) {
          const formattedVisitors = data.locations.map((loc) => ({
            lat: loc.lat,
            lng: loc.lng,
            name: loc.city !== "Unknown" ? `${loc.city}, ${loc.country}` : loc.country,
            count: loc.count || 1,
          }));
          setVisitors(formattedVisitors);
          setTotalCount(data.total || formattedVisitors.length);
        } else {
          // If no real data yet, show empty map
          setVisitors([]);
          setTotalCount(0);
        }
      } catch (error) {
        console.error("Error fetching visitor locations:", error);
        // On error, show empty map
        setVisitors([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();

    // Refresh every 2 minutes for more responsive updates
    const interval = setInterval(fetchLocations, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Convert lat/lng to SVG coordinates (Equirectangular projection)
  const latLngToXY = (lat, lng) => {
    const x = ((lng + 180) / 360) * 1000;
    const y = ((90 - lat) / 180) * 500;
    return { x, y };
  };

  if (loading) {
    return (
      <div className="text-center space-y-4">
        <h3 className="text-xl font-semibold text-gray-800">🌍 Global Visitor Map</h3>
        <div className="bg-[#E5E5E5] rounded-xl p-6 shadow-2xl flex items-center justify-center h-64">
          <svg className="animate-spin h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </div>
    );
  }

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
          {visitors.length > 0 ? (
            <>📍 {totalCount} unique location{totalCount !== 1 ? "s" : ""} from around the world</>
          ) : (
            <>🌐 Visitors from around the world will appear here</>
          )}
        </p>
      </div>
    </div>
  );
}
