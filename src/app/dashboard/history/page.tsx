"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { apiClient, HistoryRecord } from "@/lib/apiClient";
import { SkeletonBlock } from "@/components/ui/SkeletonBlock";
import { ErrorSection } from "@/components/ui/ErrorSection";
import { PrivacyModeBadge } from "@/components/ui/PrivacyModeBadge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ChevronLeft, ChevronRight, History } from "lucide-react";

export default function HistoryPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.history(page),
    queryFn: () => apiClient.getHistory(page),
  });

  const records = data?.records || [];
  const total = data?.total || records.length || 0;
  const totalPages = Math.max(0, Math.ceil(total / 25));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transaction History</h1>
        <p className="text-muted-foreground">View and manage your past payment activity.</p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonBlock key={i} height="60px" />
          ))}
        </div>
      ) : error ? (
        <ErrorSection
          message="Failed to load transaction history"
          onRetry={refetch}
        />
      ) : records.length > 0 ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Direction</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Privacy</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record: HistoryRecord) => (
                  <TableRow key={record.id}>
                    <TableCell className="text-sm">
                      {new Date(record.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {record.direction}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {record.amount} {record.token}
                    </TableCell>
                    <TableCell>
                      <PrivacyModeBadge mode={record.privacyMode} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-xl">
          <History className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium">No transactions yet</h3>
          <p className="text-muted-foreground">When you send or receive payments, they will appear here.</p>
        </div>
      )}
    </div>
  );
}
