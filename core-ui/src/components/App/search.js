import { handlers } from './handlers';

export async function search(context) {
  for (const handler of handlers) {
    const result = await handler(context);
    if (result.searchResults?.length > 0 || result.suggestion !== null) {
      return result;
    }
  }
  return { suggestion: null, searchResults: [] };
}
