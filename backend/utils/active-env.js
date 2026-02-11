import * as fs from 'node:fs';

export function fillActiveEnvForFrontend(env) {
  try {
    const activeEnv = `ENVIRONMENT=${env}\n`;
    fs.writeFile('core-ui/active.env', activeEnv, (err) => {
      if (err) {
        console.warn(`Couldn't write env:${env} to active.env file`, err);
      }
    });
  } catch (e) {
    console.warn(`Couldn't write env:${env} to active.env file`, e);
    return;
  }
  console.log('Set active.env file for frontend');
}
