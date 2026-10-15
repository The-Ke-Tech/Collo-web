/**
 * Network helpers used across the storefront.
 *
 * - isNetworkError():        true when an error is a "can't reach the server" failure
 *                            (e.g. the browser's raw "Failed to fetch").
 * - redirectToNetworkError(): sends the visitor to /network-error and remembers where to return to.
 * - getSafeReturnPath():     validates the "from" value so the error page can never redirect off-site.
 */

export const NETWORK_ERROR_PATH = '/network-error';
export const OFFLINE_PAGE_PATH = '/offline.html';

// Raw messages different browsers use when a request never reaches the server
const NETWORK_MESSAGE_PATTERN =
  /failed to fetch|networkerror|network request failed|load failed|fetch failed|network error|err_internet_disconnected|err_network/i;

export const isNetworkError = (err: unknown): boolean => {
  const message =
    err instanceof Error ? err.message : typeof err === 'string' ? err : '';

  if (NETWORK_MESSAGE_PATTERN.test(message)) return true;

  // A TypeError thrown by fetch() while the browser reports it is offline
  if (
    err instanceof TypeError &&
    typeof navigator !== 'undefined' &&
    navigator.onLine === false
  ) {
    return true;
  }

  return false;
};

export const redirectToNetworkError = (): void => {
  if (typeof window === 'undefined') return;

  const { pathname, search } = window.location;
  // Never redirect from either connection-status screen (prevents redirect loops).
  if (pathname.startsWith(NETWORK_ERROR_PATH) || pathname === OFFLINE_PAGE_PATH) return;

  // A React route cannot be relied on when the network is completely unavailable.
  // The service worker precaches offline.html, so it remains renderable without a connection.
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    window.location.replace(OFFLINE_PAGE_PATH);
    return;
  }

  const from = encodeURIComponent(`${pathname}${search}`);
  // replace(): the failing page is not added to history, so the Back button won't bounce the user back into the error
  window.location.replace(`${NETWORK_ERROR_PATH}?from=${from}`);
};

export const getSafeReturnPath = (from: string | null | undefined): string => {
  if (
    from &&
    from.startsWith('/') &&
    !from.startsWith('//') &&
    !from.startsWith(NETWORK_ERROR_PATH)
  ) {
    return from;
  }
  return '/';
};