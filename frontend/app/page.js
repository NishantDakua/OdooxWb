'use client';

import { useEffect, useState } from 'react';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/health';

export default function HomePage() {
  const [health, setHealth] = useState('Checking backend...');

  useEffect(() => {
    let active = true;

    async function loadHealth() {
      try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (active) {
          setHealth(data.status === 'ok' ? 'Backend connected' : 'Backend responded');
        }
      } catch {
        if (active) {
          setHealth('Backend not reachable');
        }
      }
    }

    loadHealth();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="shell">
      <section className="hero">
        <div className="badge">Next.js + Express</div>
        <h1>Frontend and backend, scaffolded cleanly.</h1>
        <p className="lede">
          This frontend is ready to talk to the Node.js API running on port 5000.
        </p>

        <div className="statusCard">
          <span className="statusLabel">API status</span>
          <strong>{health}</strong>
          <code>{apiUrl}</code>
        </div>
      </section>

      <section className="grid">
        <article className="card">
          <span>Frontend</span>
          <h2>Next.js App Router</h2>
          <p>Structured with a custom layout, global styles, and a client-side health check.</p>
        </article>
        <article className="card">
          <span>Backend</span>
          <h2>Express API</h2>
          <p>A minimal API with CORS and a `/api/health` endpoint for quick verification.</p>
        </article>
      </section>
    </main>
  );
}