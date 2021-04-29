import { fetchBusolaInitData, fetchNamespaces } from './queries';
import { config } from '../config';
import {
  coreUIViewGroupName,
  catalogViewGroupName,
  getStaticChildrenNodesForNamespace,
  getStaticRootNodes,
} from './static-navigation-model';
import navigationPermissionChecker, {
  setInitValues,
  crds,
} from './permissions';

import {
  hideDisabledNodes,
  createNamespacesList,
  clearAuthData,
  getAuthData,
} from './navigation-helpers';
import { groups } from '../auth';
import { getInitParams, clearInitParams } from '../init-params';

const customLogoutFn = () => {
  clearInitParams();
  window.location = '/logout.html';
};

export let resolveNavigationNodes;
export let navigation = {
  // viewGroupSettings: {
  //   [coreUIViewGroupName]: {
  //     preloadUrl: config.coreUIModuleUrl + '/preload',
  //   },
  //   [catalogViewGroupName]: {
  //     preloadUrl: config.serviceCatalogModuleUrl + '/preload',
  //   },
  // },
  preloadViewGroups: false,
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
      customLogoutFn,
    },
    items: [
      {
        icon: 'settings',
        label: 'Preferences',
        link: '/home/preferences',
      },
    ],
  },
  nodes: new Promise((res) => {
    resolveNavigationNodes = res;
  }),
};

export function getNavigationData(authData) {
  return new Promise(function (resolve, reject) {
    fetchBusolaInitData(authData)
      .then(
        (res) => {
          setInitValues(res.crds, res.selfSubjectRules || []);
          return res;
        },
        (err) => {
          if (err.statusCode === 403) {
            clearAuthData();
            window.location = `/nopermissions.html?error=${err.originalMessage}`;
          } else {
            let errorNotification = 'Could not load initial configuration';
            if (err.statusCode && err.message)
              errorNotification += `: ${err.message} (${err.statusCode}${
                err.originalMessage && err.message !== err.originalMessage
                  ? ':' + err.originalMessage
                  : ''
              })`;
            Luigi.ux().showAlert({
              text: errorNotification,
              type: 'error',
            });
            console.warn(err);
          }
        }
      )
      // 'Finally' not supported by IE and FIREFOX (if 'finally' is needed, update your .babelrc)
      .then((res) => {
        const params = getInitParams();
        const { disabledNavigationNodes = '', systemNamespaces = '', modules = {} } =
          params?.config || {};
        const { bebEnabled = false } = params?.features || {};
        const nodes = [
          {
            pathSegment: 'home',
            hideFromNav: true,
            context: {
              authData,
              groups,
              crds,
              bebEnabled,
              systemNamespaces,
              modules,
              showSystemNamespaces:
                localStorage.getItem('busola.showSystemNamespaces') === 'true',
              cluster: params?.cluster || '',
            },
            children: function () {
              const staticNodes = getStaticRootNodes(
                getChildrenNodesForNamespace,
                res.apiGroups
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
  const { systemNamespaces } = getInitParams().config;
  let namespaces;
  try {
    namespaces = await fetchNamespaces(getAuthData());
  } catch (e) {
    Luigi.ux().showAlert({
      text: `Cannot fetch namespaces: ${e.message}`,
      type: 'error',
    });
    return [];
  }
  if (localStorage.getItem('busola.showSystemNamespaces') !== 'true') {
    namespaces = namespaces.filter((ns) => !systemNamespaces.includes(ns.name));
  }
  return createNamespacesList(namespaces);
}

function getChildrenNodesForNamespace(apiGroups) {
  const { disabledNavigationNodes } = getInitParams().config;
  const staticNodes = getStaticChildrenNodesForNamespace(apiGroups);

  hideDisabledNodes(disabledNavigationNodes, staticNodes, true);
  return staticNodes;
}
