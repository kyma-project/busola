Cypress.Commands.add('handleExceptions', () => {
  Cypress.on('uncaught:exception', (err) => {
    Cypress.log(err);
    if (
      err.message.includes('Unexpected usage') ||
      err.message.includes(
        "Cannot read properties of undefined (reading 'uri')",
      ) ||
      err.message.includes('ResizeObserver loop limit exceeded') ||
      err.message.includes('502 Bad Gateway') ||
      err.message.includes(
        'ResizeObserver loop completed with undelivered notifications',
      ) ||
      err.message.includes(
        "Cannot read properties of null (reading 'sendError')",
      ) ||
      err.message.includes(
        "Uncaught NetworkError: Failed to execute 'importScripts' on 'WorkerGlobalScope': The script at",
      ) ||
      err.message.includes(
        "Cannot read properties of undefined (reading 'category')",
      ) ||
      err.message.includes('Model is disposed!') ||
      err.message.includes('No available data to authenticate the request.') ||
      err.message.includes(
        "Cannot read properties of null (reading 'querySelector')",
      ) ||
      err.message.includes(
        "Cannot read properties of undefined (reading 'hasAttribute')",
      ) ||
      err.message.includes(
        "Cannot read properties of null (reading 'getBoundingClientRect')",
      ) ||
      err.message.includes(
        "Cannot read properties of undefined (reading 'showAt')",
      ) ||
      // Exceptions due to reported issues to monaco editor.
      err.message.includes('items is not iterable') ||
      err.message.includes('Canceled') ||
      // A cluster switch or view teardown cancels in-flight background fetches,
      // which surface as an unhandled rejection with a browser-specific transport
      // message. The app already ignores these (see handleFetchRejections), but
      // Cypress fails on any unhandled rejection regardless, so we drop the same
      // benign class here too. Real HTTP errors are HttpError, not a bare fetch.
      err.message.includes('Failed to fetch') ||
      err.message.includes('NetworkError when attempting to fetch resource') ||
      err.message.includes('Load failed')
    )
      return false;
  });
});
