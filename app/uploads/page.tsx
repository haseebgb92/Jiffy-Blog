"use client";
import React, { useState } from "react";

export default function UploadsPage() {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setLoading(true);
    const res = await fetch("/api/keywords/upload", { method: "POST", body: fd });
    setLoading(false);
    const json = await res.json();
    setCount(json.count || 0);
  }

  return (
    <div>
      <h1>Upload Keywords CSV</h1>
      <form onSubmit={onSubmit} encType="multipart/form-data">
        <label>CSV file</label>
        <input type="file" name="file" accept=".csv" required />
        <div style={{ marginTop: 8 }}>
          <button type="submit" disabled={loading}>{loading ? "Uploading..." : "Upload"}</button>
        </div>
      </form>
      {count !== null && <p>Created {count} jobs.</p>}
    </div>
  );
}


