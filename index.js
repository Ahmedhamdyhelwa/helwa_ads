// lib/accounts.js
// Simple file-based store for account registry.
// On Vercel, writes go to /tmp. For persistent storage use Vercel KV or a DB.

import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";

const FILE = path.join(process.env.ACCOUNTS_FILE || "/tmp", "accounts.json");

const DEFAULTS = [
  { id: "1122194555998894", name: "helwa", label: "سُندس زى شرعى", currency: "EGP", color: "#7C3AED", active: true },
  { id: "384151190910004",  name: "LAMSA",    label: "لمسة",              currency: "EGP", color: "#0EA5E9", active: true },
  { id: "843382442117776",  name: "new cus",  label: "سُندس زى اسلامى",   currency: "EGP", color: "#10B981", active: true },
  { id: "963562232919645",  name: "Grow.AI",  label: "YTsautomation",     currency: "EGP", color: "#F59E0B", active: true },
  { id: "1494373838527835", name: "New ebn ezz", label: "ebn ezz",        currency: "EGP", color: "#EF4444", active: true },
  { id: "525067195260662",  name: "حساب EGP", label: "بدون اسم",         currency: "EGP", color: "#6B7280", active: true },
  { id: "907086809756696",  name: "حساب USD", label: "بدون اسم",         currency: "USD", color: "#8B5CF6", active: true },
];

export function getAccounts() {
  try {
    if (existsSync(FILE)) {
      return JSON.parse(readFileSync(FILE, "utf8"));
    }
  } catch {}
  return DEFAULTS;
}

export function saveAccounts(accounts) {
  try {
    writeFileSync(FILE, JSON.stringify(accounts, null, 2));
  } catch (e) {
    console.error("Could not save accounts:", e.message);
  }
}

export function getAccount(id) {
  return getAccounts().find((a) => a.id === id) || null;
}
