import PQueue from 'p-queue';
import { Warning } from 'shared/hooks/useValidateResourceBySchema/useValidateResourceBySchema';
import { ValidationSchema } from 'state/validationSchemasAtom';

const worker = new Worker(
  new URL('./ResourceValidation.worker.ts', import.meta.url),
  { type: 'module' },
);

const queue = new PQueue({ concurrency: 1 });

const executeInWorker = (...args: any[]) =>
  queue.add(() => {
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
  });

export const ResourceValidation = {
  async setRuleset(validationSchemas: ValidationSchema) {
    return await executeInWorker(['setRuleset', validationSchemas]);
  },
  async validate(resources: any) {
    return (await executeInWorker(['validate', resources])) as Warning[];
  },
};
