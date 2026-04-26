import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSessionKey } from '../useSessionKey';
import { PublicKey } from '@solana/web3.js';

// Mock the wallet adapter
const mockUseWallet = vi.fn();
vi.mock('@solana/wallet-adapter-react', () => ({
  useWallet: () => mockUseWallet(),
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('useSessionKey', () => {
  const mockPublicKey = new PublicKey('11111111111111111111111111111112');
  
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it('should return null when wallet is not connected', () => {
    mockUseWallet.mockReturnValue({ publicKey: null });
    
    const { result } = renderHook(() => useSessionKey());
    
    expect(result.current.getSessionKey()).toBeNull();
  });

  it('should return false for isPresent when no data in localStorage', () => {
    mockUseWallet.mockReturnValue({ publicKey: mockPublicKey });
    mockLocalStorage.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useSessionKey());
    
    expect(result.current.isPresent()).toBe(false);
  });

  it('should return true for isPresent when data exists in localStorage', () => {
    mockUseWallet.mockReturnValue({ publicKey: mockPublicKey });
    mockLocalStorage.getItem.mockReturnValue('{"ciphertext":"test","iv":"test","salt":"test"}');
    
    const { result } = renderHook(() => useSessionKey());
    
    expect(result.current.isPresent()).toBe(true);
  });

  it('should clear localStorage when clearSessionKey is called', () => {
    mockUseWallet.mockReturnValue({ publicKey: mockPublicKey });
    
    const { result } = renderHook(() => useSessionKey());
    
    act(() => {
      result.current.clearSessionKey();
    });
    
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('ppsk');
  });

  it('should store and retrieve session key with real crypto', async () => {
    mockUseWallet.mockReturnValue({ publicKey: mockPublicKey });
    
    // Use real localStorage for this test
    const realStorage: { [key: string]: string } = {};
    mockLocalStorage.getItem.mockImplementation((key) => realStorage[key] || null);
    mockLocalStorage.setItem.mockImplementation((key, value) => {
      realStorage[key] = value;
    });
    mockLocalStorage.removeItem.mockImplementation((key) => {
      delete realStorage[key];
    });
    
    const { result, rerender } = renderHook(() => useSessionKey());
    
    const testSessionKey = 'test-session-key-12345';
    
    // Store the session key
    await act(async () => {
      await result.current.storeSessionKey(testSessionKey);
    });
    
    // Verify it was stored
    expect(result.current.isPresent()).toBe(true);
    
    // Wait for auto-decryption to complete
    await waitFor(() => {
      expect(result.current.getSessionKey()).toBe(testSessionKey);
    }, { timeout: 1000 });
    
    // Test that it persists across hook re-renders
    rerender();
    
    await waitFor(() => {
      expect(result.current.getSessionKey()).toBe(testSessionKey);
    }, { timeout: 1000 });
  });

  it('should return null when wallet disconnects', async () => {
    // Start with connected wallet
    mockUseWallet.mockReturnValue({ publicKey: mockPublicKey });
    
    const realStorage: { [key: string]: string } = {};
    mockLocalStorage.getItem.mockImplementation((key) => realStorage[key] || null);
    mockLocalStorage.setItem.mockImplementation((key, value) => {
      realStorage[key] = value;
    });
    
    const { result, rerender } = renderHook(() => useSessionKey());
    
    // Store a session key
    await act(async () => {
      await result.current.storeSessionKey('test-key');
    });
    
    // Wait for it to be available
    await waitFor(() => {
      expect(result.current.getSessionKey()).toBe('test-key');
    });
    
    // Disconnect wallet
    mockUseWallet.mockReturnValue({ publicKey: null });
    rerender();
    
    // Should return null when wallet is disconnected
    expect(result.current.getSessionKey()).toBeNull();
  });

  it('should clear cached key when wallet changes', async () => {
    const publicKey1 = new PublicKey('11111111111111111111111111111112');
    const publicKey2 = new PublicKey('11111111111111111111111111111113');
    
    // Start with first wallet
    mockUseWallet.mockReturnValue({ publicKey: publicKey1 });
    
    const realStorage: { [key: string]: string } = {};
    mockLocalStorage.getItem.mockImplementation((key) => realStorage[key] || null);
    mockLocalStorage.setItem.mockImplementation((key, value) => {
      realStorage[key] = value;
    });
    
    const { result, rerender } = renderHook(() => useSessionKey());
    
    // Store a session key with first wallet
    await act(async () => {
      await result.current.storeSessionKey('key-for-wallet-1');
    });
    
    await waitFor(() => {
      expect(result.current.getSessionKey()).toBe('key-for-wallet-1');
    });
    
    // Switch to second wallet
    mockUseWallet.mockReturnValue({ publicKey: publicKey2 });
    rerender();
    
    // Should return null because the cached key is for a different wallet
    expect(result.current.getSessionKey()).toBeNull();
  });
});