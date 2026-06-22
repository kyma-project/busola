/* global process */
import * as fs from 'node:fs';

export function fillActiveEnvForFrontend(env) {
  try {
    let activeEnv = `ENVIRONMENT=${env}\n`;
    if (process.env.SSO_LOGIN_BYPASS === 'true') {
      activeEnv += 'SSO_LOGIN_BYPASS=true\n';
    }
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
