import { fetchBusolaInitData, fetchNamespaces } from './queries';
import { config } from '../config';
import {
  coreUIViewGroupName,
  getStaticChildrenNodesForNamespace,
  getStaticRootNodes,
} from './static-navigation-model';
import navigationPermissionChecker, {
  setInitValues,
  backendModules,
} from './permissions';

import { hideDisabledNodes, createNamespacesList } from './navigation-helpers';
import { clearAuthData, getAuthData, setAuthData } from './../auth-storage';
import { groups, createAuth } from '../auth';
import {
  getInitParams,
  getClusters,
  getCurrentClusterName,
  setCluster,
} from '../clusters';

export async function addClusterNodes() {
  const nodes = await getNavigationData(getAuthData());
  const config = Luigi.getConfig();
  const navigation = {
    ...navigation,
    nodes,
  };
  Luigi.setConfig({ ...config, navigation });
}

export async function reloadNavigation() {
  const navigation = await createNavigation();
  Luigi.setConfig({ ...Luigi.getConfig(), navigation });
}

function createTODONodes() {
  const activeClusterName = getCurrentClusterName();

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
    ],
    context: {
      clusters: getClusters(),
      currentClusterName: getCurrentClusterName(),
    },
  };
  const clusters = getClusters();

  const notActiveCluster = (name) => name !== activeClusterName;

  const clusterNodes = Object.keys(clusters)
    .filter(notActiveCluster)
    .map((clusterName) => ({
      pathSegment: clusterName,
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
  const params = getInitParams();
  const clusters = getClusters();
  const activeClusterName = getCurrentClusterName();
  const isClusterSelected = !!params;

  const clusterNodes = Object.entries(clusters).map(
    ([clusterName, { cluster }]) => ({
      title: clusterName,
      subTitle: cluster.server,
      link:
        activeClusterName === clusterName
          ? `/cluster/${clusterName}`
          : `/set-cluster/${clusterName}`,
    })
  );
  return {
    preloadViewGroups: false,
    nodeAccessibilityResolver: navigationPermissionChecker,
    contextSwitcher: isClusterSelected && {
      defaultLabel: 'Select Namespace ...',
      parentNodePath: '/home/namespaces', // absolute path
      lazyloadOptions: true, // load options on click instead on page load
      options: getNamespaces,
    },
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
    profile: isClusterSelected && {
      items: [
        {
          icon: 'settings',
          label: 'Preferences',
          link: '/home/preferences',
        },
      ],
    },
    nodes:
      isClusterSelected && getAuthData()
        ? await getNavigationData(getAuthData())
        : createTODONodes(),
  };
}

export async function getNavigationData(authData) {
  try {
    const res = await fetchBusolaInitData(authData);
    setInitValues(res.backendModules, res.selfSubjectRules || []);
    const params = getInitParams();
    const activeClusterName = params.cluster.name;

    const { disabledNavigationNodes = '', systemNamespaces = '' } =
      params?.config || {};
    const { bebEnabled = false } = params?.features || {};

    const nodes = [
      {
        pathSegment: 'cluster',
        hideFromNav: true,
        onNodeActivation: () => {
          if (activeClusterName) {
            Luigi.navigation().navigate(`/cluster/${activeClusterName}`);
          } else {
            alert('wtf');
          }
        },
        children: [
          {
            pathSegment: activeClusterName,
            children: function () {
              const staticNodes = getStaticRootNodes(
                getChildrenNodesForNamespace,
                res.apiGroups
              );
              hideDisabledNodes(disabledNavigationNodes, staticNodes, false);
              return staticNodes;
            },
          },
        ],
        context: {
          authData,
          groups,
          backendModules,
          bebEnabled,
          systemNamespaces,
          showSystemNamespaces:
            localStorage.getItem('busola.showSystemNamespaces') === 'true',
          cluster: params.cluster,
        },
      },
    ];
    return [...nodes, ...createTODONodes()];
  } catch (err) {
    alert(err);
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
    return createTODONodes();
  }
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
