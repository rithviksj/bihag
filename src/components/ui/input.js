export function Input({ className = "", ...props }) {
  return (
    <input
      className={`
        border border-gray-300 rounded-lg px-4 py-3
        text-gray-900 placeholder-gray-500
        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
        transition-all duration-200
        ${className}
      `}
      {...props}
    />
  );
}