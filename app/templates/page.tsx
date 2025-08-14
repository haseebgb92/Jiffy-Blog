"use client";
import React, { useEffect, useState } from "react";

type Template = { id: string; name: string; templateSuffix: string; style: string };

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch("/api/templates/list");
    if (res.ok) setTemplates(await res.json());
  }
  useEffect(() => { load(); }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    const res = await fetch("/api/templates/create", { method: "POST", body: fd });
    setLoading(false);
    if (res.ok) load();
  }

  return (
    <div>
      <h1>Templates</h1>
      <form onSubmit={onSubmit}>
        <label>Name</label>
        <input name="name" required />
        <label>Template Suffix</label>
        <input name="templateSuffix" placeholder="article.custom" />
        <label>Style</label>
        <textarea name="style" placeholder="Tone, voice, target audience"></textarea>
        <div style={{ marginTop: 8 }}>
          <button type="submit" disabled={loading}>{loading ? "Saving..." : "Create"}</button>
        </div>
      </form>
      <table>
        <thead><tr><th>Name</th><th>Suffix</th><th>Style</th></tr></thead>
        <tbody>
          {templates.map(t => (
            <tr key={t.id}><td>{t.name}</td><td>{t.templateSuffix}</td><td>{t.style}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


