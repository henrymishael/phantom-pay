'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../../src/lib/queryKeys'
import { apiClient } from '../../src/lib/apiClient'
import { CreateLinkModal } from '../../src/components/dashboard/CreateLinkModal'
import { PaymentLinkCard } from '../../src/components/dashboard/PaymentLinkCard'
import { SkeletonBlock } from '../../src/components/ui/SkeletonBlock'
import { ErrorSection } from '../../src/components/ui/ErrorSection'

export default function DashboardPage() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)

  // Payment links
  const { data: links, isLoading: linksLoading, error: linksError, refetch: refetchLinks } = useQuery({
    queryKey: queryKeys.links(),
    queryFn: () => apiClient.getLinks(),
  })

  // Earnings
  const { data: earnings, isLoading: earningsLoading, error: earningsError, refetch: refetchEarnings } = useQuery({
    queryKey: queryKeys.earnings(),
    queryFn: () => apiClient.getEarnings(),
  })

  // Portfolio
  const { data: portfolio, isLoading: portfolioLoading, error: portfolioError, refetch: refetchPortfolio } = useQuery({
    queryKey: queryKeys.portfolio(),
    queryFn: () => apiClient.getPortfolio(),
  })

  // Deactivate mutation
  const deactivateMutation = useMutation({
    mutationFn: (linkId: string) => apiClient.deactivateLink(linkId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.links() })
      qc.invalidateQueries({ queryKey: queryKeys.earnings() })
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-lg transition-colors"
          aria-label="Create new payment link"
        >
          Create Payment Link
        </button>
      </div>

      {/* Earnings Summary */}
      <section aria-labelledby="earnings-heading">
        <h2 id="earnings-heading" className="text-lg font-semibold text-white mb-3">Earnings</h2>
        {earningsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <SkeletonBlock key={i} height="80px" />)}
          </div>
        ) : earningsError ? (
          <ErrorSection message="Failed to load earnings" onRetry={refetchEarnings} />
        ) : earnings ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
              <p className="text-zinc-400 text-sm">Total SOL</p>
              <p className="text-white text-2xl font-bold">{earnings.totalEarningsSOL.toFixed(4)}</p>
            </div>
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
              <p className="text-zinc-400 text-sm">Total USDC</p>
              <p className="text-white text-2xl font-bold">{earnings.totalEarningsUSDC.toFixed(2)}</p>
            </div>
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
              <p className="text-zinc-400 text-sm">Payments</p>
              <p className="text-white text-2xl font-bold">{earnings.paymentCount}</p>
            </div>
          </div>
        ) : null}
      </section>

      {/* Payment Links */}
      <section aria-labelledby="links-heading">
        <h2 id="links-heading" className="text-lg font-semibold text-white mb-3">Active Payment Links</h2>
        {linksLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map(i => <SkeletonBlock key={i} height="160px" />)}
          </div>
        ) : linksError ? (
          <ErrorSection message="Failed to load payment links" onRetry={refetchLinks} />
        ) : links && links.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {links.map(link => (
              <PaymentLinkCard
                key={link.id}
                link={link}
                onDeactivate={id => deactivateMutation.mutate(id)}
              />
            ))}
          </div>
        ) : (
          <p className="text-zinc-500 text-sm">No active payment links. Create one to get started.</p>
        )}
      </section>

      {/* Portfolio */}
      <section aria-labelledby="portfolio-heading">
        <h2 id="portfolio-heading" className="text-lg font-semibold text-white mb-3">Portfolio</h2>
        {portfolioLoading ? (
          <SkeletonBlock height="120px" />
        ) : portfolioError ? (
          <ErrorSection message="Failed to load portfolio" onRetry={refetchPortfolio} />
        ) : portfolio && portfolio.length > 0 ? (
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-zinc-900">
                <tr>
                  <th className="text-left text-zinc-400 text-xs font-medium px-4 py-2">Token</th>
                  <th className="text-right text-zinc-400 text-xs font-medium px-4 py-2">Quantity</th>
                  <th className="text-right text-zinc-400 text-xs font-medium px-4 py-2">Value</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.map((holding, i) => (
                  <tr key={i} className="border-t border-zinc-700">
                    <td className="px-4 py-3">
                      <p className="text-white text-sm font-medium">{holding.tokenName}</p>
                      <p className="text-zinc-500 text-xs">{holding.tokenSymbol}</p>
                    </td>
                    <td className="text-right text-white text-sm px-4 py-3">{holding.quantity.toFixed(2)}</td>
                    <td className="text-right text-white text-sm px-4 py-3">${holding.estimatedValue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-zinc-500 text-sm">No holdings yet</p>
        )}
      </section>

      <CreateLinkModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
