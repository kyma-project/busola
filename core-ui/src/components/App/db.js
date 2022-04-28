import Dexie from 'dexie';

export const db = new Dexie('busola.cache');
db.version(1).stores({
  paths: '[cluster+path], cluster, path, items',
});
