export function Input({ className = "", ...props }) {
  return (
    <input
      className={`border border-gray-300 rounded px-3 py-2 text-sm w-full ${className}`}
      {...props}
    />
  );
}
