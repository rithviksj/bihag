import React from "react";

export function Button({ children, className = "", ...props }) {
  return (
    <button
      className={`px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-900/50 hover:shadow-xl hover:shadow-cyan-800/60 transition-all duration-300 transform hover:scale-105 border border-cyan-400/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
