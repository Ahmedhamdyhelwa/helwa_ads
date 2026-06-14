// pages/dashboard/[accountId].js
// This is the shareable link you send to each client.
// Auto-refreshes every hour via SWR revalidation.

import { useState } from "react";
import useSWR from "swr";
import Head from "next/head";
import Topbar from "../../components/Topbar";
import Sparkline from "../../components/Sparkline";
import { getAccount } from "../../lib/accounts";

const fetcher = (url) => fetch(url).then((r) => r.json());

function fmt(n, dec = 0) {
  if (n == null || n === "" || isNaN(n)) return "—";
  return parseFloat(n).toLocaleString("ar-EG", { maximumFractionDigits: dec });
}

export default function ClientDashboard({ accountId, initialAccount }) {
  const [preset, setPreset] = useState("last_7d");
  const { data, error, isLoading, mutate } = useSWR(
    `/api/insights/${accountId}?preset=${preset}`,
    fetcher,
    { refreshInterval: 3600000 } // auto-refresh every hour
  );

  const acc = data?.account || initialAccount;
  const color = acc?.color || "#7C3AED";
  const s = data?.summary;
  const campaigns = data?.campaigns || [];

  const presets = [
    { v: "yesterday",  l: "أمس" },
    { v: "last_7d",   l: "7 أيام" },
    { v: "last_14d",  l: "14 يوم" },
    { v: "last_30d",  l: "30 يوم" },
    { v: "this_month", l: "هذا الشهر" },
  ];

  return (
    <>
      <Head>
        <title>{acc?.name || "Dashboard"} — نتائج الإعلانات</title>
        <meta name="robots" content="noindex" />
      </Head>

      <Topbar
        title={acc?.name || "Dashboard"}
        subtitle={acc?.label}
        color={color}
        right={
          <button
            className="btn btn-outline"
            style={{ "--accent": color, fontSize: 13, padding: "7px 14px" }}
            onClick={() => mutate()}
          >
            {isLoading ? "⟳ جارٍ..." : "⟳ تحديث"}
          </button>
        }
      />

      <div className="container" style={{ padding: "24px 20px 60px", "--accent": color }}>

        {/* Date preset selector */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
          {presets.map((p) => (
            <button
              key={p.v}
              onClick={() => setPreset(p.v)}
              style={{
                border: "none", borderRadius: 8,
                padding: "7px 14px", fontSize: 13,
                fontFamily: "Cairo, sans-serif", cursor: "pointer",
                fontWeight: preset === p.v ? 700 : 400,
                background: preset === p.v ? color : "white",
                color: preset === p.v ? "#fff" : "var(--muted)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              }}
            >
              {p.l}
            </button>
          ))}
        </div>

        {error && (
          <div className="card" style={{ borderColor: "#FEE2E2", background: "#FFF5F5", color: "#DC2626", marginBottom: 20 }}>
            خطأ في جلب البيانات. تأكد من صلاحية التوكن وأن الحساب نشط.
          </div>
        )}

        {/* KPI Grid */}
        {s ? (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 24 }}>
              {[
                { label: "الإنفاق الكلي",    value: `${fmt(s.spend, 2)} ${acc?.currency || "EGP"}`, highlight: true },
                { label: "النتائج",           value: fmt(s.results) },
                { label: "تكلفة / نتيجة",    value: s.cpr ? `${fmt(s.cpr, 2)} ${acc?.currency || "EGP"}` : "—" },
                { label: "نسبة النقر CTR",    value: s.ctr ? `${fmt(s.ctr, 2)}%` : "—" },
                { label: "الوصول",            value: fmt(s.reach) },
                { label: "الانطباعات",        value: fmt(s.impressions) },
                ...(s.roas ? [{ label: "ROAS", value: `${fmt(s.roas, 2)}x` }] : []),
                ...(s.messages ? [{ label: "الرسائل", value: fmt(s.messages) }] : []),
                ...(s.purchases ? [{ label: "المشتريات", value: fmt(s.purchases) }] : []),
              ].map((m, i) => (
                <div key={i} className="metric card" style={{ padding: 16 }}>
                  <div className="label">{m.label}</div>
                  <div className="value mono" style={m.highlight ? { color } : {}}>{m.value}</div>
                  {i === 0 && s.dateRange && <div className="sub">{s.dateRange}</div>}
                </div>
              ))}
            </div>

            {/* Sparkline */}
            {s.dailyData?.length > 1 && (
              <div className="card" style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: "var(--muted)" }}>
                  الإنفاق اليومي
                </div>
                <Sparkline
                  data={s.dailyData.map((d) => ({ label: d.date, value: d.spend }))}
                  color={color}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
                  <span>{s.dailyData[0]?.date}</span>
                  <span>{s.dailyData[s.dailyData.length - 1]?.date}</span>
                </div>
              </div>
            )}
          </>
        ) : isLoading ? (
          <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--muted)", marginBottom: 24 }}>
            <span className="spinning" style={{ fontSize: 28 }}>⟳</span>
            <div style={{ marginTop: 10 }}>جارٍ تحميل البيانات...</div>
          </div>
        ) : null}

        {/* Campaigns table */}
        {campaigns.length > 0 && (
          <div className="card">
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>الحملات الإعلانية</div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>الحملة</th>
                    <th>الحالة</th>
                    <th>الإنفاق</th>
                    <th>النتائج</th>
                    <th>CTR</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600 }}>{c.name}</td>
                      <td>
                        <span className={`badge ${c.status === "ACTIVE" ? "badge-green" : "badge-gray"}`}>
                          {c.status === "ACTIVE" ? "نشط" : "موقوف"}
                        </span>
                      </td>
                      <td className="mono">{fmt(c.spend, 2)}</td>
                      <td className="mono">{fmt(c.results)}</td>
                      <td className="mono">{fmt(c.ctr, 2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 40, fontSize: 12, color: "var(--muted)" }}>
          آخر تحديث: {data?.fetchedAt ? new Date(data.fetchedAt).toLocaleString("ar-EG") : "—"}
          &nbsp;·&nbsp; يتجدد تلقائياً كل ساعة
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps({ params }) {
  const { getAccount } = await import("../../lib/accounts");
  const account = getAccount(params.accountId);
  if (!account) return { notFound: true };
  return { props: { accountId: params.accountId, initialAccount: account } };
}
