"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSessionKey } from "@/hooks/useSessionKey";

export default function SettingsPage() {
  const { sessionCreatedAt, disconnect } = useAuth();
  const { getSessionKey, isPresent } = useSessionKey();
  const [defaultPrivacy, setDefaultPrivacy] = useState<
    "anonymous" | "verifiable"
  >(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("pp_default_privacy");
      return saved === "verifiable" ? "verifiable" : "anonymous";
    }
    return "anonymous";
  });

  const handlePrivacyChange = (mode: "anonymous" | "verifiable") => {
    setDefaultPrivacy(mode);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("pp_default_privacy", mode);
      } catch {
        // Ignore localStorage errors
      }
    }
  };

  const sessionKey = getSessionKey();
  const maskedKey = sessionKey
    ? `${sessionKey.slice(0, 8)}${"*".repeat(24)}`
    : "Not available";

  return (
    <div className="space-y-6 max-w-2xl" suppressHydrationWarning>
      <h1 className="text-2xl font-bold text-white">Settings</h1>

      {/* Session Key Status */}
      <section className="bg-zinc-800 border border-zinc-700 rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Session Status</h2>

        <div>
          <p className="text-zinc-400 text-sm mb-1">Status</p>
          <p className="text-white">
            {isPresent() ? (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-900/30 text-green-400">
                Active
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-900/30 text-red-400">
                Expired
              </span>
            )}
          </p>
        </div>

        {sessionCreatedAt && (
          <div>
            <p className="text-zinc-400 text-sm mb-1">Created</p>
            <p className="text-white text-sm">
              {new Date(sessionCreatedAt).toLocaleString()}
            </p>
          </div>
        )}

        <div>
          <p className="text-zinc-400 text-sm mb-1">Session Key</p>
          <p className="text-white text-sm font-mono">{maskedKey}</p>
        </div>

        <button
          onClick={disconnect}
          className="w-full py-2 px-4 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-colors"
          aria-label="Revoke session and disconnect"
        >
          Revoke Session
        </button>
      </section>

      {/* Default Privacy Mode */}
      <section className="bg-zinc-800 border border-zinc-700 rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">
          Default Privacy Mode
        </h2>
        <p className="text-zinc-400 text-sm">
          This will be pre-selected when creating new payment links.
        </p>

        <div
          className="grid grid-cols-2 gap-3"
          role="radiogroup"
          aria-label="Default privacy mode"
        >
          {(["anonymous", "verifiable"] as const).map((mode) => (
            <label
              key={mode}
              className={`flex flex-col gap-2 p-4 rounded-lg border cursor-pointer transition-colors ${
                defaultPrivacy === mode
                  ? "border-violet-500 bg-violet-600/10"
                  : "border-zinc-700 hover:border-zinc-500"
              }`}
            >
              <input
                type="radio"
                name="defaultPrivacy"
                value={mode}
                checked={defaultPrivacy === mode}
                onChange={() => handlePrivacyChange(mode)}
                className="sr-only"
              />
              <span className="text-white font-medium capitalize">{mode}</span>
              <span className="text-zinc-400 text-xs">
                {mode === "anonymous"
                  ? "Fully hidden identity"
                  : "Provable legitimacy"}
              </span>
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}
