export function Button({ onClick, children, className = "", disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        bg-indigo-500 text-white px-6 py-3 rounded-lg
        font-medium transition-all duration-200
        hover:bg-indigo-600 hover:shadow-lg
        active:transform active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children}
    </button>
  );
}