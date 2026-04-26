interface ApiClientOptions {
  getSessionKey: () => string | null;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public details?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  constructor(private opts: ApiClientOptions) {}

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const sessionKey = this.opts.getSessionKey();
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    
    // Session key ONLY in Authorization header, never in URL or body
    if (sessionKey) {
      headers['Authorization'] = `Bearer ${sessionKey}`;
    }

    const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}${path}`;
    
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error' }));
      throw new ApiError(res.status, err.error || 'Request failed', err.details);
    }

    return res.json();
  }

  // Auth endpoints
  async getNonce(walletAddress: string): Promise<{ nonce: string; message: string }> {
    return this.request('POST', '/auth/challenge', { walletAddress });
  }

  async connect(walletAddress: string, signature: string, nonce: string): Promise<{
    sessionToken: string;
    sessionWalletPublicKey: string;
  }> {
    return this.request('POST', '/auth/connect', {
      walletAddress,
      signature,
      nonce,
    });
  }

  async revokeSession(): Promise<void> {
    return this.request('POST', '/auth/revoke-session');
  }

  // Payment Link endpoints
  async createLink(data: {
    amount: number;
    token: 'SOL' | 'USDC';
    description?: string;
    expiresAt?: string;
    privacyMode: 'anonymous' | 'verifiable';
    usageType: 'single-use' | 'multiple-use';
  }): Promise<{
    id: string;
    amount: number;
    token: 'SOL' | 'USDC';
    description: string | null;
    expiresAt: string | null;
    privacyMode: 'anonymous' | 'verifiable';
    status: 'active';
    createdAt: string;
  }> {
    return this.request('POST', '/payments/links', data);
  }

  async getLinks(): Promise<Array<{
    id: string;
    amount: number;
    token: 'SOL' | 'USDC';
    description: string | null;
    expiresAt: string | null;
    privacyMode: 'anonymous' | 'verifiable';
    status: 'active' | 'expired' | 'fulfilled' | 'deactivated';
    createdAt: string;
  }>> {
    return this.request('GET', '/payments/links');
  }

  async getPublicLink(linkId: string): Promise<{
    id: string;
    amount: number;
    token: 'SOL' | 'USDC';
    description: string | null;
    expiresAt: string | null;
    privacyMode: 'anonymous' | 'verifiable';
    status: 'active' | 'expired' | 'fulfilled' | 'deactivated';
  }> {
    return this.request('GET', `/payments/links/${linkId}`);
  }

  async deactivateLink(linkId: string): Promise<void> {
    return this.request('POST', `/payments/links/${linkId}/deactivate`);
  }

  // Payment submission
  async submitPayment(linkId: string, body: {
    senderProof?: string;
  }): Promise<{
    txHash: string;
    proofValid: boolean;
  }> {
    return this.request('POST', `/payments/pay/${linkId}`, body);
  }

  // Dashboard data
  async getEarnings(): Promise<{
    totalEarningsSOL: number;
    totalEarningsUSDC: number;
    paymentCount: number;
    bagsFeesGenerated: number;
  }> {
    return this.request('GET', '/earnings');
  }

  async getPortfolio(): Promise<Array<{
    tokenName: string;
    tokenSymbol: string;
    quantity: number;
    estimatedValue: number;
  }>> {
    return this.request('GET', '/portfolio');
  }

  async getHistory(page: number): Promise<{
    records: Array<{
      id: string;
      paymentLinkId: string;
      direction: 'received';
      amount: number;
      token: 'SOL' | 'USDC';
      privacyMode: 'anonymous' | 'verifiable';
      proofValid: boolean;
      createdAt: string;
    }>;
    total: number;
  }> {
    return this.request('GET', `/payments/history?page=${page}`);
  }
}

export function createApiClient(getSessionKey: () => string | null): ApiClient {
  return new ApiClient({ getSessionKey });
}

// Export for use in components (will be configured in AuthContext)
export let apiClient: ApiClient;

export function setApiClient(client: ApiClient) {
  apiClient = client;
}