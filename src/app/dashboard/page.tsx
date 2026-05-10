"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { apiClient } from "@/lib/apiClient";
import { CreateLinkModal } from "@/components/dashboard/CreateLinkModal";
import { PaymentLinkCard } from "@/components/dashboard/PaymentLinkCard";
import { SkeletonBlock } from "@/components/ui/SkeletonBlock";
import { ErrorSection } from "@/components/ui/ErrorSection";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  TrendingUp,
  Plus,
  ExternalLink,
  DollarSign,
  Activity,
  ArrowRight,
  LinkIcon,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);

  // Payment links
  const {
    data: links,
    isLoading: linksLoading,
    error: linksError,
    refetch: refetchLinks,
  } = useQuery({
    queryKey: queryKeys.links(),
    queryFn: () => apiClient.getLinks(),
  });

  // Earnings
  const {
    data: earnings,
    isLoading: earningsLoading,
    error: earningsError,
    refetch: refetchEarnings,
  } = useQuery({
    queryKey: queryKeys.earnings(),
    queryFn: () => apiClient.getEarnings(),
  });

  // Deactivate mutation
  const deactivateMutation = useMutation({
    mutationFn: (linkId: string) => apiClient.deactivateLink(linkId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.links() });
      qc.invalidateQueries({ queryKey: queryKeys.earnings() });
    },
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your private payment links and track earnings.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="w-full md:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Create Payment Link
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total SOL</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {earningsLoading ? (
              <div className="h-8 w-24 bg-muted animate-pulse rounded" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {earnings?.totalEarningsSOL.toFixed(4)}
                </div>
                <p className="text-xs text-muted-foreground">
                  +2.1% from last month
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total USDC</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {earningsLoading ? (
              <div className="h-8 w-24 bg-muted animate-pulse rounded" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {earnings?.totalEarningsUSDC.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Settled instantly
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Links</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {linksLoading ? (
              <div className="h-8 w-24 bg-muted animate-pulse rounded" />
            ) : (
              <>
                <div className="text-2xl font-bold">{links?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Ready for payments
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Payments
            </CardTitle>
            <ExternalLink className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {earningsLoading ? (
              <div className="h-8 w-24 bg-muted animate-pulse rounded" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {earnings?.paymentCount}
                </div>
                <p className="text-xs text-muted-foreground">
                  Through private links
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Recent Links */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Active Payment Links</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/links">
                View All <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>

          {linksLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <SkeletonBlock key={i} height="160px" />
              ))}
            </div>
          ) : linksError ? (
            <ErrorSection
              message="Failed to load payment links"
              onRetry={refetchLinks}
            />
          ) : links && links.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {links.slice(0, 4).map((link) => (
                <PaymentLinkCard
                  key={link.id}
                  link={link}
                  onDeactivate={(id) => deactivateMutation.mutate(id)}
                />
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <LinkIcon className="w-10 h-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No active links</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first payment link to start receiving funds
                  privately.
                </p>
                <Button onClick={() => setModalOpen(true)}>Create Link</Button>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Sidebar: Recent Activity / Stats */}
        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest transactions from your links.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Detailed transaction history is available in the{" "}
                <Link
                  href="/dashboard/history"
                  className="text-primary hover:underline"
                >
                  History
                </Link>{" "}
                section.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>

      <CreateLinkModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
