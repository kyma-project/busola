import { NODE_PARAM_PREFIX } from './luigi-config';
import {
  saveClusterParams,
  deleteCluster,
  saveActiveClusterName,
  getActiveClusterName,
  setCluster,
} from './cluster-management';
import { clearAuthData } from './auth/auth-storage';
import { reloadNavigation } from './navigation/navigation-data-init';
import { reloadAuth } from './auth/auth';
import { setShowHiddenNamespaces } from './utils/hidden-namespaces-toggle';

export const communication = {
  customMessagesListeners: {
    'busola.showHiddenNamespaces': ({ showHiddenNamespaces }) => {
      setShowHiddenNamespaces(showHiddenNamespaces);
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
    'busola.reload': () => location.reload(),
    'busola.addCluster': async ({ params }) => {
      saveClusterParams(params);
      setCluster(params.currentContext.cluster.name);
    },
    'busola.deleteCluster': async ({ clusterName }) => {
      deleteCluster(clusterName);

      const activeClusterName = getActiveClusterName();
      if (activeClusterName === clusterName) {
        reloadAuth();
        clearAuthData();
        saveActiveClusterName(null);
      }
      await reloadNavigation();
    },
    'busola.setCluster': ({ clusterName }) => {
      setCluster(clusterName);
    },
    'busola.showMessage': ({ message, title, type }) => {
      Luigi.customMessages().sendToAll({
        id: 'busola.showMessage',
        message,
        title,
        type,
      });
    },
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
