export function Button({ children, ...props }) {
  return (
    <button
      {...props}
      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow disabled:opacity-50"
    >
      {children}
    </button>
  );
}