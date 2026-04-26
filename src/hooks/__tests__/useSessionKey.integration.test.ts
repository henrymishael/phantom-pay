import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSessionKey } from '../useSessionKey';
import { PublicKey } from '@solana/web3.js';

// Mock the wallet adapter
const mockUseWallet = vi.fn();
vi.mock('@solana/wallet-adapter-react', () => ({
  useWallet: () => mockUseWallet(),
}));

describe('useSessionKey Integration Tests', () => {
  const mockPublicKey1 = new PublicKey('11111111111111111111111111111112');
  const mockPublicKey2 = new PublicKey('11111111111111111111111111111113');
  
  // Use a real localStorage implementation for integration tests
  let realStorage: { [key: string]: string } = {};
  
  beforeEach(() => {
    vi.clearAllMocks();
    realStorage = {};
    
    // Mock localStorage with real storage behavior
    Object.defineProperty(global, 'localStorage', {
      value: {
        getItem: (key: string) => realStorage[key] || null,
        setItem: (key: string, value: string) => {
          realStorage[key] = value;
        },
        removeItem: (key: string) => {
          delete realStorage[key];
        },
      },
      writable: true,
    });
  });

  it('should perform complete encryption/decryption round-trip', async () => {
    mockUseWallet.mockReturnValue({ publicKey: mockPublicKey1 });
    
    const { result } = renderHook(() => useSessionKey());
    
    const testSessionKey = 'my-secret-session-key-12345';
    
    // Initially no session key
    expect(result.current.getSessionKey()).toBeNull();
    expect(result.current.isPresent()).toBe(false);
    
    // Store the session key
    await act(async () => {
      await result.current.storeSessionKey(testSessionKey);
    });
    
    // Should be present in localStorage
    expect(result.current.isPresent()).toBe(true);
    expect(realStorage['ppsk']).toBeDefined();
    
    // Verify the stored data has the expected structure
    const storedData = JSON.parse(realStorage['ppsk']);
    expect(storedData).toHaveProperty('ciphertext');
    expect(storedData).toHaveProperty('iv');
    expect(storedData).toHaveProperty('salt');
    expect(typeof storedData.ciphertext).toBe('string');
    expect(typeof storedData.iv).toBe('string');
    expect(typeof storedData.salt).toBe('string');
    
    // Should be able to retrieve the session key
    await waitFor(() => {
      expect(result.current.getSessionKey()).toBe(testSessionKey);
    }, { timeout: 1000 });
  });

  it('should handle wallet disconnection properly', async () => {
    // Start with connected wallet
    mockUseWallet.mockReturnValue({ publicKey: mockPublicKey1 });
    
    const { result, rerender } = renderHook(() => useSessionKey());
    
    const testSessionKey = 'test-key-for-disconnection';
    
    // Store session key
    await act(async () => {
      await result.current.storeSessionKey(testSessionKey);
    });
    
    // Verify it's available
    await waitFor(() => {
      expect(result.current.getSessionKey()).toBe(testSessionKey);
    });
    
    // Disconnect wallet
    mockUseWallet.mockReturnValue({ publicKey: null });
    rerender();
    
    // Should return null when wallet is disconnected
    expect(result.current.getSessionKey()).toBeNull();
    
    // But data should still be present in localStorage
    expect(result.current.isPresent()).toBe(true);
    
    // Reconnect same wallet
    mockUseWallet.mockReturnValue({ publicKey: mockPublicKey1 });
    rerender();
    
    // Should be able to decrypt again
    await waitFor(() => {
      expect(result.current.getSessionKey()).toBe(testSessionKey);
    }, { timeout: 1000 });
  });

  it('should not decrypt with different wallet', async () => {
    // Store with first wallet
    mockUseWallet.mockReturnValue({ publicKey: mockPublicKey1 });
    
    const { result, rerender } = renderHook(() => useSessionKey());
    
    const testSessionKey = 'key-for-wallet-1';
    
    await act(async () => {
      await result.current.storeSessionKey(testSessionKey);
    });
    
    await waitFor(() => {
      expect(result.current.getSessionKey()).toBe(testSessionKey);
    });
    
    // Switch to different wallet
    mockUseWallet.mockReturnValue({ publicKey: mockPublicKey2 });
    rerender();
    
    // Should not be able to decrypt with different wallet
    expect(result.current.getSessionKey()).toBeNull();
    
    // Data should still be present but not accessible
    expect(result.current.isPresent()).toBe(true);
    
    // Even after waiting, should still be null
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(result.current.getSessionKey()).toBeNull();
  });

  it('should clear session key completely', async () => {
    mockUseWallet.mockReturnValue({ publicKey: mockPublicKey1 });
    
    const { result } = renderHook(() => useSessionKey());
    
    // Store session key
    await act(async () => {
      await result.current.storeSessionKey('test-key-to-clear');
    });
    
    // Verify it's stored and accessible
    expect(result.current.isPresent()).toBe(true);
    await waitFor(() => {
      expect(result.current.getSessionKey()).toBe('test-key-to-clear');
    });
    
    // Clear the session key
    act(() => {
      result.current.clearSessionKey();
    });
    
    // Should be completely gone
    expect(result.current.isPresent()).toBe(false);
    expect(result.current.getSessionKey()).toBeNull();
    expect(realStorage['ppsk']).toBeUndefined();
  });

  it('should handle corrupted localStorage data gracefully', async () => {
    // First, set up the hook without corrupted data
    mockUseWallet.mockReturnValue({ publicKey: mockPublicKey1 });
    const { result } = renderHook(() => useSessionKey());
    
    // Now manually corrupt the data after the hook is initialized
    act(() => {
      realStorage['ppsk'] = 'invalid-json-data';
    });
    
    // Should report as present initially
    expect(result.current.isPresent()).toBe(true);
    
    // But getSessionKey should return null and not crash
    expect(result.current.getSessionKey()).toBeNull();
    
    // The hook should handle the corrupted data gracefully without throwing
    expect(() => result.current.getSessionKey()).not.toThrow();
  });
});