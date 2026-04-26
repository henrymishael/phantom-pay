/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { apiClient } from "@/lib/apiClient";
import { SkeletonBlock } from "@/components/ui/SkeletonBlock";
import { ErrorSection } from "@/components/ui/ErrorSection";
import { PrivacyModeBadge } from "@/components/ui/PrivacyModeBadge";

export default function HistoryPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.history(page),
    queryFn: () => apiClient.getHistory(page),
  });

  const records =
    data?.records || (Array.isArray(data) ? data : (data as any)?.data || []);
  const total = data?.total || records.length || 0;
  const totalPages = Math.max(0, Math.ceil(total / 25));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Transaction History</h1>

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
        <>
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-zinc-900">
                <tr>
                  <th className="text-left text-zinc-400 text-xs font-medium px-4 py-2">
                    Date
                  </th>
                  <th className="text-left text-zinc-400 text-xs font-medium px-4 py-2">
                    Direction
                  </th>
                  <th className="text-right text-zinc-400 text-xs font-medium px-4 py-2">
                    Amount
                  </th>
                  <th className="text-left text-zinc-400 text-xs font-medium px-4 py-2">
                    Privacy
                  </th>
                </tr>
              </thead>
              <tbody>
                {records.map((record: any) => (
                  <tr key={record.id} className="border-t border-zinc-700">
                    <td className="px-4 py-3 text-white text-sm">
                      {new Date(record.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "UTC",
                        timeZoneName: "short",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-900/30 text-green-400">
                        {record.direction}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-white text-sm font-medium">
                      {record.amount} {record.token}
                    </td>
                    <td className="px-4 py-3">
                      <PrivacyModeBadge mode={record.privacyMode} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-sm text-white bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded border border-zinc-700 transition-colors"
                aria-label="Previous page"
              >
                Previous
              </button>
              <span className="text-zinc-400 text-sm">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 text-sm text-white bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded border border-zinc-700 transition-colors"
                aria-label="Next page"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="text-zinc-500 text-sm">No transactions yet</p>
      )}
    </div>
  );
}
