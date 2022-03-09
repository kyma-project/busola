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
  return `"${uid}" [id="${uid}" label="${kind}\n${wrap(name)}"][shape=box]`;
}

// cluster is a subgraph - the id needs to be prefixed with 'cluster'
export function makeCluster(resource, content) {
  const { uid, name } = resource.metadata;
  return `subgraph "cluster_${uid}" {
    id="${uid}"
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
