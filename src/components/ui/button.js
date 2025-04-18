export function Button({ children, ...props }) {
  return (
    <button className="bg-black text-white px-4 py-2 rounded" {...props}>
      {children}
    </button>
  );
}
