import { nonResourceHandler } from './nonResourceHandler';
import { clusterwideResourceHandler } from './clusterwideResourceHandler';
import { namespacedResourceHandler } from './namespacedResourceHandler';
import { nodesHandler } from './nodesHandler';

export const handlers = [
  nonResourceHandler,
  clusterwideResourceHandler,
  namespacedResourceHandler,
  nodesHandler,
];
