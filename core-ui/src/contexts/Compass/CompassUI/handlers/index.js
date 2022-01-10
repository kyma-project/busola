import { nonResourceHandler } from './nonResourceHandler';
import { clusterResourceHandler } from './clusterResourceHandler';
import { namespacedResourceHandler } from './namespacedResourceHandler';
import { nodesHandler } from './nodesHandler';
import { logsHandler } from './logsHandler';

const handlers = [
  nonResourceHandler,
  clusterResourceHandler,
  namespacedResourceHandler,
  nodesHandler,
  logsHandler,
];

export function getSuggestions(context) {
  if (!context.search) {
    return [];
  }
  return handlers
    .flatMap(handler => handler.getSuggestions(context))
    .filter(Boolean);
}

export async function fetchResources(context) {
  await Promise.all(handlers.map(handler => handler.fetchResources(context)));
}

export function createResults(context) {
  if (!context.search) {
    return [];
  }
  return handlers
    .flatMap(handler => handler.createResults(context))
    .filter(Boolean);
}
