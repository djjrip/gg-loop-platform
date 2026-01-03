/**
 * GG LOOP - Boot Immunity Layer
 * Prevents infinite loading states by enforcing timeouts
 * 
 * INNOVATION: This creates an IMPOSSIBLE class of failures
 * - Auth hangs → timeout → fallback to logged-out state
 * - Config hangs → timeout → use defaults
 * - Any boot fetch → guaranteed resolution
 */

import { useState, useEffect, useRef } from 'react';

// Boot immunity timeout - homepage MUST render within this
const BOOT_TIMEOUT_MS = 3000;

/**
 * Hook that provides a timeout-protected loading state
 * After timeout, isLoading becomes false regardless of actual state
 */
export function useBootImmunity(actualIsLoading: boolean) {
    const [timedOut, setTimedOut] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (actualIsLoading && !timedOut) {
            timeoutRef.current = setTimeout(() => {
                console.warn('[BootImmunity] Auth timeout reached - forcing homepage render');
                setTimedOut(true);
            }, BOOT_TIMEOUT_MS);
        }

        // Clear timeout if loading completes before timeout
        if (!actualIsLoading && timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [actualIsLoading, timedOut]);

    // If timed out OR no longer loading, we're good to render
    return {
        isLoading: actualIsLoading && !timedOut,
        timedOut,
    };
}

/**
 * Utility: Create a fetch with timeout
 */
export async function fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeoutMs: number = BOOT_TIMEOUT_MS
): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error: any) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error(`Request to ${url} timed out after ${timeoutMs}ms`);
        }
        throw error;
    }
}
