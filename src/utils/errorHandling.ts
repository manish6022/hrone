/**
 * Utility functions for consistent error handling with AbortController
 */

/**
 * Checks if an error is from a cancelled/aborted request
 */
export function isCanceledError(error: any): boolean {
  if (!error) return false;
  
  // Check for different types of abort/canceled errors
  return (
    error.name === 'AbortError' ||
    error.message === 'canceled' ||
    error.code === 'ERR_CANCELED' ||
    (error.constructor && error.constructor.name === 'CanceledError')
  );
}

/**
 * Logs error only if it's not a cancellation error
 */
export function logNonCanceledError(message: string, error: any): void {
  if (!isCanceledError(error)) {
    console.error(message, error);
  }
}

/**
 * Error handling wrapper for async functions with AbortController
 */
export async function withAbortHandling<T>(
  asyncFn: (signal: AbortSignal) => Promise<T>,
  signal?: AbortSignal,
  errorMessage?: string
): Promise<T | null> {
  try {
    return await asyncFn(signal!);
  } catch (error) {
    if (isCanceledError(error)) {
      return null; // Silently return null for canceled requests
    }
    
    logNonCanceledError(errorMessage || "Async operation failed", error);
    throw error; // Re-throw non-canceled errors
  }
}