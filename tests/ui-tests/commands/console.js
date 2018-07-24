import waitForNavigationAndContext from '../utils/waitForNavigationAndContext';
import config from '../config';
import request from 'request';

module.exports = {
  login: async function(page, config) {
    try {
      await loginViaDex(page, config);
      return await page.waitForSelector('.sf-header');
    } catch (e) {
      console.error(e);
      console.error(document.documentElement.innerHTML);
      throw e;
    }
  },
  getEnvironments: async function(page) {
    try {
      return await page.evaluate(() => {
        const environmentsArraySelector =
          '.sf-dropdown .tn-dropdown__menu .tn-dropdown__item';
        const envs = Array.from(
          document.querySelectorAll(environmentsArraySelector)
        );
        return envs.map(env => env.textContent);
      });
    } catch (e) {
      console.log(document.documentElement.innerHTML);
      throw e;
    }
  },
  getFrame: async page => {
    return await page.frames().find(f => f.name() === 'frame');
  },
  clearData: (token, env) => {
    const req = {
      url: `https://apiserver.${config.domain}/api/v1/namespaces/${env}`,
      method: 'DELETE',
      headers: { Authorization: token },
      // TODO: Analyze problem with UNABLE_TO_VERIFY_LEAF_SIGNATURE
      rejectUnauthorized: false
    };

    return new Promise((resolve, reject) => {
      request(req, (error, response) => {
        if (error) {
          reject(error);
        }

        if (response) {
          console.log('####################\nREMOVE ENV\n####################');
          resolve(response);
        }
      });
    });
  }
};

async function loginViaDex(page, config) {
  const loginButtonSelector = '.dex-btn';
  try {
    console.log(`Trying to log in ${config.login} via dex`);
    await page.reload({ waitUntil: 'networkidle0' })
    await page.type('#login', config.login);
    await page.type('#password', config.password);
    return await page.click(loginButtonSelector);
  } catch (e) {
    console.log(e)
    throw e;
  }
}
