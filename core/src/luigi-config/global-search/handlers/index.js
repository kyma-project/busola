import { nonResourceHandler } from './nonResourceHandler';
import {
  clusterwideResourceHandler,
  namespacedResourceHandler,
} from './resourceHandlers';

export const handlers = [
  nonResourceHandler,
  clusterwideResourceHandler,
  namespacedResourceHandler,
];
