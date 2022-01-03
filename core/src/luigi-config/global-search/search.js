import { handlers } from './handlers';

export async function search(searchString, context) {
  const tokens = searchString.split(/\s+/).filter(Boolean);

  for (const handler of handlers) {
    const result = await handler({ ...context, searchString, tokens });
    if (result.searchResults?.length > 0 || result.suggestion !== null) {
      return result;
    }
  }
  return { suggestion: null, searchResults: [] };
}
