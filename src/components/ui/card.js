export function Card({ children, className = "" }) {
  return <div className={`rounded-lg overflow-hidden ${className}`}>{children}</div>;
}

export function CardContent({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}