"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { queryKeys } from "@/lib/queryKeys";
import { apiClient } from "@/lib/apiClient";
import { SkeletonBlock } from "@/components/ui/SkeletonBlock";
import { ProofBadge } from "@/components/ui/ProofBadge";
import { PrivacyModeBadge } from "@/components/ui/PrivacyModeBadge";
import bs58 from "bs58";

export default function PaymentPage() {
  const params = useParams();
  const linkId = params.linkId as string;
  const { publicKey, signMessage, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const [proofSignature, setProofSignature] = useState<string | null>(null);

  // Fetch payment link details (unauthenticated)
  const {
    data: link,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.publicLink(linkId),
    queryFn: () => apiClient.getPublicLink(linkId),
    retry: 1,
  });
  

  // Payment submission mutation
  const paymentMutation = useMutation({
    mutationFn: (body: { senderProof?: string; payerWallet?: string }) =>
      apiClient.submitPayment(linkId, body),
  });

  const generateProof = async (): Promise<string | null> => {
    if (!publicKey || !signMessage) {
      setVisible(true);
      return null;
    }

    try {
      const message = `PhantomPay proof for payment link ${linkId}\nWallet: ${publicKey.toString()}\nTimestamp: ${Date.now()}`;
      const messageBytes = new TextEncoder().encode(message);
      const signature = await signMessage(messageBytes);
      const proof = bs58.encode(signature);
      setProofSignature(proof);
      return proof;
    } catch (error) {
      console.error("Failed to generate proof:", error);
      return null;
    }
  };

  const handleGenerateProof = async () => {
    await generateProof();
  };

  const handleSubmitPayment = async () => {
    if (!link) return;

    let currentProof = proofSignature;

    // Generate proof if wallet is connected and no proof yet exists
    if (!currentProof && publicKey && signMessage) {
      currentProof = await generateProof();
      // Don't abort on failure — proof is optional, continue without it
    } else if (!currentProof && !publicKey) {
      // No wallet connected — prompt only for verifiable links
      if (link.privacyMode === "verifiable") {
        setVisible(true);
        return;
      }
    }

    paymentMutation.mutate({
      senderProof: currentProof || undefined,
      payerWallet: publicKey?.toString() || undefined,
    });
  };


  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
        <div className="w-full max-w-md space-y-4">
          <SkeletonBlock height="200px" />
          <SkeletonBlock height="100px" />
        </div>
      </div>
    );
  }

  // Error states
  if (error || !link) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center space-y-4">
          <h1 className="text-2xl font-bold text-white">
            Payment link not found
          </h1>
          <p className="text-zinc-400">
            This payment link does not exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  // Expired state
  if (link.status === "expired") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center space-y-4">
          <h1 className="text-2xl font-bold text-white">Link expired</h1>
          <p className="text-zinc-400">This payment link has expired</p>
          {link.expiresAt && (
            <p className="text-zinc-500 text-sm">
              Expired on {new Date(link.expiresAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Fulfilled state
  if (link.status === "fulfilled") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center space-y-4">
          <h1 className="text-2xl font-bold text-white">Already completed</h1>
          <p className="text-zinc-400">
            This payment has already been completed
          </p>
        </div>
      </div>
    );
  }

  // Success state
  if (paymentMutation.isSuccess && paymentMutation.data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-green-600/20 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Payment successful!</h1>
          <p className="text-zinc-400">Your payment has been processed.</p>

          {paymentMutation.data.proofValid && <ProofBadge proofValid={true} />}

          <div className="pt-4 border-t border-zinc-800">
            <p className="text-zinc-500 text-xs font-mono break-all">
              Transaction: {paymentMutation.data.txHash}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Active checkout flow
  const isButtonDisabled =
    link.status !== "active" ||
    paymentMutation.isPending ||
    paymentMutation.isSuccess;

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-white">PhantomPay</h1>
          <p className="text-zinc-500 text-sm">Secure private payment</p>
        </div>

        {/* Link Details */}
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-sm">Amount</span>
            <span className="text-white text-2xl font-bold">
              {link.amount} {link.token}
            </span>
          </div>

          {link.description && (
            <div>
              <span className="text-zinc-400 text-sm block mb-1">
                Description
              </span>
              <p className="text-white text-sm">{link.description}</p>
            </div>
          )}

          {link.expiresAt && (
            <div>
              <span className="text-zinc-400 text-sm block mb-1">Expires</span>
              <p className="text-white text-sm">
                {new Date(link.expiresAt).toLocaleString()}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-zinc-700">
            <span className="text-zinc-400 text-sm">Privacy Mode</span>
            <PrivacyModeBadge mode={link.privacyMode} />
          </div>
        </div>


        {/* Verifiable Mode - Optional Proof */}
        {link.privacyMode === "verifiable" && (
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 space-y-3">
            <p className="text-zinc-300 text-sm font-medium">
              Verify your identity (optional)
            </p>
            <p className="text-zinc-500 text-xs">
              Connect your wallet to prove legitimacy without revealing your
              identity.
            </p>
            {!connected ? (
              <button
                onClick={() => setVisible(true)}
                className="w-full py-2 px-4 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded-lg transition-colors"
                aria-label="Connect wallet for verification"
              >
                Connect Wallet
              </button>
            ) : proofSignature ? (
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Proof generated</span>
              </div>
            ) : (
              <button
                onClick={handleGenerateProof}
                className="w-full py-2 px-4 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded-lg transition-colors"
                aria-label="Generate verification proof"
              >
                Generate Proof
              </button>
            )}
          </div>
        )}

        {/* Error Display */}
        {paymentMutation.isError && (
          <div
            role="alert"
            className="bg-red-950/40 border border-red-800 rounded-lg px-4 py-3 text-red-400 text-sm"
          >
            {paymentMutation.error instanceof Error
              ? paymentMutation.error.message
              : "Payment failed. Please try again."}
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmitPayment}
          disabled={isButtonDisabled}
          aria-label="Confirm payment"
          className="w-full py-3 px-6 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
        >
          {paymentMutation.isPending ? "Processing…" : "Confirm Payment"}
        </button>

        <p className="text-zinc-500 text-xs text-center">
          Your payment will be processed privately. No identity information is
          exposed.
        </p>
      </div>
    </div>
  );
}
