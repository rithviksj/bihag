import React from "react";

export function Button({ children, className = "", ...props }) {
  return (
    <button
      className={`px-5 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors duration-200 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
