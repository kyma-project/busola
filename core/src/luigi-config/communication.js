import { NODE_PARAM_PREFIX } from './luigi-config';
import {
  saveClusterParams,
  deleteCluster,
  saveActiveClusterName,
  getActiveClusterName,
  getActiveCluster,
  setCluster,
} from './clusters';
import { clearAuthData } from './auth-storage';
import { reloadNavigation } from './navigation/navigation-data-init';
import { reloadAuth } from './auth';
import { setShowSystemNamespaces } from './utils/system-namespaces-toggle';

export const communication = {
  customMessagesListeners: {
    'busola.showSystemNamespaces': ({ showSystemNamespaces }) => {
      setShowSystemNamespaces(showSystemNamespaces);
    },
    'busola.updateBebEnabled': ({ bebEnabled }) => {
      const params = getActiveCluster();
      saveClusterParams({
        ...params,
        features: {
          ...params.features,
          bebEnabled,
        },
      });
      updateClusterContext({ bebEnabled });
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
    'busola.reload': () => location.reload(),
    'busola.addCluster': async ({ params }) => {
      saveClusterParams(params);
      setCluster(params.cluster.name);
    },
    'busola.deleteCluster': async ({ clusterName }) => {
      deleteCluster(clusterName);

      const activeClusterName = getActiveClusterName();
      if (activeClusterName === clusterName) {
        await reloadAuth();
        clearAuthData();
        saveActiveClusterName(null);
      }
      await reloadNavigation();
    },
    'busola.setCluster': async ({ clusterName }) => {
      setCluster(clusterName);
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

const updateClusterContext = (newContext) => {
  const nodes = Luigi.getConfig().navigation.nodes;
  const clusterNode = nodes.find((n) => n.pathSegment === 'cluster');
  clusterNode.context = { ...clusterNode.context, ...newContext };
  Luigi.configChanged('navigation.nodes');
};
