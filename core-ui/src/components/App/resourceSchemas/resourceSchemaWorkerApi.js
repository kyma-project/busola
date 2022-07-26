let schemasWorker = null;
if (typeof Worker !== 'undefined') {
  schemasWorker = new Worker(
    new URL('./resourceSchemas.worker.js', import.meta.url),
    { type: 'module' },
  );
} else {
  console.warn(
    "The Browser doesn't support web workers. The creation of resources is limited to YAML editors (no forms) for EXT views. All Editors don't have autocompletion",
  );
}

export let isWorkerAvailable = !!schemasWorker;
export const terminateWorker = () => {
  schemasWorker?.terminate();
};

export const sendWorkerMessage = (message, ...payload) => {
  if (typeof message !== 'string') throw new Error('message must be defined');
  schemasWorker?.postMessage([message, ...payload]);
};

const listeners = {};
// a listener for the same message will overwrite a previous one
export const addWorkerListener = (message, messageHandlerFn) => {
  if (
    !schemasWorker ||
    typeof message !== 'string' ||
    typeof messageHandlerFn !== 'function'
  ) {
    console.error('addWorkerListener error');
    return;
  }
  listeners[message] = messageHandlerFn;
  schemasWorker.onmessage = event => {
    const { type, ...rest } = event.data;
    listeners[type](rest);
  };
};

// a new listener will overwrite a previous one
export const addWorkerErrorListener = errorHandlerFn => {
  if (!schemasWorker || typeof errorHandlerFn !== 'function') {
    console.error('addWorkerErrorListener error');
    return;
  }
  schemasWorker.onerror = err => {
    errorHandlerFn(err);
  };
};
