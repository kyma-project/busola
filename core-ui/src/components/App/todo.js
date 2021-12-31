import { handlers } from './handlers';

export function parseQuery(args) {
  for (const handler of handlers) {
    const result = handler.parseQuery(args);
    if (result) {
      console.log('pq', handler);
      return result;
    }
  }
  return null;
}

export async function createResults(args) {
  for (const handler of handlers) {
    const result = await handler.createResults(args);
    if (result) {
      console.log('cr', handler);
      return result;
    }
  }
  return null;
}
