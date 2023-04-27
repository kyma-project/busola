import { validate } from 'jsonschema';
import { Warning } from 'shared/hooks/useValidateResourceBySchema/useValidateResourceBySchema';
import { ValidationSchema } from 'state/validationSchemasAtom';

const worker = new Worker(
  new URL('./ResourceValidation.worker.js', import.meta.url),
  { type: 'module' },
);

const executeInWorker = (...args: any[]) => {
  return new Promise(resolve => {
    worker.addEventListener(
      'message',
      event => {
        resolve(event.data);
      },
      { once: true },
    );
    // @ts-ignore
    worker.postMessage(...args);
  });
};

export const ResourceValidation = {
  async setRuleset(validationSchemas: ValidationSchema) {
    return await executeInWorker(['setRuleset', validationSchemas]);
  },
  async validate(resources: any) {
    return (await executeInWorker(['validate', resources])) as Warning[];
  },
};
