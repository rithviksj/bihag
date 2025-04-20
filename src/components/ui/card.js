export function Card({ children, className = "" }) {
  return (
    <div className={`rounded-xl border bg-white/80 backdrop-blur-sm p-6 shadow-xl ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }) {
  return <div className={`space-y-6 ${className}`}>{children}</div>;
}