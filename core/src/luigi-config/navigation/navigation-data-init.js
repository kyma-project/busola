import { fetchBusolaInitData, fetchNamespaces } from './queries';
import { config } from '../config';
import {
  coreUIViewGroupName,
  getStaticChildrenNodesForNamespace,
  getStaticRootNodes,
} from './static-navigation-model';
import navigationPermissionChecker, {
  setInitValues,
  crds,
} from './permissions';

import { hideDisabledNodes, createNamespacesList } from './navigation-helpers';
import { clearAuthData, getAuthData } from './../auth/auth-storage';
import { groups } from '../auth/auth';
import {
  getActiveCluster,
  getClusters,
  getActiveClusterName,
  setCluster,
  deleteActiveCluster,
  saveActiveClusterName,
} from '../cluster-management';
import { shouldShowSystemNamespaces } from './../utils/system-namespaces-toggle';
import { tryRestorePreviousLocation } from './previous-location';

export async function addClusterNodes() {
  const config = Luigi.getConfig();
  const nodes = await getNavigationData(getAuthData());
  Luigi.setConfig({
    ...config,
    navigation: {
      ...config.navigation,
      nodes,
    },
  });
  tryRestorePreviousLocation();
}

export async function reloadNavigation() {
  const navigation = await createNavigation();
  Luigi.setConfig({ ...Luigi.getConfig(), navigation });
}

function createClusterManagementNodes() {
  const activeClusterName = getActiveClusterName();

  const clusterManagementNode = {
    pathSegment: 'clusters',
    hideFromNav: true,
    hideSideNav: true,
    viewUrl: config.coreUIModuleUrl + '/clusters',
    viewGroup: coreUIViewGroupName,
    children: [
      {
        hideSideNav: true,
        pathSegment: 'add',
        navigationContext: 'clusters',
        viewUrl: config.coreUIModuleUrl + '/clusters/add',
      },
      {
        hideSideNav: true,
        pathSegment: 'remove',
        async onNodeActivation() {
          await deleteActiveCluster();
          return false;
        },
      },
    ],
    context: {
      clusters: getClusters(),
      activeClusterName: getActiveClusterName(),
    },
  };
  const clusters = getClusters();

  const notActiveCluster = (name) => name !== activeClusterName;

  const clusterNodes = Object.keys(clusters)
    .filter(notActiveCluster)
    .map((clusterName) => ({
      pathSegment: encodeURIComponent(clusterName),
      hideFromNav: true,
      onNodeActivation: async () => {
        await setCluster(clusterName);
        return false;
      },
    }));

  const clusterNode = {
    pathSegment: 'set-cluster',
    hideFromNav: true,
    children: clusterNodes,
  };
  return [clusterManagementNode, clusterNode];
}

export async function createNavigation() {
  const params = getActiveCluster();
  const clusters = getClusters();
  const activeClusterName = getActiveClusterName();
  const isClusterSelected = !!params;

  const clusterNodes = Object.entries(clusters).map(
    ([clusterName, { cluster }]) => ({
      title: clusterName,
      subTitle: cluster.server,
      link:
        activeClusterName === clusterName
          ? `/cluster/${encodeURIComponent(clusterName)}`
          : `/set-cluster/${encodeURIComponent(clusterName)}`,
    })
  );

  const optionsForCurrentCluster = isClusterSelected
    ? {
        contextSwitcher: {
          defaultLabel: 'Select Namespace ...',
          parentNodePath: `/cluster/${encodeURIComponent(
            activeClusterName
          )}/namespaces`, // absolute path
          lazyloadOptions: true, // load options on click instead on page load
          options: getNamespaces,
        },
<<<<<<< HEAD
        (err) => {
          if (err.statusCode === 403) {
            clearAuthData();
            window.location = `/nopermissions.html?error=${err.originalMessage}`;
          } else {
            let errorNotification = 'Could not load initial configuration';
            if (err.statusCode && err.message)
              errorNotification += `: ${err.message} (${err.statusCode}${err.originalMessage && err.message !== err.originalMessage
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
        const {
          disabledNavigationNodes = '',
          systemNamespaces = '',
          modules = {},
        } = params?.config || {};
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
=======
        profile: {
          items: [
            {
              icon: 'settings',
              label: 'Preferences',
              link: `/cluster/${encodeURIComponent(
                activeClusterName
              )}/preferences`,
            },
            {
              icon: 'log',
              label: 'Remove current cluster config',
              link: `/clusters/remove`,
>>>>>>> main
            },
          ],
        },
      }
    : {};

  return {
    preloadViewGroups: false,
    nodeAccessibilityResolver: navigationPermissionChecker,
    appSwitcher: {
      showMainAppEntry: false,
      items: [
        ...clusterNodes,
        {
          title: 'Add Cluster',
          link: '/clusters/add',
        },
        {
          title: 'Clusters Overview',
          link: '/clusters',
        },
      ],
    },
    ...optionsForCurrentCluster,
    nodes:
      isClusterSelected && getAuthData()
        ? await getNavigationData(getAuthData())
        : createClusterManagementNodes(),
  };
}

export async function getNavigationData(authData) {
  try {
    const res = await fetchBusolaInitData(authData);
    setInitValues(res.crds, res.selfSubjectRules || []);
    const params = getActiveCluster();
    const activeClusterName = params.cluster.name;

    const {
      disabledNavigationNodes = '',
      systemNamespaces = '',
      modules = {},
    } = params?.config || {};
    const { bebEnabled = false } = params?.features || {};

    const nodes = [
      {
        pathSegment: 'cluster',
        hideFromNav: true,
        onNodeActivation: () =>
          Luigi.navigation().navigate(
            `/cluster/${encodeURIComponent(activeClusterName)}`
          ),
        children: [
          {
            pathSegment: encodeURIComponent(activeClusterName),
            children: function () {
              const staticNodes = getStaticRootNodes(
                getChildrenNodesForNamespace,
                res.apiGroups,
                modules
              );
              hideDisabledNodes(disabledNavigationNodes, staticNodes, false);
              return staticNodes;
            },
          },
        ],
        context: {
          authData,
          groups,
          crds,
          bebEnabled,
          systemNamespaces,
          showSystemNamespaces: shouldShowSystemNamespaces(),
          cluster: params.cluster,
        },
      },
    ];
    return [...nodes, ...createClusterManagementNodes()];
  } catch (err) {
    saveActiveClusterName(null);
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
    return createClusterManagementNodes();
  }
}

async function getNamespaces() {
<<<<<<< HEAD
  const { systemNamespaces } = getInitParams().config;
=======
  const { systemNamespaces } = getActiveCluster()?.config || {};
>>>>>>> main
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
  if (!shouldShowSystemNamespaces()) {
    namespaces = namespaces.filter((ns) => !systemNamespaces.includes(ns.name));
  }
  return createNamespacesList(namespaces);
}

function getChildrenNodesForNamespace(apiGroups) {
<<<<<<< HEAD
  const { disabledNavigationNodes, modules } = getInitParams().config;
=======
  const { disabledNavigationNodes, modules } = getActiveCluster()?.config || {};
>>>>>>> main
  const staticNodes = getStaticChildrenNodesForNamespace(apiGroups, modules);

  hideDisabledNodes(disabledNavigationNodes, staticNodes, true);
  return staticNodes;
}
