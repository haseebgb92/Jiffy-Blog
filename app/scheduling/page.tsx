"use client";
import React, { useMemo, useState } from "react";

type DayKey = "SUN"|"MON"|"TUE"|"WED"|"THU"|"FRI"|"SAT";

function toTomorrowISO() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export default function SchedulingPage() {
  const [frequency, setFrequency] = useState<number>(1);
  const [days, setDays] = useState<DayKey[]>(["TUE"]);
  const [time, setTime] = useState("12:00");
  const [startDate, setStartDate] = useState(toTomorrowISO());
  const [blogTitle, setBlogTitle] = useState("News");
  const [count, setCount] = useState(8);
  const [preview, setPreview] = useState<string[]>([]);

  const dayOptions: { key: DayKey; label: string }[] = useMemo(
    () => [
      { key: "SUN", label: "Sun" },
      { key: "MON", label: "Mon" },
      { key: "TUE", label: "Tue" },
      { key: "WED", label: "Wed" },
      { key: "THU", label: "Thu" },
      { key: "FRI", label: "Fri" },
      { key: "SAT", label: "Sat" },
    ],
    []
  );

  function toggleDay(d: DayKey) {
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  }

  async function buildPreview(e: React.FormEvent) {
    e.preventDefault();
    if (days.length !== frequency) {
      alert(`Please select ${frequency} day(s) per week.`);
      return;
    }
    const res = await fetch("/api/scheduling/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ daysOfWeek: days, timeOfDay: time, startDate, count }),
    });
    const json = await res.json();
    setPreview(json.slots || []);
  }

  async function createScheduled() {
    const res = await fetch("/api/scheduling/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ daysOfWeek: days, timeOfDay: time, startDate, blogTitle, count }),
    });
    const json = await res.json();
    alert(`Scheduled ${json.scheduled || 0} posts`);
  }

  return (
    <div>
      <h1>Scheduling</h1>
      <form onSubmit={buildPreview}>
        <label>Frequency per week</label>
        <div>
          <label><input type="radio" name="freq" checked={frequency===1} onChange={() => setFrequency(1)} /> 1</label>
          <label style={{ marginLeft: 12 }}><input type="radio" name="freq" checked={frequency===2} onChange={() => setFrequency(2)} /> 2</label>
          <label style={{ marginLeft: 12 }}><input type="radio" name="freq" checked={frequency===3} onChange={() => setFrequency(3)} /> 3</label>
        </div>

        <label>Days of week</label>
        <div>
          {dayOptions.map(d => (
            <label key={d.key} style={{ marginRight: 8 }}>
              <input type="checkbox" checked={days.includes(d.key)} onChange={() => toggleDay(d.key)} /> {d.label}
            </label>
          ))}
        </div>

        <label>Time of day</label>
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />

        <label>Start date</label>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />

        <label>Target blog title</label>
        <input value={blogTitle} onChange={(e) => setBlogTitle(e.target.value)} />

        <label>Count</label>
        <input type="number" value={count} onChange={(e) => setCount(parseInt(e.target.value, 10) || 0)} />

        <div style={{ marginTop: 8 }}>
          <button type="submit">Preview</button>
        </div>
      </form>

      {preview.length > 0 && (
        <div className="card">
          <h3>Next slots</h3>
          <ul>
            {preview.map((s, i) => <li key={i}>{new Date(s).toLocaleString()}</li>)}
          </ul>
          <button onClick={createScheduled}>Create scheduled posts</button>
        </div>
      )}
    </div>
  );
}


