"use client";

import { useState } from "react";

export default function HspStatusPage() {
  const [cartId, setCartId] = useState("");
  const [flowId, setFlowId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lookup = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const q = new URLSearchParams();
      if (cartId.trim()) q.set("cart_mandate_id", cartId.trim());
      else if (flowId.trim()) q.set("flow_id", flowId.trim());
      else {
        setError("Enter a cart mandate id or flow id.");
        setLoading(false);
        return;
      }
      const res = await fetch(`/api/hsp/status?${q.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setResult(JSON.stringify(data, null, 2));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[720px] mx-auto space-y-6">
      <div>
        <h1 className="text-[20px] font-semibold text-text-primary">HSP payment status</h1>
        <p className="text-[13px] text-text-tertiary mt-1 leading-relaxed">
          Query the HashKey Merchant Gateway (QA/staging/prod via{" "}
          <code className="text-accent-teal">HSP_API_BASE</code>) using your server credentials.
          Register at{" "}
          <a
            href="mailto:hsp_hackathon@hashkey.com"
            className="text-accent-teal hover:underline"
          >
            hsp_hackathon@hashkey.com
          </a>{" "}
          for <code className="text-text-secondary">app_key</code> /{" "}
          <code className="text-text-secondary">app_secret</code>.
        </p>
      </div>

      <div className="bg-bg-surface border border-border rounded-lg p-5 space-y-4">
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-tertiary mb-1">
            cart_mandate_id
          </label>
          <input
            className="w-full bg-bg-elevated border border-border rounded px-3 py-2 text-[13px] font-mono text-text-primary placeholder:text-text-tertiary"
            placeholder="e.g. INV-2026-0028"
            value={cartId}
            onChange={(e) => {
              setCartId(e.target.value);
              if (e.target.value) setFlowId("");
            }}
          />
        </div>
        <p className="text-[11px] text-text-tertiary text-center">or</p>
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-tertiary mb-1">
            flow_id
          </label>
          <input
            className="w-full bg-bg-elevated border border-border rounded px-3 py-2 text-[13px] font-mono text-text-primary placeholder:text-text-tertiary"
            placeholder="From checkout URL …/flow/…"
            value={flowId}
            onChange={(e) => {
              setFlowId(e.target.value);
              if (e.target.value) setCartId("");
            }}
          />
        </div>
        <button
          type="button"
          onClick={lookup}
          disabled={loading}
          className="w-full py-2.5 rounded-md bg-gradient-to-br from-accent-teal to-[#22B896] text-bg-primary text-[13px] font-bold disabled:opacity-50"
        >
          {loading ? "Querying…" : "Lookup"}
        </button>
      </div>

      {error && (
        <div className="bg-accent-orange-bg border border-accent-orange/20 rounded-md px-4 py-3 text-[13px] text-accent-orange">
          {error}
        </div>
      )}

      {result && (
        <pre className="bg-bg-surface border border-border rounded-lg p-4 text-[11px] font-mono text-text-secondary overflow-x-auto whitespace-pre-wrap">
          {result}
        </pre>
      )}
    </div>
  );
}
