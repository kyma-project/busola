import i18next from 'i18next';
import { NODE_PARAM_PREFIX } from './luigi-config';
import { communicationEntries as clusterManagementCommunicationEntries } from './cluster-management/cluster-management';
import { reloadNavigation } from './navigation/navigation-data-init';
import { setFeatureToggle } from './utils/feature-toggles';
import { setTheme } from './utils/theme';
import { setSSOAuthData } from './auth/sso';
import { communicationEntry as pageSizeCommunicationEntry } from './settings/pagination';

export const communication = {
  customMessagesListeners: {
    'busola.language': ({ language }) => {
      localStorage.setItem('busola.language', language);
      i18next.changeLanguage(language).then(() => reloadNavigation());
    },
    'busola.theme': ({ name }) => {
      setTheme(name);
      Luigi.customMessages().sendToAll({
        id: 'busola.theme',
        theme: name,
      });
    },
    'busola.showHiddenNamespaces': ({ showHiddenNamespaces }) => {
      setFeatureToggle('showHiddenNamespaces', showHiddenNamespaces);
    },
    'busola.dontConfirmDelete': ({ value }) => {
      setFeatureToggle('dontConfirmDelete', value);
    },
    'busola.refreshNavigation': () => {
      Luigi.configChanged('navigation.nodes');
    },
    'busola.setWindowTitle': ({ title }) => {
      Luigi.ux().setDocumentTitle(title);
    },
    'busola.silentNavigate': ({ newParams }) => {
      const { search: paramsString, pathname } = new URL(window.location.href);
      const currentParams = convertToObject(paramsString);

      // remove params explicitly marked for removal
      Object.keys(newParams).forEach(key => {
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
        pathname + newParamsString,
      );
    },
    'busola.reload': ({ reason }) => {
      if (reason === 'sso-expiration') {
        setSSOAuthData(null);
      }
      location.reload();
    },
    'busola.showMessage': ({ message, title, type }) => {
      Luigi.customMessages().sendToAll({
        id: 'busola.showMessage',
        message,
        title,
        type,
      });
    },
    'busola.pathExists': async ({ path, pathId }) => {
      const exists = await Luigi.navigation().pathExists(path);
      Luigi.customMessages().sendToAll({
        id: 'busola.pathExists.answer',
        exists,
        pathId,
      });
    },
    ...pageSizeCommunicationEntry,
    ...clusterManagementCommunicationEntries,
  },
};

export const convertToURLsearch = params => {
  const a = Object.keys(params).map(
    k => NODE_PARAM_PREFIX + k + '=' + params[k],
  );
  return '?' + a.join('&');
};

const convertToObject = paramsString => {
  let result = {};
  paramsString
    .replace('?', '')
    .split('&')
    .forEach(p => {
      const [key, val] = p.replace(NODE_PARAM_PREFIX, '').split('=');
      if (key) result[key] = val;
    });
  return result;
};
