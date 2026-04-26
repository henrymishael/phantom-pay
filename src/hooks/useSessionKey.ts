import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useRef, useCallback, useState } from 'react';

interface EncryptedSessionKeyEntry {
  ciphertext: string;   // base64-encoded AES-256-GCM ciphertext
  iv: string;           // base64-encoded 12-byte IV
  salt: string;         // base64-encoded 16-byte PBKDF2 salt
}

interface UseSessionKey {
  getSessionKey(): string | null;       // decrypt and return, or null
  storeSessionKey(key: string): Promise<void>;   // encrypt and persist
  clearSessionKey(): void;              // delete from localStorage
  isPresent(): boolean;                 // check if encrypted key exists
  isReady: boolean;                     // true when decryption is complete (or not needed)
}

const STORAGE_KEY = 'ppsk';
const PBKDF2_ITERATIONS = 100_000;

export function useSessionKey(): UseSessionKey {
  const { publicKey } = useWallet();
  const decryptedKeyRef = useRef<string | null>(null);
  const lastPublicKeyRef = useRef<string | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);

  const deriveKey = async (salt: Uint8Array): Promise<CryptoKey> => {
    if (!publicKey) {
      throw new Error('Wallet not connected - cannot derive encryption key');
    }

    // Use wallet public key bytes as the password for PBKDF2
    const publicKeyBytes = publicKey.toBytes();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new Uint8Array(publicKeyBytes),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: new Uint8Array(salt),
        iterations: PBKDF2_ITERATIONS,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  };

  const decryptSessionKey = useCallback(async (): Promise<string | null> => {
    if (!publicKey) {
      // Wallet is disconnected, cannot decrypt
      return null;
    }

    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return null;
      }

      const entry: EncryptedSessionKeyEntry = JSON.parse(stored);

      // Convert base64 back to Uint8Array
      const ciphertext = Uint8Array.from(atob(entry.ciphertext), c => c.charCodeAt(0));
      const iv = Uint8Array.from(atob(entry.iv), c => c.charCodeAt(0));
      const salt = Uint8Array.from(atob(entry.salt), c => c.charCodeAt(0));

      // Derive the same key using the stored salt
      const key = await deriveKey(salt);

      // Decrypt the session key
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        ciphertext
      );

      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      console.error('Failed to decrypt session key:', error);
      // Clear corrupted data
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          // Ignore
        }
      }
      return null;
    }
  }, [publicKey]);

  // Auto-decrypt when wallet connects or changes
  useEffect(() => {
    let isMounted = true;

    const runDecryption = async () => {
      if (!publicKey) {
        decryptedKeyRef.current = null;
        lastPublicKeyRef.current = null;
        if (isMounted) setIsReady(true);
        return;
      }

      const currentPublicKeyStr = publicKey.toString();
      
      // If wallet changed, clear cached key
      if (lastPublicKeyRef.current !== currentPublicKeyStr) {
        decryptedKeyRef.current = null;
      }

      // If we don't have a cached key and there's encrypted data, decrypt it
      if (!decryptedKeyRef.current && typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY)) {
        if (isMounted) setIsReady(false);
        try {
          const key = await decryptSessionKey();
          if (key && isMounted) {
            decryptedKeyRef.current = key;
            lastPublicKeyRef.current = currentPublicKeyStr;
          }
        } catch (error) {
          console.error('Auto-decryption failed:', error);
        } finally {
          if (isMounted) setIsReady(true);
        }
      } else {
        if (isMounted) setIsReady(true);
      }

      if (isMounted) {
        lastPublicKeyRef.current = currentPublicKeyStr;
      }
    };

    runDecryption();

    return () => {
      isMounted = false;
    };
  }, [publicKey, decryptSessionKey]);

  const storeSessionKey = useCallback(async (sessionKey: string): Promise<void> => {
    if (!publicKey) {
      throw new Error('Wallet not connected - cannot store session key');
    }

    if (typeof window === 'undefined') {
      throw new Error('Cannot store session key on server');
    }

    try {
      // Generate random salt and IV
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv = crypto.getRandomValues(new Uint8Array(12));

      // Derive encryption key from wallet public key
      const key = await deriveKey(salt);

      // Encrypt the session key
      const encoder = new TextEncoder();
      const data = encoder.encode(sessionKey);
      const ciphertext = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        data
      );

      // Store as base64 JSON
      const entry: EncryptedSessionKeyEntry = {
        ciphertext: btoa(String.fromCharCode(...new Uint8Array(ciphertext))),
        iv: btoa(String.fromCharCode(...iv)),
        salt: btoa(String.fromCharCode(...salt)),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
      
      // Cache the decrypted key for synchronous access
      decryptedKeyRef.current = sessionKey;
      lastPublicKeyRef.current = publicKey.toString();
    } catch (error) {
      console.error('Failed to store session key:', error);
      throw new Error('Failed to encrypt and store session key');
    }
  }, [publicKey]);

  const getSessionKey = useCallback((): string | null => {
    if (!publicKey) {
      // Wallet is disconnected, cannot decrypt
      return null;
    }

    // Return cached decrypted key if available for current wallet
    if (decryptedKeyRef.current && lastPublicKeyRef.current === publicKey.toString()) {
      return decryptedKeyRef.current;
    }

    // No cached key available
    return null;
  }, [publicKey]);

  const clearSessionKey = useCallback((): void => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore
      }
    }
    decryptedKeyRef.current = null;
    lastPublicKeyRef.current = null;
  }, []);

  const isPresent = useCallback((): boolean => {
    if (typeof window === 'undefined') return false
    try {
      return localStorage.getItem(STORAGE_KEY) !== null
    } catch {
      return false
    }
  }, []);

  return {
    getSessionKey,
    storeSessionKey,
    clearSessionKey,
    isPresent,
    isReady,
  };
}