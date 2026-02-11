import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook to create an AbortController that automatically aborts on unmount
 * @returns AbortController signal that can be passed to API calls
 */
export function useAbortController() {
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortControllerRef.current = new AbortController();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return abortControllerRef.current?.signal;
}

/**
 * Hook for managing API calls with automatic cleanup
 * @param apiCall - Function that performs the API call, accepts AbortSignal
 * @param dependencies - useEffect dependency array
 */
export function useApiCall<T>(
  apiCall: (signal: AbortSignal) => Promise<T>,
  dependencies: any[] = []
) {
  const abortControllerRef = useRef<AbortController | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    setLoading(true);
    setError(null);

    apiCall(signal)
      .then((result) => {
        if (!signal.aborted) {
          setData(result);
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError' && !signal.aborted) {
          setError(err);
        }
      })
      .finally(() => {
        if (!signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, dependencies);

  return { data, loading, error };
}