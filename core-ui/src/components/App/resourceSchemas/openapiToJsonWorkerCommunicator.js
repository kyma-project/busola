// initiate a web worker that will prepare the templates, to keep the main thread free.

let schemasWorker = null;
if (typeof Worker !== 'undefined') {
  schemasWorker = new Worker(
    new URL('./openapiToJson.worker.js', import.meta.url),
    { type: 'module' },
  );
} else {
  console.warn(
    "The Browser doesn't support web workers. The creation is limited to YAML editors (no forms) for EXT views. All Editors don't have autocompletion",
  );
}

export const sendMessage = (message, ...payload) => {
  if (typeof message !== 'string') throw new Error('message must be defined');
  schemasWorker?.postMessage([message, ...payload]);
};

const listeners = {};
export const messageListener = (type, messageHandler) => {
  if (
    !schemasWorker ||
    typeof type !== 'string' ||
    typeof messageHandler !== 'function'
  ) {
    console.log('Incorrect receiveMessage input');
    return;
  }
  listeners[type] = messageHandler;
  schemasWorker.onmessage = event => {
    const { type = '', ...rest } = event.data;

    listeners[type]?.(rest);
  };
};
