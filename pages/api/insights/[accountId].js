// pages/api/insights/[accountId].js
import { getAccountInsights, getCampaigns, aggregateInsights } from "../../../lib/facebook";
import { getAccount } from "../../../lib/accounts";

export default async function handler(req, res) {
  const { accountId, preset = "last_7d" } = req.query;

  const account = getAccount(accountId);
  if (!account) return res.status(404).json({ error: "Account not found" });

  try {
    const [rawInsights, campaigns] = await Promise.all([
      getAccountInsights(accountId, preset),
      getCampaigns(accountId),
    ]);

    const summary = aggregateInsights(rawInsights);

    // Process campaigns
    const processedCampaigns = campaigns.map((c) => {
      const ins = c.insights?.data?.[0] || {};
      return {
        id: c.id,
        name: c.name,
        status: c.status,
        objective: c.objective,
        spend: parseFloat(ins.spend || 0).toFixed(2),
        impressions: parseInt(ins.impressions || 0),
        clicks: parseInt(ins.clicks || 0),
        ctr: parseFloat(ins.ctr || 0).toFixed(2),
        results: ins.actions?.reduce((t, a) => t + parseFloat(a.value || 0), 0) || 0,
      };
    });

    res.setHeader("Cache-Control", `s-maxage=${process.env.REVALIDATE_SECONDS || 3600}, stale-while-revalidate`);
    return res.status(200).json({
      account,
      summary,
      campaigns: processedCampaigns,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
