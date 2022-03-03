import _ from 'lodash';

export function wrap(str) {
  return _.chunk(str.split(''), 15)
    .map(s => s.join(''))
    .join('\n');
}

// lhead overrides actual arrow end
export function makeEdge(id1, id2, { lhead } = {}) {
  const lHeadStr = lhead ? `[lhead="${lhead}"]` : '';
  const edge = `"${id1}" -> "${id2}"`;
  return `${edge} ${lHeadStr}`;
}

export function makeNode(resource) {
  const { kind, metadata } = resource;
  const { name, uid } = metadata;
  return `"${uid}" [label="${kind}\n${wrap(name)}"][shape=box]`;
}

// cluster is a subgraph - the id needs to be prefixed with 'cluster'
export function makeCluster(resource, content) {
  const { uid, name } = resource.metadata;
  return `subgraph "cluster_${uid}" { 
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
