"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Shield, Zap, Lock, Globe, ArrowRight } from "lucide-react";

export default function LandingPage() {
  const { connected } = useWallet();
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication cancelled");
    } finally {
      setLoading(false);
    }
  };

  // Handle redirect in useEffect to avoid state updates during render
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30 selection:text-primary-foreground">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[25%] -left-[10%] w-[70%] h-[70%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[20%] -right-[5%] w-[60%] h-[60%] bg-primary/10 blur-[100px] rounded-full" />
      </div>

      <nav className="relative z-10 border-b border-border bg-background/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Lock className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-tight">PhantomPay</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="hidden sm:flex">Documentation</Button>
            <Button size="sm" onClick={handleConnect} disabled={loading}>
              {connected ? "Enter App" : "Launch App"}
            </Button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium animate-in fade-in slide-in-from-bottom-3 duration-1000">
                <Globe className="w-3 h-3" />
                <span>Now live on Solana Mainnet</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150">
                Payments without <span className="text-primary">Identity.</span>
              </h1>
              <p className="text-xl text-muted-foreground animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-300">
                The most secure way to handle payments for the creator economy. 
                Full privacy, zero metadata, instant settlement.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-500">
              <Button size="lg" className="w-full sm:w-auto px-8 py-6 text-lg" onClick={handleConnect} disabled={loading}>
                {loading ? "Authenticating..." : connected ? "Sign in with Wallet" : "Get Started Now"}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-6 text-lg">
                View Demo
              </Button>
            </div>

            {error && (
              <p className="text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-2 animate-in fade-in zoom-in duration-300">
                {error}
              </p>
            )}
          </div>

          <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-700">
            <Card className="bg-background/40 backdrop-blur-sm border-border hover:border-primary/30 transition-colors group">
              <CardContent className="p-8 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Privacy First</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Your identity is never exposed. We use advanced session keys and anonymous proofing to keep your transactions private.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background/40 backdrop-blur-sm border-border hover:border-primary/30 transition-colors group">
              <CardContent className="p-8 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Instant Settlement</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Leveraging the speed of Solana for sub-second confirmations. No waiting periods, no middlemen, just direct peer-to-peer value.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background/40 backdrop-blur-sm border-border hover:border-primary/30 transition-colors group">
              <CardContent className="p-8 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Lock className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Secure Infrastructure</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Military-grade encryption and audited session management ensure your funds and data remain under your control at all times.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="border-t border-border bg-background relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            <span className="font-bold">PhantomPay</span>
          </div>
          <p className="text-muted-foreground text-sm">
            © 2024 PhantomPay. Built for the BAGS Creator Economy.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Twitter</a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Github</a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Discord</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
