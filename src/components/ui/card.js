export function Card({ className = "", children }) {
  return (
    <div className={`rounded-xl border border-gray-200 ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ className = "", children }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}
