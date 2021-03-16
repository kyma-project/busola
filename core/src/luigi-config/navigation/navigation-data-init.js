import { fetchBusolaInitData, fetchNamespaces } from './queries';
import { config } from '../config';
import {
  getStaticChildrenNodesForNamespace,
  getStaticRootNodes,
} from './static-navigation-model';
import navigationPermissionChecker, {
  setInitValues,
  backendModules,
} from './permissions';

import {
  hideDisabledNodes,
  createNamespacesList,
  clearToken,
  getToken,
} from './navigation-helpers';
import { groups } from '../auth';
import { getInitParams } from '../init-params';

export let resolveNavigationNodes;
export let navigation = {
  viewGroupSettings: {
    _core_ui_: {
      preloadUrl: config.coreUIModuleUrl + '/preload',
    },
  },
  nodeAccessibilityResolver: navigationPermissionChecker,
  contextSwitcher: {
    defaultLabel: 'Select Namespace ...',
    parentNodePath: '/home/namespaces', // absolute path
    lazyloadOptions: true, // load options on click instead on page load
    options: getNamespaces,
  },
  profile: {
    logout: {
      label: 'Logout',
    },
    items: [
      {
        icon: 'settings',
        label: 'Preferences',
        link: '/home/preferences',
      },
      {
        icon: 'download',
        label: 'Get Kubeconfig',
        link: '/home/download-kubeconfig',
      },
    ],
  },
  nodes: new Promise((res) => {
    resolveNavigationNodes = res;
  }),
};

export function getNavigationData(token) {
  return new Promise(function (resolve, reject) {
    fetchBusolaInitData(token)
      .then(
        (res) => setInitValues(res.backendModules, res.selfSubjectRules || []),
        (err) => {
          if (err === 'access denied') {
            clearToken();
            window.location.pathname = '/nopermissions.html';
          } else {
            alert('Config init error, see console for more details');
            console.warn(err);
          }
        }
      )
      // 'Finally' not supported by IE and FIREFOX (if 'finally' is needed, update your .babelrc)
      .then(() => {
        const {
          k8sApiUrl,
          bebEnabled,
          systemNamespaces,
          disabledNavigationNodes,
        } = getInitParams();
        const nodes = [
          {
            pathSegment: 'home',
            hideFromNav: true,
            context: {
              idToken: token,
              groups,
              backendModules,
              bebEnabled,
              systemNamespaces,
              showSystemNamespaces:
                localStorage.getItem('busola.showSystemNamespaces') === 'true',
              k8sApiUrl,
            },
            children: function () {
              const staticNodes = getStaticRootNodes(
                getChildrenNodesForNamespace
              );
              hideDisabledNodes(disabledNavigationNodes, staticNodes, false);
              return staticNodes;
            },
          },
        ];

        resolve(nodes);
      })
      .catch((err) => {
        console.error('Config Init Error', err);
        reject(err);
      });
  });
}

async function getNamespaces() {
  const { systemNamespaces } = getInitParams();
  let namespaces;
  try {
    namespaces = await fetchNamespaces(getToken());
  } catch (e) {
    console.error('Error while fetching namespaces', e);
    return [];
  }
  if (localStorage.getItem('busola.showSystemNamespaces') !== 'true') {
    namespaces = namespaces.filter((ns) => !systemNamespaces.includes(ns.name));
  }
  return createNamespacesList(namespaces);
}

function getChildrenNodesForNamespace() {
  const { disabledNavigationNodes } = getInitParams();
  const staticNodes = getStaticChildrenNodesForNamespace();

  hideDisabledNodes(disabledNavigationNodes, staticNodes, true);
  return staticNodes;
}
