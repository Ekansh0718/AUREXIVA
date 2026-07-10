/** Shared helpers for payment providers. Provider-agnostic — no gateway-specific logic here. */

/** Generates a mock transaction ID in an obviously-fake format so it can
 *  never be confused with a real bank transaction ID in logs or support
 *  tickets. Replace usage with the real provider's ID once integrated. */
export const generateMockTransactionId = (): string => {
  const random = Math.random().toString(36).slice(2, 10).toUpperCase()
  return `MOCK-TXN-${Date.now()}-${random}`
}

export const generateMockGatewayReference = (): string => `MOCK-REF-${crypto.randomUUID()}`

/** Most gateways expect amounts in the smallest currency unit (e.g. cents). */
export const toMinorUnits = (amount: number): number => Math.round(amount * 100)

export const fromMinorUnits = (amount: number): number => amount / 100
