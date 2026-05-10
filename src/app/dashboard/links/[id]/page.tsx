"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { queryKeys } from "@/lib/queryKeys";
import { apiClient } from "@/lib/apiClient";
import { SkeletonBlock } from "@/components/ui/SkeletonBlock";
import { ErrorSection } from "@/components/ui/ErrorSection";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  Trash2,
  Calendar,
  Shield,
  Repeat,
  Wallet,
  Clock,
  Globe,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/contexts/ToastContext";

export default function LinkDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const qc = useQueryClient();
  const { addToast } = useToast();

  const {
    data: link,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["link", id],
    queryFn: () => apiClient.getPublicLink(id as string),
  });

  const deactivateMutation = useMutation({
    mutationFn: () => apiClient.deactivateLink(id as string),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.links() });
      qc.invalidateQueries({ queryKey: ["link", id] });
      addToast("Link deactivated successfully", "success");
    },
    onError: (err) => {
      addToast(
        err instanceof Error ? err.message : "Failed to deactivate link",
        "error",
      );
    },
  });

  const handleCopy = () => {
    const url = `${window.location.origin}/pay/${id}`;
    navigator.clipboard.writeText(url);
    addToast("Link copied to clipboard", "success");
  };

  if (isLoading) return <SkeletonBlock height="400px" />;
  if (error || !link)
    return <ErrorSection message="Link not found" onRetry={refetch} />;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Link Details</h1>
          <p className="text-sm text-muted-foreground font-mono">{link.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl">
                  {link.description || "No description"}
                </CardTitle>
                <CardDescription>
                  Created on {new Date(link.createdAt).toLocaleDateString()}
                </CardDescription>
              </div>
              <Badge
                variant={link.status === "active" ? "default" : "secondary"}
              >
                {link.status}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase">
                    Amount
                  </span>
                  <div className="text-xl font-bold">
                    {link.amount} {link.token}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase">
                    Usage
                  </span>
                  <div className="flex items-center gap-2">
                    <Repeat className="w-4 h-4 text-primary" />
                    <span className="capitalize">
                      {link.usageType?.replace("-", " ") || "unknown"}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase">
                    Privacy
                  </span>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    <span className="capitalize">{link.privacyMode}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase">
                    Network
                  </span>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary" />
                    <span>Solana</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Expires at:{" "}
                    {link.expiresAt
                      ? new Date(link.expiresAt).toLocaleString()
                      : "Never"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Link Analytics</CardTitle>
              <CardDescription>
                Performance tracking for this payment link.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-40 flex items-center justify-center border-2 border-dashed border-border rounded-lg">
              <div className="text-center space-y-2">
                <Activity className="w-8 h-8 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Detailed analytics coming soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" onClick={handleCopy}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Payment URL
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <a
                  href={`/pay/${link.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Payment Page
                </a>
              </Button>
              <Button
                variant="destructive"
                className="w-full justify-start"
                onClick={() => deactivateMutation.mutate()}
                disabled={link.status !== "active"}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Deactivate Link
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Status Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Visibility</span>
                <span className="font-medium">Public</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Indexable</span>
                <span className="font-medium text-destructive">No</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Encryption</span>
                <span className="font-medium text-green-500">AES-256</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
