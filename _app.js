// pages/admin/index.js
// Protected admin panel — add/remove/edit accounts, copy shareable links

import { useState, useEffect } from "react";
import Head from "next/head";
import Topbar from "../../components/Topbar";

const COLORS = ["#7C3AED","#0EA5E9","#10B981","#F59E0B","#EF4444","#EC4899","#8B5CF6","#06B6D4","#84CC16","#F97316"];

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ id: "", name: "", label: "", currency: "EGP", color: "#7C3AED" });
  const [copied, setCopied] = useState("");

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(""), 3000); };

  async function login() {
    const res = await fetch("/api/accounts");
    if (res.ok) { setAccounts(await res.json()); setAuthed(true); }
  }

  async function addAccount() {
    if (!form.id || !form.name) return flash("❌ أدخل ID والاسم");
    setLoading(true);
    const res = await fetch("/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, account: form }),
    });
    const data = await res.json();
    if (res.ok) { setAccounts(data.accounts); setForm({ id: "", name: "", label: "", currency: "EGP", color: "#7C3AED" }); flash("✅ تمت الإضافة!"); }
    else flash("❌ " + data.error);
    setLoading(false);
  }

  async function removeAccount(id) {
    if (!confirm("حذف الحساب؟")) return;
    const res = await fetch("/api/accounts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, id }),
    });
    if (res.ok) setAccounts((prev) => prev.filter((a) => a.id !== id));
  }

  function copyLink(id) {
    const url = `${window.location.origin}/dashboard/${id}`;
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(""), 2000);
  }

  if (!authed) {
    return (
      <>
        <Head><title>Admin — Ads Dashboard</title></Head>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Cairo, sans-serif" }}>
          <div className="card" style={{ width: 320, textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>🔒</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>لوحة الإدارة</div>
            <input
              type="password"
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
              style={{ marginBottom: 12 }}
            />
            <button
              className="btn"
              style={{ background: "#7C3AED", color: "#fff", width: "100%" }}
              onClick={login}
            >
              دخول
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head><title>Admin — إدارة الحسابات</title></Head>
      <Topbar title="لوحة الإدارة" subtitle="إدارة الحسابات والروابط" color="#7C3AED" />

      <div className="container" style={{ padding: "24px 20px 60px" }}>
        {msg && (
          <div className="card" style={{ marginBottom: 16, background: msg.startsWith("✅") ? "#F0FDF4" : "#FFF5F5", borderColor: msg.startsWith("✅") ? "#86EFAC" : "#FCA5A5" }}>
            {msg}
          </div>
        )}

        {/* Add account form */}
        <div className="card" style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>➕ إضافة حساب جديد</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>Account ID *</div>
              <input placeholder="مثال: 384151190910004" value={form.id} onChange={(e) => setForm((p) => ({ ...p, id: e.target.value }))} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>الاسم المختصر *</div>
              <input placeholder="مثال: LAMSA" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>اسم العميل / الوصف</div>
              <input placeholder="مثال: سُندس زى شرعى" value={form.label} onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>العملة</div>
              <select value={form.currency} onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))}>
                <option>EGP</option><option>USD</option><option>SAR</option><option>AED</option>
              </select>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>اللون</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {COLORS.map((c) => (
                  <div
                    key={c}
                    onClick={() => setForm((p) => ({ ...p, color: c }))}
                    style={{
                      width: 24, height: 24, borderRadius: "50%", background: c, cursor: "pointer",
                      border: form.color === c ? "2px solid #1A1035" : "2px solid transparent",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          <button
            className="btn"
            style={{ background: "#7C3AED", color: "#fff" }}
            onClick={addAccount}
            disabled={loading}
          >
            {loading ? "جارٍ الإضافة..." : "إضافة وتوليد اللينك"}
          </button>
        </div>

        {/* Accounts list */}
        <div className="card">
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
            📋 الحسابات ({accounts.length})
          </div>
          {accounts.map((a) => {
            const link = typeof window !== "undefined" ? `${window.location.origin}/dashboard/${a.id}` : `/dashboard/${a.id}`;
            return (
              <div
                key={a.id}
                style={{
                  display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
                  padding: "14px 0", borderBottom: "1px solid var(--border)",
                }}
              >
                {/* Color dot + name */}
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: a.color + "22", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 15, fontWeight: 900, color: a.color, flexShrink: 0,
                }}>
                  {a.name[0]}
                </div>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <div style={{ fontWeight: 700 }}>{a.name}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{a.label} · {a.id}</div>
                </div>

                {/* Link display */}
                <div style={{ flex: 2, minWidth: 200 }}>
                  <div style={{
                    background: "var(--bg)", borderRadius: 8, padding: "6px 12px",
                    fontSize: 12, fontFamily: "monospace", color: "var(--muted)",
                    wordBreak: "break-all",
                  }}>
                    /dashboard/{a.id}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="btn"
                    style={{ background: a.color, color: "#fff", padding: "7px 14px", fontSize: 13 }}
                    onClick={() => copyLink(a.id)}
                  >
                    {copied === a.id ? "✅ تم النسخ!" : "📋 نسخ اللينك"}
                  </button>
                  <a
                    href={`/dashboard/${a.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn"
                    style={{ background: "var(--bg)", color: "var(--text)", border: "1px solid var(--border)", padding: "7px 14px", fontSize: 13, textDecoration: "none" }}
                  >
                    فتح ↗
                  </a>
                  <button
                    className="btn"
                    style={{ background: "#FEE2E2", color: "#DC2626", padding: "7px 12px", fontSize: 13 }}
                    onClick={() => removeAccount(a.id)}
                  >
                    🗑
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
