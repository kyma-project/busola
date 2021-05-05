import { NODE_PARAM_PREFIX } from './luigi-config';
import {
  saveClusterParams,
  getClusters,
  saveClusters,
  saveCurrentClusterName,
  getCurrentClusterName,
  setCluster,
} from './clusters';
import { clearAuthData } from './auth-storage';
import { reloadNavigation } from './navigation/navigation-data-init';
import { reloadAuth } from './auth';

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
    'busola.updateBebEnabled': ({ bebEnabled }) => {
      // const params = getInitParams();
      // saveInitParams({
      //   ...params,
      //   features: {
      //     ...params.features,
      //     bebEnabled,
      //   },
      // });
      // updateContext({ bebEnabled });
    },
    'busola.updateClusterParams': (clusterParams) => {
      // const params = getInitParams();
      // delete clusterParams.id;
      // saveInitParams({ ...params, cluster: clusterParams });
      // location.reload();
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
      const clusters = getClusters();
      const activeClusterName = getCurrentClusterName();
      if (activeClusterName === clusterName) {
        await reloadAuth();
        clearAuthData();
        saveCurrentClusterName(null);
      }
      delete clusters[clusterName];
      saveClusters(clusters);
      reloadNavigation();
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

const updateContext = async (newContext) => {
  const navigation = await Luigi.getConfigValue('navigation.nodes');
  navigation[0].context = { ...navigation[0].context, ...newContext };
  Luigi.configChanged('navigation.nodes');
};
