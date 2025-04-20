export function Button({ onClick, children, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition ${className}`}
    >
      {children}
    </button>
  );
}
