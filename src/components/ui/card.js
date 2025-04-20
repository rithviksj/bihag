export function Card({ children, className = "" }) {
  return (
    <div className={`rounded-lg border bg-white p-4 shadow ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }) {
  return <div className={`space-y-4 ${className}`}>{children}</div>;
}
