// config/bridge.config.js
// ============================================================================
//  UNIBRIDGE LIMITS: the ONE place to edit before going to production.
// ============================================================================

// Smallest transfer in either direction, in USD (USDC is 1:1).
// Keep it equal to the vault's on-chain minAmount (call setLimits if you change it).
export const MIN_BRIDGE_USD = 1

// Withdrawals back to USDC on Ethereum at or above KYC_MIN_USD open the KYC modal.
// KYC is NOT functional yet: the modal only shows a "reviewing your data" message
// and nothing is sent. KYC_MAX_USD is reserved for the later tiered checks.
//
// TEST VALUES for now. For production change to:  KYC_MIN_USD = 200,  KYC_MAX_USD = 1000
export const KYC_MIN_USD = 10
export const KYC_MAX_USD = 100

// Shown in the KYC message.
export const KYC_REVIEW_HOURS = 48

// ---------------------------------------------------------------------------
// Receiving-address authorisation. When someone sends to an address other than the
// one that made the transfer, the sender signs one of these free messages so the
// relayer knows the destination was really chosen by them (nobody else can redirect it).
// Shared so the browser and the server build the identical text.
// `recipient` must be the checksummed address.
// ---------------------------------------------------------------------------
export const deliveryMessage = (depositTx, recipient) =>
  ['Unibridge delivery', 'Network: Unichain', `Deposit tx: ${depositTx.toLowerCase()}`, `Recipient: ${recipient}`].join('\n')

export const payoutMessage = (lockTx, recipient) =>
  ['Unibridge payout', 'Network: Ethereum', `Lock tx: ${lockTx.toLowerCase()}`, `Recipient: ${recipient}`].join('\n')