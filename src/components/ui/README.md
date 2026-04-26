# UI Components

This directory contains shared UI primitives for the PhantomPay frontend application.

## Components

### SkeletonBlock
A loading placeholder component with customizable width, height, and styling.
- Props: `width`, `height`, `className`
- Includes `aria-hidden="true"` for accessibility

### ErrorSection
An error display component with optional retry functionality.
- Props: `message`, `onRetry`
- Includes proper ARIA attributes for accessibility

### ToastNotification
A notification component for displaying alerts and messages.
- Props: `message`, `type`, `onClose`
- Includes `aria-live="polite"` for screen reader announcements
- Supports success, error, and info types

### CopyButton
A button component for copying text to clipboard with visual feedback.
- Props: `value`, `label`, `className`
- Includes proper ARIA labels and clipboard functionality
- Shows "Copied!" feedback for 2 seconds

### TruncatedAddress
Displays wallet addresses in truncated format (first 4 + last 4 characters).
- Props: `address`, `className`
- Renders as: `1A1z...vfNa`
- Includes full address in title attribute

### PrivacyModeBadge
A badge component for displaying privacy mode status.
- Props: `mode`, `className`
- Supports 'anonymous' and 'verifiable' modes
- Includes appropriate icons and ARIA labels

### ProofBadge
A verification badge that only renders when proof is valid.
- Props: `proofValid`
- Only renders when `proofValid === true`
- Includes `role="status"` and `aria-label` for accessibility
- Displays "Verified sender, identity withheld"

## Usage

```tsx
import { 
  SkeletonBlock, 
  ErrorSection, 
  ToastNotification, 
  CopyButton, 
  TruncatedAddress, 
  PrivacyModeBadge, 
  ProofBadge 
} from '@/components/ui'

// Example usage
<SkeletonBlock width="w-32" height="h-8" />
<ErrorSection message="Something went wrong" onRetry={handleRetry} />
<TruncatedAddress address="1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa" />
<ProofBadge proofValid={true} />
```

## Accessibility

All components follow accessibility best practices:
- Proper ARIA labels and roles
- Screen reader support
- Keyboard navigation support
- Color contrast compliance
- Semantic HTML structure

## Testing

Each component includes comprehensive unit tests using Vitest and React Testing Library. Tests cover:
- Rendering with default and custom props
- Accessibility attributes
- User interactions
- Edge cases and error states