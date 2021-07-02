import {
  fetchPermissions,
  fetchBusolaInitData,
  fetchNamespaces,
} from './queries';
import { config } from '../config';
import {
  coreUIViewGroupName,
  getStaticChildrenNodesForNamespace,
  getStaticRootNodes,
} from './static-navigation-model';
import { navigationPermissionChecker, hasPermissionsFor } from './permissions';
import { resolveNonLazyFeatures } from './../features';

import {
  hideDisabledNodes,
  createNamespacesList,
  addExternalNodes,
} from './navigation-helpers';
import { clearAuthData, getAuthData } from './../auth/auth-storage';
import { groups } from '../auth/auth';
import {
  getActiveCluster,
  getClusters,
  getActiveClusterName,
  setCluster,
  deleteActiveCluster,
  saveActiveClusterName,
  getCurrentContextNamespace,
} from '../cluster-management';
import { shouldShowHiddenNamespaces } from './../utils/hidden-namespaces-toggle';
import { saveLocation } from './previous-location';
import { NODE_PARAM_PREFIX } from '../luigi-config';

let selfSubjectRulesReview;
let crds = [];

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
}

export async function reloadNavigation() {
  const navigation = await createNavigation();
  Luigi.setConfig({ ...Luigi.getConfig(), navigation });
}

async function createClusterManagementNodes() {
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
      clusters: await getClusters(),
      activeClusterName: getActiveClusterName(),
    },
  };
  const clusters = await getClusters();

  const notActiveCluster = name => name !== activeClusterName;

  const clusterNodes = Object.keys(clusters)
    .filter(notActiveCluster)
    .map(clusterName => ({
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

  const noPermissionsNode = {
    pathSegment: 'no-permissions',
    hideFromNav: true,
    hideSideNav: true,
    viewUrl: config.coreUIModuleUrl + '/no-permissions',
  };

  return [clusterManagementNode, clusterNode, noPermissionsNode];
}

export async function createNavigation() {
  const params = await getActiveCluster();
  const clusters = await getClusters();
  const activeClusterName = getActiveClusterName();
  const isClusterSelected = !!params;
  const clusterNodes = Object.entries(clusters).map(
    ([clusterName, { currentContext }]) => ({
      title: clusterName,
      subTitle: currentContext.cluster.server,
      link:
        activeClusterName === clusterName
          ? `/cluster/${encodeURIComponent(clusterName)}`
          : `/set-cluster/${encodeURIComponent(clusterName)}`,
    }),
  );

  const optionsForCurrentCluster = isClusterSelected
    ? {
        contextSwitcher: {
          defaultLabel: 'Select Namespace ...',
          parentNodePath: `/cluster/${encodeURIComponent(
            activeClusterName,
          )}/namespaces`, // absolute path
          lazyloadOptions: true, // load options on click instead on page load
          options: getNamespaces,
        },
        profile: {
          items: [
            {
              icon: 'settings',
              label: 'Preferences',
              link: `/cluster/${encodeURIComponent(
                activeClusterName,
              )}/preferences`,
            },
            {
              icon: 'log',
              label: 'Remove current Cluster Config',
              link: `/clusters/remove`,
            },
            {
              icon: 'download',
              label: 'Download current Cluster Kubeconfig',
              link: `/cluster/${encodeURIComponent(
                activeClusterName,
              )}/download-kubeconfig`,
            },
          ],
        },
      }
    : {};

  const isNodeEnabled = node => {
    // disable node only if explicitly set to "false"
    if (node.context?.isEnabled === undefined) {
      return true;
    } else {
      return node.context.isEnabled;
    }
  };

  return {
    preloadViewGroups: false,
    nodeAccessibilityResolver: node =>
      isNodeEnabled(node) &&
      navigationPermissionChecker(node, selfSubjectRulesReview),
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
        : await createClusterManagementNodes(),
  };
}

async function fetchNavigationData(authData, permissionSet) {
  if (
    hasPermissionsFor(
      'apiextensions.k8s.io',
      'customresourcedefinitions',
      permissionSet,
    )
  ) {
    const res = await fetchBusolaInitData(authData);
    crds = res.crds.map(crd => crd.name);
    return { ...res, crds };
  } else {
    // as we may not be able to make CRDs call, apiGroups call shall suffice
    const apiGroups = [...new Set(permissionSet.flatMap(p => p.apiGroups))];
    crds = apiGroups;
    return { crds: apiGroups, apiPaths: null };
  }
}

export async function getNavigationData(authData) {
  const { kubeconfig } = await getActiveCluster();
  const preselectedNamespace = getCurrentContextNamespace(kubeconfig);
  try {
    // we assume all users can make SelfSubjectRulesReview request
    const permissionSet = await fetchPermissions(
      authData,
      preselectedNamespace,
    );
    selfSubjectRulesReview = permissionSet;

    const { crds, apiPaths } = await fetchNavigationData(
      authData,
      permissionSet,
    );
    const params = await getActiveCluster();
    const activeClusterName = params.currentContext.cluster.name;

    const { navigation = {}, hiddenNamespaces = [], features = {} } =
      params?.config || {};

    await resolveNonLazyFeatures(features, {
      authData,
      crds,
    });

    console.log(features);

    const nodes = [
      {
        pathSegment: 'cluster',
        hideFromNav: true,
        onNodeActivation: () =>
          Luigi.navigation().navigate(
            `/cluster/${encodeURIComponent(activeClusterName)}`,
          ),
        children: [
          {
            navigationContext: 'cluster',
            pathSegment: encodeURIComponent(activeClusterName),
            children: async function() {
              const staticNodes = getStaticRootNodes(
                getChildrenNodesForNamespace,
                apiPaths,
                permissionSet,
                features,
              );
              const externalNodes = addExternalNodes(navigation.externalNodes);
              const allNodes = [...staticNodes, ...externalNodes];
              hideDisabledNodes(navigation.disabledNodes, allNodes, false);
              return allNodes;
            },
          },
        ],
        context: {
          authData,
          groups,
          crds,
          features,
          hiddenNamespaces,
          showHiddenNamespaces: shouldShowHiddenNamespaces(),
          cluster: params.currentContext.cluster,
          kubeconfig: params.kubeconfig,
        },
      },
    ];
    return [...nodes, ...(await createClusterManagementNodes())];
  } catch (err) {
    saveActiveClusterName(null);
    if (err.statusCode === 403) {
      clearAuthData();
      saveLocation(
        `/no-permissions?${NODE_PARAM_PREFIX}error=${err.originalMessage}`,
      );
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
  const { hiddenNamespaces } = (await getActiveCluster()).config;
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
  if (!shouldShowHiddenNamespaces() && hiddenNamespaces) {
    namespaces = namespaces.filter(ns => !hiddenNamespaces.includes(ns.name));
  }
  return createNamespacesList(namespaces);
}

async function getChildrenNodesForNamespace(apiPaths, permissionSet, features) {
  const { navigation = {} } = (await getActiveCluster()).config;
  const staticNodes = getStaticChildrenNodesForNamespace(
    apiPaths,
    permissionSet,
    features,
  );

  hideDisabledNodes(navigation.disabledNodes, staticNodes, true);
  return staticNodes;
}
