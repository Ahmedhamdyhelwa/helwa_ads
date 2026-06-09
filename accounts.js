// components/Sparkline.js
export default function Sparkline({ data = [], color = "#7C3AED", height = 48 }) {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="sparkbar" style={{ height }}>
      {data.map((d, i) => (
        <div
          key={i}
          className="bar"
          title={`${d.label}: ${d.value}`}
          style={{
            height: `${Math.max(4, (d.value / max) * 100)}%`,
            background: color,
          }}
        />
      ))}
    </div>
  );
}
