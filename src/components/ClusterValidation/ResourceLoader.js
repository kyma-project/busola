async function fetchResources(fetch, base, path, kind) {
  const response = await fetch(`${base}/namespaces/jv/${path}`);
  const data = await response.json();
  const resources = {
    kind,
    items: data.items,
  };
  // nextTasks: pagination (TODO)
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

// Custom Resources
async function fetchCustomResources(fetch) {
  const response = await fetch(`/apis`);
  const data = await response.json();
  const nextTasks = data.groups.map(group => () =>
    fetchResourceList(fetch, group.preferredVersion.groupVersion),
  );
  return {
    nextTasks,
  };
}

// Core Resources
async function fetchCoreResources(fetch) {
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

async function fetchAPIGroup(fetch, endpoint) {
  const response = await fetch(endpoint);
  const data = await response.json();
  if (data.kind === 'APIGroupList') {
    return {
      items: data.groups.map(group => ({
        baseUrl: endpoint,
        name: group.preferredVersion.groupVersion,
        type: 'APIGroup',
      })),
    };
  } else if (data.kind === 'APIResourceList') {
    return {
      items: data.resources.map(resource => ({
        baseUrl: endpoint,
        name: resource.name,
        type: 'APIResource',
        kind: resource.kind,
        namespaced: resource.namespaced,
      })),
    };
  } else {
    throw new Error(
      'expected either APIGroupList or APIResourceList from an APIGroup',
    );
  }
}

async function fetchAnything(fetch, obj, options) {
  if (obj.type === 'APIGroup') {
    await fetchAPIGroup(fetch, `${obj.base}/${obj.endpoint}`);
  } else if (obj.type === 'APIResource') {
  } else {
    throw new Error('expected type: APIGroup or APIResource');
  }
}

export async function* loadResources(fetch) {
  const queue = [
    () => fetchCustomResources(fetch),
    () => fetchCoreResources(fetch),
  ];
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

/**
 * A helper class to add identifiable running promises to an array.
 * Control of when to remove the promise from the array is given to the consumer of the class.
 */
class RunningPromises {
  constructor() {
    this.running = [];
    this.length = 0;
  }

  findFreeSlot() {
    for (let i = 0; i <= this.running.length; i++) {
      if (!this.running[i]) return i;
    }
  }

  insert(promise) {
    const id = this.findFreeSlot();
    this.running[id] = promise
      .then(result => ({ id, result }))
      .catch(error => ({ id, error }));
    this.length++;
  }

  remove(id) {
    delete this.running[id];
    this.length--;
  }

  [Symbol.iterator]() {
    return this.running[Symbol.iterator]();
  }
}

async function* loadQueue(queue, max = 3) {
  const running = new RunningPromises();
  const errors = [];
  while (queue.length > 0 || running.length > 0) {
    while (queue.length > 0 && running.length < max) {
      const task = queue.shift();
      const promise = task(queue);
      running.insert(promise);
    }
    try {
      console.log(running.length);
      const { id, result } = await Promise.race(running);
      running.remove(id);
      if (result) yield result;
    } catch ({ id, error }) {
      errors.push(error);
      running.remove(id);
    }
  }
}

export async function* loadResourcesConcurrently(fetch, max = 3) {
  const queue = [
    () => fetchCustomResources(fetch),
    () => fetchCoreResources(fetch),
  ];
  const running = new RunningPromises();
  const errors = [];

  while (queue.length > 0 || running.length > 0) {
    while (queue.length > 0 && running.length < max) {
      const task = queue.shift();
      const promise = task();
      running.insert(promise);
    }
    try {
      console.log(running.length);
      const { id, result } = await Promise.race(running);
      running.remove(id);
      if (result.nextTasks) queue.push(...result.nextTasks);
      if (result.resources) yield result.resources;
    } catch ({ id, error }) {
      errors.push(error);
      running.remove(id);
    }
  }
  console.log('loading errors', errors);
}
