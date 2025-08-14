"use client";
import React, { useEffect, useState } from "react";

type Job = {
  id: string;
  keyword: string;
  status: string;
  publishAt?: string | null;
};

export default function Page() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadJobs() {
    const res = await fetch("/api/jobs/list");
    if (res.ok) setJobs(await res.json());
  }

  useEffect(() => {
    loadJobs();
    const url = new URL(window.location.href);
    const shop = url.searchParams.get("shop");
    if (shop) {
      // If not installed yet, bounce to OAuth start.
      fetch("/api/settings/get").then(async (r) => {
        const s = await r.json();
        if (!s?.domain) {
          window.location.href = `/api/shopify/auth?shop=${encodeURIComponent(shop)}`;
        }
      }).catch(() => {});
    }
  }, []);

  async function action(path: string) {
    if (!selected) return;
    setLoading(true);
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId: selected }),
    });
    setLoading(false);
    if (res.ok) loadJobs();
  }

  return (
    <div>
      <h1>AI Blogger</h1>
      <p>Quick links: <a href="/uploads">Uploads</a> | <a href="/templates">Templates</a> | <a href="/scheduling">Scheduling</a> | <a href="/settings">Settings</a></p>

      <div className="card">
        <h2>Jobs</h2>
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Keyword</th>
              <th>Status</th>
              <th>Publish At</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.id}>
                <td><input type="radio" name="sel" onChange={() => setSelected(j.id)} /></td>
                <td>{j.keyword}</td>
                <td>{j.status}</td>
                <td>{j.publishAt ? new Date(j.publishAt).toLocaleString() : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="row-actions">
          <button disabled={!selected || loading} onClick={() => action("/api/content/draft")}>Draft</button>
          <button disabled={!selected || loading} onClick={() => action("/api/images/generate")}>Image</button>
          <button disabled={!selected || loading} onClick={() => action("/api/scheduling/schedule-one")}>Schedule</button>
        </div>
        <p className="muted">Select a job and run actions. Scheduling uses publishDate, Shopify will publish automatically.</p>
      </div>
    </div>
  );
}


