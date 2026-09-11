// Busola fires a lot of background fetches from effects and click handlers, and
// when a view or the whole cluster is torn down mid-flight the browser cancels
// those requests. The cancellation surfaces as a rejected promise that nobody is
// awaiting anymore, so it bubbles up as an unhandled rejection. These aborts are
// harmless, but they still crash Cypress and spam the console for real users.
//
// Real HTTP failures are thrown as HttpError (see config.js), so we can tell them
// apart: only a plain transport-level failure or an explicit abort is benign. We
// swallow exactly that class and let everything else surface as before.
const isBenignFetchRejection = (reason: unknown): boolean => {
  if (reason instanceof DOMException && reason.name === 'AbortError') {
    return true;
  }
  // the message differs per browser: Chromium "Failed to fetch", Firefox
  // "NetworkError when attempting to fetch resource", Safari "Load failed"
  return (
    reason instanceof TypeError &&
    /failed to fetch|networkerror|load failed/i.test(reason.message)
  );
};

export const installFetchRejectionHandler = () => {
  window.addEventListener('unhandledrejection', (event) => {
    if (isBenignFetchRejection(event.reason)) {
      // keep it observable in devtools without crashing on a request that was
      // torn down anyway; anything a caller actually handles never lands here
      console.debug('Ignoring aborted background request:', event.reason);
      event.preventDefault();
    }
  });
};

export const _test = { isBenignFetchRejection };
