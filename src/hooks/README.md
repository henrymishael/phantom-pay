# useSessionKey Hook

The `useSessionKey` hook provides secure session key management for the PhantomPay frontend. It encrypts session keys using AES-256-GCM with PBKDF2 key derivation tied to the user's wallet public key.

## Features

- **AES-256-GCM encryption** with 12-byte IV
- **PBKDF2 key derivation** (100,000 iterations, SHA-256) using wallet public key
- **16-byte random salt** for each encryption
- **Base64 JSON storage** in localStorage under key `"ppsk"`
- **Automatic cleanup** on wallet disconnection
- **Graceful error handling** for corrupted data

## Usage

```typescript
import { useSessionKey } from '@/hooks/useSessionKey';

function MyComponent() {
  const { getSessionKey, storeSessionKey, clearSessionKey, isPresent } = useSessionKey();

  // Check if a session key exists
  const hasSessionKey = isPresent();

  // Store a new session key (async)
  const handleStoreKey = async () => {
    try {
      await storeSessionKey('my-session-key-12345');
      console.log('Session key stored successfully');
    } catch (error) {
      console.error('Failed to store session key:', error);
    }
  };

  // Get the current session key (sync)
  const sessionKey = getSessionKey(); // Returns string | null

  // Clear the session key
  const handleClearKey = () => {
    clearSessionKey();
  };

  return (
    <div>
      <p>Session key present: {hasSessionKey ? 'Yes' : 'No'}</p>
      <p>Session key available: {sessionKey ? 'Yes' : 'No'}</p>
      <button onClick={handleStoreKey}>Store Key</button>
      <button onClick={handleClearKey}>Clear Key</button>
    </div>
  );
}
```

## Security Features

1. **Wallet-tied encryption**: Session keys can only be decrypted with the same wallet public key used for encryption
2. **No plaintext storage**: Session keys are never stored in plaintext
3. **Automatic cleanup**: Keys are cleared when wallet disconnects
4. **Memory safety**: Decrypted keys are cached in memory only while wallet is connected
5. **Error resilience**: Corrupted data is automatically cleaned up

## Storage Format

The encrypted session key is stored in localStorage as JSON:

```json
{
  "ciphertext": "base64-encoded-encrypted-data",
  "iv": "base64-encoded-12-byte-iv",
  "salt": "base64-encoded-16-byte-salt"
}
```

## Requirements Satisfied

- **10.1**: AES-256-GCM encryption with PBKDF2 key derivation
- **10.2**: Immediate cleanup on wallet disconnection
- **10.3**: No console logging of session keys
- **10.4**: Session key only in Authorization headers
- **10.5**: Session key never exposed in UI