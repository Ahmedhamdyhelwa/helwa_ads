// pages/api/accounts.js
import { getAccounts, saveAccounts } from "../../lib/accounts";

export default function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json(getAccounts());
  }

  if (req.method === "POST") {
    const { password, account } = req.body;
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const accounts = getAccounts();
    // Prevent duplicates
    if (accounts.find((a) => a.id === account.id)) {
      return res.status(400).json({ error: "Account already exists" });
    }
    accounts.push({ ...account, active: true });
    saveAccounts(accounts);
    return res.status(200).json({ ok: true, accounts });
  }

  if (req.method === "DELETE") {
    const { password, id } = req.body;
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const accounts = getAccounts().filter((a) => a.id !== id);
    saveAccounts(accounts);
    return res.status(200).json({ ok: true });
  }

  if (req.method === "PATCH") {
    // Update account meta (name, label, color, currency)
    const { password, id, updates } = req.body;
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const accounts = getAccounts().map((a) => (a.id === id ? { ...a, ...updates } : a));
    saveAccounts(accounts);
    return res.status(200).json({ ok: true });
  }

  res.status(405).end();
}
