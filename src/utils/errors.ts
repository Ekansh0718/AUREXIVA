/** Supabase's query errors (PostgrestError, AuthError, etc.) are plain
 *  objects with a `message` string — they are NOT `instanceof Error`. This
 *  extracts a human-readable message from either shape so error handling
 *  doesn't silently fall back to a generic string for Supabase failures. */
export const getErrorMessage = (err: unknown, fallback = 'Something went wrong. Please try again.'): string => {
  if (err instanceof Error) return err.message
  if (typeof err === 'object' && err !== null && 'message' in err && typeof err.message === 'string') {
    return err.message
  }
  return fallback
}
