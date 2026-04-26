"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const { connected, publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const { connect, isAuthenticated } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setError(null);
    if (!connected) {
      setVisible(true);
      return;
    }
    setLoading(true);
    try {
      await connect();
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication cancelled");
    } finally {
      setLoading(false);
    }
  };

  // If already authenticated, redirect
  if (isAuthenticated) {
    router.push("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md text-center space-y-8">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            PhantomPay
          </h1>
          <p className="text-zinc-400 text-lg">Payments without identity.</p>
          <p className="text-zinc-500 text-sm">
            Private payment infrastructure for the BAGS/Solana creator economy.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleConnect}
            disabled={loading}
            aria-label="Connect wallet to authenticate"
            className="w-full py-3 px-6 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors"
          >
            {loading
              ? "Authenticating…"
              : connected
                ? "Sign in with Wallet"
                : "Connect Wallet"}
          </button>

          {connected && publicKey && (
            <p className="text-zinc-500 text-xs">
              Wallet detected. Click above to sign in.
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="text-red-400 text-sm bg-red-950/40 border border-red-800 rounded-lg px-4 py-2"
            >
              {error}
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-800">
          {["Anonymous payments", "Session keys", "No identity exposed"].map(
            (f) => (
              <div key={f} className="text-zinc-500 text-xs">
                {f}
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
