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
import { clearAuthData, getAuthData } from './../auth-storage';
import { groups } from '../auth';
import {
  getActiveCluster,
  getClusters,
  getActiveClusterName,
  setCluster,
} from '../clusters';
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
  console.log('restore bc addClusterNodes');
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
          ? `/cluster/${clusterName}`
          : `/set-cluster/${clusterName}`,
    })
  );

  const optionsForCurrentCluster = isClusterSelected
    ? {
        contextSwitcher: {
          defaultLabel: 'Select Namespace ...',
          parentNodePath: `/cluster/${activeClusterName}/namespaces`, // absolute path
          lazyloadOptions: true, // load options on click instead on page load
          options: getNamespaces,
        },
        profile: {
          items: [
            {
              icon: 'settings',
              label: 'Preferences',
              link: `/cluster/${activeClusterName}/preferences`,
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
    setInitValues(res.backendModules, res.selfSubjectRules || []);
    const params = getActiveCluster();
    const activeClusterName = params.cluster.name;

    const { disabledNavigationNodes = '', systemNamespaces = '' } =
      params?.config || {};
    const { bebEnabled = false } = params?.features || {};

    const nodes = [
      {
        pathSegment: 'cluster',
        hideFromNav: true,
        onNodeActivation: () =>
          Luigi.navigation().navigate(`/cluster/${activeClusterName}`),
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
          showSystemNamespaces: shouldShowSystemNamespaces(),
          cluster: params.cluster,
        },
      },
    ];
    return [...nodes, ...createClusterManagementNodes()];
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
    return createClusterManagementNodes();
  }
}

async function getNamespaces() {
  const { systemNamespaces } = getActiveCluster().config;
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
  if (shouldShowSystemNamespaces()) {
    namespaces = namespaces.filter((ns) => !systemNamespaces.includes(ns.name));
  }
  return createNamespacesList(namespaces);
}

function getChildrenNodesForNamespace(apiGroups) {
  const { disabledNavigationNodes } = getActiveCluster().config;
  const staticNodes = getStaticChildrenNodesForNamespace(apiGroups);

  hideDisabledNodes(disabledNavigationNodes, staticNodes, true);
  return staticNodes;
}
