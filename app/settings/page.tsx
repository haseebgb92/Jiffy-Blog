"use client";
import React, { useEffect, useState } from "react";

export default function SettingsPage() {
  const [domain, setDomain] = useState<string>("");
  const [provider, setProvider] = useState<string>("GEMINI");

  async function load() {
    const res = await fetch("/api/settings/get");
    if (res.ok) {
      const json = await res.json();
      setDomain(json.domain || "");
      setProvider(json.provider || "GEMINI");
    }
  }
  useEffect(() => { load(); }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/settings/set", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider }),
    });
    load();
  }

  return (
    <div>
      <h1>Settings</h1>
      <p>Shop domain: <strong>{domain || "Not installed yet"}</strong></p>
      <form onSubmit={save}>
        <label>Active provider</label>
        <select value={provider} onChange={(e) => setProvider(e.target.value)}>
          <option value="GEMINI">Gemini</option>
          <option value="OPENAI">OpenAI</option>
        </select>
        <div style={{ marginTop: 8 }}>
          <button type="submit">Save</button>
        </div>
      </form>
    </div>
  );
}


