import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { useEffect } from 'react';
import { useSingleGet } from 'shared/hooks/BackendAPI/useGet';

// initiate a web worker that will prepare the templates, to keep the main thread free.
export let schemasWorker = null;
if (typeof Worker !== 'undefined') {
  schemasWorker = new Worker(
    new URL('./openapi-json.worker.js', import.meta.url),
    { type: 'module' },
  );
}

const sendMessageToWorker = (message, ...payload) => {
  schemasWorker.postMessage([message, ...payload]);
};

const receiveMessageFromWorker = () => {};

export const useOpenapiToJson = () => {
  const fetch = useSingleGet();

  const { activeClusterName } = useMicrofrontendContext();

  useEffect(() => {
    if (typeof Worker === 'undefined') {
      console.error(
        "Browser doesn't support web workers. Extensibility create form and Text editor autocompletion not initialized",
      );
      return;
    }

    schemasWorker.postMessage(['shouldInitialize']);
    schemasWorker.onmessage = e => {
      if (e.data?.isInitialized === false) {
        fetch('/openapi/v2')
          .then(res => res.json())
          .then(data => {
            schemasWorker.postMessage(['initialize', data]);
          })
          .catch(err => {
            console.error(err);
          });
        return;
      }

      if (e.data?.isInitialized === true) {
        console.log('initialized');
        // schemasWorker.postMessage(['getSchema', schemaId]);
        // return;
      }
      // if (e.data[schemaId]) {
      //   setSchema(e.data[schemaId]);
      // }
      // if (e.data.error) {
      //   setError(e.data.error);
      // }
      // setLoading(false);
    };
  }, [activeClusterName]);
};
