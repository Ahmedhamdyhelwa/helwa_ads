// lib/facebook.js
// Fetches performance data from Facebook Marketing API for a given account

const BASE = "https://graph.facebook.com/v19.0";
const TOKEN = process.env.FB_ACCESS_TOKEN;

/**
 * Fetch top-level account insights (last 7 days by default, or 'last_30d')
 */
export async function getAccountInsights(accountId, datePreset = "last_7d") {
  const fields = [
    "spend",
    "impressions",
    "reach",
    "clicks",
    "ctr",
    "cpc",
    "cpm",
    "actions",
    "cost_per_action_type",
    "purchase_roas",
    "date_start",
    "date_stop",
  ].join(",");

  const url = `${BASE}/act_${accountId}/insights?fields=${fields}&date_preset=${datePreset}&time_increment=1&access_token=${TOKEN}`;
  const res = await fetch(url, { next: { revalidate: Number(process.env.REVALIDATE_SECONDS || 3600) } });
  if (!res.ok) throw new Error(`FB API error ${res.status}`);
  const json = await res.json();
  return json.data || [];
}

/**
 * Fetch campaigns with their status and daily spend
 */
export async function getCampaigns(accountId) {
  const fields = "name,status,objective,daily_budget,lifetime_budget,insights.date_preset(last_7d){spend,impressions,clicks,ctr,actions,cost_per_action_type}";
  const url = `${BASE}/act_${accountId}/campaigns?fields=${fields}&limit=50&access_token=${TOKEN}`;
  const res = await fetch(url, { next: { revalidate: Number(process.env.REVALIDATE_SECONDS || 3600) } });
  if (!res.ok) throw new Error(`FB API error ${res.status}`);
  const json = await res.json();
  return json.data || [];
}

/**
 * Fetch ad sets with audience size warnings
 */
export async function getAdSets(accountId) {
  const fields = "name,status,targeting,budget_remaining,insights.date_preset(last_7d){spend,impressions,clicks,ctr,actions,cost_per_action_type,reach}";
  const url = `${BASE}/act_${accountId}/adsets?fields=${fields}&limit=50&access_token=${TOKEN}`;
  const res = await fetch(url, { next: { revalidate: Number(process.env.REVALIDATE_SECONDS || 3600) } });
  if (!res.ok) throw new Error(`FB API error ${res.status}`);
  const json = await res.json();
  return json.data || [];
}

/**
 * Extract a specific action value (e.g. 'omni_purchase', 'onsite_conversion.messaging_conversation_started_7d')
 */
export function extractAction(actions = [], type) {
  return actions?.find((a) => a.action_type === type)?.value || null;
}

/**
 * Aggregate daily insights into summary totals
 */
export function aggregateInsights(days = []) {
  if (!days.length) return null;
  const sum = (key) => days.reduce((t, d) => t + parseFloat(d[key] || 0), 0);
  const last = days[days.length - 1];
  const allActions = days.flatMap((d) => d.actions || []);

  // merge actions by type
  const actionMap = {};
  allActions.forEach(({ action_type, value }) => {
    actionMap[action_type] = (actionMap[action_type] || 0) + parseFloat(value || 0);
  });

  const spend = sum("spend");
  const results =
    actionMap["omni_purchase"] ||
    actionMap["onsite_conversion.messaging_conversation_started_7d"] ||
    actionMap["lead"] ||
    actionMap["offsite_conversion.fb_pixel_purchase"] ||
    sum("clicks");

  return {
    spend: spend.toFixed(2),
    impressions: Math.round(sum("impressions")),
    reach: Math.round(sum("reach")),
    clicks: Math.round(sum("clicks")),
    ctr: days.length ? (sum("ctr") / days.length).toFixed(2) : "0",
    cpc: spend > 0 && sum("clicks") > 0 ? (spend / sum("clicks")).toFixed(2) : null,
    cpm: spend > 0 ? ((spend / sum("impressions")) * 1000).toFixed(2) : null,
    results: Math.round(results),
    cpr: results > 0 ? (spend / results).toFixed(2) : null,
    roas: last?.purchase_roas?.[0]?.value ? parseFloat(last.purchase_roas[0].value).toFixed(2) : null,
    messages: Math.round(actionMap["onsite_conversion.messaging_conversation_started_7d"] || 0),
    purchases: Math.round(actionMap["omni_purchase"] || actionMap["offsite_conversion.fb_pixel_purchase"] || 0),
    dateRange: days.length ? `${days[0].date_start} → ${days[days.length - 1].date_stop}` : "",
    dailyData: days.map((d) => ({
      date: d.date_start,
      spend: parseFloat(d.spend || 0),
      clicks: parseInt(d.clicks || 0),
      impressions: parseInt(d.impressions || 0),
      results: parseInt(extractAction(d.actions, "omni_purchase") || extractAction(d.actions, "onsite_conversion.messaging_conversation_started_7d") || d.clicks || 0),
    })),
  };
}
