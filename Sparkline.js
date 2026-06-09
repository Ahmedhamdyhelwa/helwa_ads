// components/Topbar.js
export default function Topbar({ title, subtitle, color = "#7C3AED", right }) {
  return (
    <div className="topbar" style={{ "--accent": color }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 36, height: 36, borderRadius: 9,
            background: color + "22", display: "flex",
            alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 900, color,
          }}
        >
          📊
        </div>
        <div>
          <div className="logo" style={{ color }}>{title}</div>
          {subtitle && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 1 }}>{subtitle}</div>}
        </div>
      </div>
      {right}
    </div>
  );
}
