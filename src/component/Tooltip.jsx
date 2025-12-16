export default function Tooltip({ x, y, children }) {
  if (!children) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: y + 10,
        left: x + 10,
        background: "#fff",
        padding: 8,
        borderRadius: 6,
        fontSize: 12,
        boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
        pointerEvents: "none",
        zIndex: 1000,
      }}
    >
      {children}
    </div>
  );
}
