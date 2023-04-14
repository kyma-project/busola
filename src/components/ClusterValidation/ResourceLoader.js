async function fetchResources(fetch, base, path, kind) {
  const response = await fetch(`${base}/namespaces/jv/${path}`);
  const data = await response.json();
  const resources = {
    kind,
    items: data.items,
  };
  // nextTasks: pagination
  return {
    resources,
  };
}

async function fetchResourceList(fetch, groupVersion) {
  const base = `/apis/${groupVersion}`;
  const response = await fetch(base);
  const data = await response.json();
  const nextTasks = data.resources
    .filter(resource => resource.verbs.includes('list') && resource.namespaced)
    .map(resource => () =>
      fetchResources(fetch, base, resource.name, resource.kind),
    );

  return {
    nextTasks,
  };
}

async function fetchGroups(fetch) {
  const response = await fetch(`/apis`);
  const data = await response.json();
  const nextTasks = data.groups.map(group => () =>
    fetchResourceList(fetch, group.preferredVersion.groupVersion),
  );
  return {
    nextTasks,
  };
}

async function fetchApiV1(fetch) {
  const base = `/api/v1`;
  const response = await fetch(base);
  const data = await response.json();
  const nextTasks = data.resources
    .filter(resource => resource.verbs.includes('list') && resource.namespaced)
    .map(resource => () =>
      fetchResources(fetch, base, resource.name, resource.kind),
    );

  return {
    nextTasks,
  };
}

export async function* loadResources(fetch) {
  const queue = [() => fetchGroups(fetch), () => fetchApiV1(fetch)];
  const errors = [];

  while (queue.length > 0) {
    const task = queue.shift();
    try {
      const result = await task();
      if (result.nextTasks) queue.push(...result.nextTasks);
      if (result.resources) yield result.resources;
    } catch (error) {
      errors.push(error);
    }
  }
  console.log('loading errors', errors);
}
