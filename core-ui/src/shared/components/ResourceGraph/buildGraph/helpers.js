import _ from 'lodash';

export function wrap(str) {
  return _.chunk(str.split(''), 15)
    .map(s => s.join(''))
    .join('\n');
}

export function makeNode(resource) {
  const { kind, metadata } = resource;
  const { name, uid } = metadata;
  // first is for rendering engine, second goes into actual DOM element
  return `"${uid}" [id="${uid}" class="${kind.toLowerCase()}" margin="0.2,0.2" label="${kind}\n${wrap(
    name,
  )}"][shape=box]`;
}

// cluster is a subgraph - the id needs to be prefixed with 'cluster'
export function makeCluster(resource, content) {
  const { kind } = resource;
  const { uid, name } = resource.metadata;
  return `subgraph "cluster_${uid}" {
    id="${uid}"
    class="${kind.toLowerCase()}"
    label="Deployment ${name}";
      ${content}
    }`;
}

// nodes in the same rank should be on the same y position
// {rank=same; "id1"; "id2"...}
export function makeRank(resources) {
  return `{rank=same; ${resources
    .map(resource => `"${resource.metadata.uid}";`)
    .join(' ')}}`;
}

export function match(resourceA, resourceB, config) {
  const kindA = resourceA.kind;
  const kindB = resourceB.kind;

  let matcher = null;
  if (config[kindA]?.matchers?.[kindB]) {
    matcher = config[kindA].matchers[kindB];
  } else if (config[kindB]?.matchers?.[kindA]) {
    matcher = config[kindB].matchers[kindA];
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

export function findRelations(originalResourceKind, config) {
  // explicitly defined relations
  const relations = [...(config[originalResourceKind].relations || [])];

  // implicitly defined relations - infer them from `matchers`
  const matchers = config[originalResourceKind].matchers || {};
  for (const matchKind of Object.keys(matchers)) {
    if (!relations.find(({ kind }) => kind === matchKind)) {
      relations.push({ kind: matchKind });
    }
  }

  // find `matchers` defined elsewhere
  for (const otherKind in config) {
    if (otherKind === originalResourceKind) continue;

    for (const otherMatchKind in config[otherKind].matchers || {}) {
      if (otherMatchKind === originalResourceKind) {
        if (!relations.find(({ kind }) => kind === otherKind)) {
          relations.push({ kind: otherKind });
        }
      }
    }
  }

  return relations;
}
