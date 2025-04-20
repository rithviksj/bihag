export function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 ${className}`}
    />
  );
}