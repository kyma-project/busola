import Dexie from 'dexie';

export const db = new Dexie('busola.cache');

window.db = db;

// db.version(1).stores({
//   paths: '[cluster+path], cluster, path, items',
// });
