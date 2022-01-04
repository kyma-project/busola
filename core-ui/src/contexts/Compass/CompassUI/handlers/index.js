import { nonResourceHandler } from './nonResourceHandler';
import { clusterwideResourceHandler } from './clusterwideResourceHandler';
import { namespacedResourceHandler } from './namespacedResourceHandler';
import { nodesHandler } from './nodesHandler';

const handlers = [
  nonResourceHandler,
  clusterwideResourceHandler,
  namespacedResourceHandler,
  nodesHandler,
];

export async function search(searchContext) {
  const { searchStartTime, ...context } = searchContext;

  for (const handler of handlers) {
    const result = await handler(context);
    if (result.searchResults?.length > 0 || result.suggestion !== null) {
      return { ...result, searchStartTime };
    }
  }
  return {
    suggestion: null,
    searchResults: [],
    searchStartTime,
  };
}
