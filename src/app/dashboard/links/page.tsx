"use client";

import { Suspense, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { apiClient } from "@/lib/apiClient";
import { SkeletonBlock } from "@/components/ui/SkeletonBlock";
import { ErrorSection } from "@/components/ui/ErrorSection";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { LayoutGrid, List, Search, Copy, Eye, Trash2 } from "lucide-react";
import { PaymentLinkCard } from "@/components/dashboard/PaymentLinkCard";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/contexts/ToastContext";
import Link from "next/link";
import { useQueryState, parseAsString } from "nuqs";
import { useDebounce } from "use-debounce";

function LinksPageContent() {
  const qc = useQueryClient();
  const { addToast } = useToast();

  const [view, setView] = useQueryState(
    "view",
    parseAsString.withDefault("list"),
  );
  const [search, setSearch] = useQueryState("q", parseAsString.withDefault(""));
  const [debouncedSearch] = useDebounce(search, 300);

  const {
    data: links,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.links(),
    queryFn: () => apiClient.getLinks(),
  });

  const deactivateMutation = useMutation({
    mutationFn: (linkId: string) => apiClient.deactivateLink(linkId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.links() });
      addToast("Link deactivated successfully", "success");
    },
    onError: (err) => {
      addToast(
        err instanceof Error ? err.message : "Failed to deactivate link",
        "error",
      );
    },
  });

  const filteredLinks = useMemo(() => {
    if (!links) return [];
    return links.filter(
      (link) =>
        link.description
          ?.toLowerCase()
          .includes(debouncedSearch.toLowerCase()) ||
        link.token.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        link.id.toLowerCase().includes(debouncedSearch.toLowerCase()),
    );
  }, [links, debouncedSearch]);

  const handleCopy = (id: string) => {
    const url = `${window.location.origin}/pay/${id}`;
    navigator.clipboard.writeText(url);
    addToast("Link copied to clipboard", "success");
  };

  if (error)
    return <ErrorSection message="Failed to load links" onRetry={refetch} />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Links</h1>
          <p className="text-muted-foreground">
            Manage and track your private payment requests.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
          <Button
            variant={view === "grid" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setView("grid")}
            className="px-3"
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            variant={view === "list" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setView("list")}
            className="px-3"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by description or token..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline">Filters</Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonBlock key={i} height="160px" />
          ))}
        </div>
      ) : filteredLinks.length > 0 ? (
        view === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLinks.map((link) => (
              <PaymentLinkCard
                key={link.id}
                link={link}
                onDeactivate={(id) => deactivateMutation.mutate(id)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Link Details</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Token</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLinks.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium truncate max-w-[200px]">
                          {link.description || "No description"}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          {link.id.slice(0, 8)}...
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{link.amount}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{link.token}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs capitalize">
                        {link.usageType?.replace("-", " ") || "unknown"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          link.status === "active" ? "default" : "secondary"
                        }
                      >
                        {link.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/dashboard/links/${link.id}`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopy(link.id)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => deactivateMutation.mutate(link.id)}
                          disabled={link.status !== "active"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-xl">
          <Search className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium">No links found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filters.
          </p>
        </div>
      )}
    </div>
  );
}

export default function LinksPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-10 w-48 bg-muted animate-pulse rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      }
    >
      <LinksPageContent />
    </Suspense>
  );
}
