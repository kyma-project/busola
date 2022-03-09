import * as matchers from './matchers';

export function match(resourceA, resourceB) {
  const kindA = resourceA.kind;
  const kindB = resourceB.kind;

  let matcher = null;
  if (matchers[`match${kindA}And${kindB}`]) {
    matcher = matchers[`match${kindA}And${kindB}`];
  } else {
    matcher = matchers[`match${kindB}And${kindA}`];
    // order matters!
    [resourceA, resourceB] = [resourceB, resourceA];
  }

  if (matcher) {
    try {
      return matcher(resourceA, resourceB);
    } catch (e) {
      console.warn(e);
    }
  }
  return false;
}

export function matchBy(singleResource, resources) {
  return resources?.filter(res => match(res, singleResource)) || [];
}
