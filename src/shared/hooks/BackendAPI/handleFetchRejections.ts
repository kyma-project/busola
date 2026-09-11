// Fetches cancelled by view/cluster teardown surface as unhandled rejections that crash
// Cypress. Real failures are HttpError (config.js), so only aborts/transport errors are benign.
const isBenignFetchRejection = (reason: unknown): boolean => {
  if (reason instanceof DOMException && reason.name === 'AbortError') {
    return true;
  }
  // browser-specific: "Failed to fetch" / "NetworkError..." / "Load failed"
  return (
    reason instanceof TypeError &&
    /failed to fetch|networkerror|load failed/i.test(reason.message)
  );
};

export const installFetchRejectionHandler = () => {
  window.addEventListener('unhandledrejection', (event) => {
    if (isBenignFetchRejection(event.reason)) {
      // observable in devtools without crashing on a torn-down request
      console.debug('Ignoring aborted background request:', event.reason);
      event.preventDefault();
    }
  });
};

export const _test = { isBenignFetchRejection };
