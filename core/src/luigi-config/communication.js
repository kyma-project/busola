import { relogin, getToken } from './navigation/navigation-helpers';
import { NODE_PARAM_PREFIX } from './luigi-config';
import { config } from './config';
import { saveInitParams, getInitParams } from './init-params';

export const communication = {
  customMessagesListeners: {
    'busola.showSystemNamespaces': ({ showSystemNamespaces }) => {
      localStorage.setItem('busola.showSystemNamespaces', showSystemNamespaces);
      if (showSystemNamespaces) {
        Luigi.featureToggles().setFeatureToggle('showSystemNamespaces');
      } else {
        Luigi.featureToggles().unsetFeatureToggle('showSystemNamespaces');
      }
    },
    'busola.showExperimentalViews': ({ showExperimentalViews }) => {
      localStorage.setItem(
        'busola.showExperimentalViews',
        showExperimentalViews
      );
    },
    'busola.updateInitParams': (modifiedParams) => {
      const params = getInitParams();
      delete modifiedParams.id;
      saveInitParams({ ...params, ...modifiedParams });
      location.reload();
    },
    'busola.refreshNavigation': () => {
      Luigi.configChanged('navigation.nodes');
    },
    'busola.setWindowTitle': ({ title }) => {
      const luigiConfig = Luigi.getConfig();
      luigiConfig.settings.header.title = `Kyma - ${title}`;
      Luigi.configChanged('settings.header');
    },
    'busola.silentNavigate': ({ newParams }) => {
      const { search: paramsString, pathname } = new URL(window.location.href);
      const currentParams = convertToObject(paramsString);

      // remove params explicitly marked for removal
      Object.keys(newParams).forEach((key) => {
        if (newParams[key] === undefined) {
          delete currentParams[key];
          delete newParams[key];
        }
      });

      const newParamsString = convertToURLsearch({
        ...currentParams,
        ...newParams,
      });

      window.history.replaceState(
        null,
        window.document.title,
        pathname + newParamsString
      );
    },
  },
};

const convertToURLsearch = (params) => {
  const a = Object.keys(params).map(
    (k) => NODE_PARAM_PREFIX + k + '=' + params[k]
  );
  return '?' + a.join('&');
};

const convertToObject = (paramsString) => {
  let result = {};
  paramsString
    .replace('?', '')
    .split('&')
    .forEach((p) => {
      const [key, val] = p.replace(NODE_PARAM_PREFIX, '').split('=');
      if (key) result[key] = val;
    });
  return result;
};
