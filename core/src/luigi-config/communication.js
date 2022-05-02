import i18next from 'i18next';
import { NODE_PARAM_PREFIX } from './luigi-config';
import {
  saveClusterParams,
  deleteCluster,
  saveActiveClusterName,
  getActiveClusterName,
  setCluster,
} from './cluster-management/cluster-management';
import { clearAuthData } from './auth/auth-storage';
import { reloadNavigation } from './navigation/navigation-data-init';
import { reloadAuth } from './auth/auth';
import { setFeatureToggle } from './utils/feature-toggles';
import { setTheme } from './utils/theme';
import { setSSOAuthData } from './auth/sso';
import { communicationEntry as pageSizeCommunicationEntry } from './settings/pagination';
import { getCorrespondingNamespaceLocation } from './navigation/navigation-helpers';
import { fetchCache } from './fetch-cache';

addCommandPaletteHandler();
addOpenSearchHandler();

window.addEventListener('click', () => {
  Luigi.customMessages().sendToAll({
    id: 'busola.main-frame-click',
  });
});

window.addEventListener('keydown', e => {
  Luigi.customMessages().sendToAll({
    id: 'busola.main-frame-keydown',
    key: e.key,
  });
});

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
    'busola.disableResourceProtection': ({ disableResourceProtection }) => {
      setFeatureToggle('disableResourceProtection', disableResourceProtection);
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
    'busola.addCluster': async ({ params, switchCluster = true }) => {
      await saveClusterParams(params);
      if (switchCluster) {
        await setCluster(params.kubeconfig['current-context']);
      }
    },
    'busola.deleteCluster': async ({ clusterName }) => {
      await deleteCluster(clusterName);

      const activeClusterName = getActiveClusterName();
      if (activeClusterName === clusterName) {
        await reloadAuth();
        clearAuthData();
        saveActiveClusterName(null);
        fetchCache.destroy();
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
    'busola.switchNamespace': ({ namespaceName }) => {
      const alternativeLocation = getCorrespondingNamespaceLocation(
        namespaceName,
      );
      Luigi.navigation()
        .fromContext('cluster')
        .navigate(
          'namespaces/' + (alternativeLocation || namespaceName + '/details'),
        );
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

function addCommandPaletteHandler() {
  window.addEventListener('keydown', e => {
    const { key, metaKey, ctrlKey } = e;
    // for (Edge, Chrome) || (Firefox, Safari)
    const isMac = (navigator.userAgentData?.platform || navigator.platform)
      ?.toLowerCase()
      ?.startsWith('mac');
    const modifierKeyPressed = (isMac && metaKey) || (!isMac && ctrlKey);

    const isMFModalPresent = !!document.querySelector('.lui-modal-mf');

    if (isMFModalPresent) return;

    if (key.toLowerCase() === 'k' && modifierKeyPressed) {
      // [on Firefox] prevent opening the browser search bar via CMD/CTRL+K
      e.preventDefault();
      Luigi.customMessages().sendToAll({ id: 'busola.toggle-command-palette' });
    }
  });
}

function addOpenSearchHandler() {
  window.addEventListener('keydown', e => {
    const { key } = e;

    const isMFModalPresent = !!document.querySelector('.lui-modal-mf');
    if (isMFModalPresent) return;

    if (key === '/') {
      Luigi.customMessages().sendToAll({ id: 'busola.toggle-open-search' });
    }
  });
}
