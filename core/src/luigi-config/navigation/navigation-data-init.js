import i18next from 'i18next';
import {
  fetchPermissions,
  fetchAvailableApis,
  fetchNamespaces,
  fetchObservabilityHost,
} from './queries';
import { getBusolaClusterParams } from '../busola-cluster-params';
import { config } from '../config';
import {
  coreUIViewGroupName,
  getStaticChildrenNodesForNamespace,
  getStaticRootNodes,
} from './static-navigation-model';
import { navigationPermissionChecker, hasAnyRoleBound } from './permissions';
import { showAlert } from '../utils/showAlert';

import {
  hideDisabledNodes,
  createNamespacesList,
  addExternalNodes,
} from './navigation-helpers';
import { clearAuthData, getAuthData } from '../auth/auth-storage';
import { groups } from '../auth/auth';
import {
  getActiveCluster,
  getClusters,
  getActiveClusterName,
  setCluster,
  deleteActiveCluster,
  saveActiveClusterName,
  getCurrentContextNamespace,
  saveCARequired,
  getCurrentConfig,
} from '../cluster-management/cluster-management';
import { getFeatureToggle } from '../utils/feature-toggles';
import { saveLocation } from './previous-location';
import { NODE_PARAM_PREFIX } from '../luigi-config';
import { loadTargetClusterConfig } from '../utils/target-cluster-config';
import { checkClusterStorageType } from '../cluster-management/clusters-storage';
import { getSSOAuthData } from '../auth/sso';
import { setNavFooterText } from '../nav-footer';
import { AVAILABLE_PAGE_SIZES, getPageSize } from '../settings/pagination';
import { getFeatures, initFeatures } from '../feature-discovery';
import { fetchCache } from '../cache/fetch-cache';

async function createAppSwitcher() {
  const activeClusterName = getActiveClusterName();

  const clusterNodes = Object.entries(await getClusters()).map(
    ([clusterName, { currentContext }]) => ({
      title: clusterName,
      subTitle: currentContext.cluster.server,
      link:
        activeClusterName === clusterName
          ? `/cluster/${encodeURIComponent(clusterName)}`
          : `/set-cluster/${encodeURIComponent(clusterName)}`,
    }),
  );

  const clusterOverviewNode = {
    title: i18next.t('clusters.overview.title-all-clusters'),
    link: '/clusters',
    testId: 'clusters-overview',
  };

  const noClustersNode = {
    title: i18next.t('clusters.overview.title-no-clusters-available'),
    subTitle: i18next.t('clusters.overview.title-no-clusters-available'),
    link: '#',
  };

  return {
    items:
      [clusterOverviewNode, ...clusterNodes].length > 1
        ? [clusterOverviewNode, ...clusterNodes]
        : [clusterOverviewNode, noClustersNode],
  };
}

export async function reloadNavigation() {
  const navigation = await createNavigation();
  window.Luigi.setConfig({ ...window.Luigi.getConfig(), navigation });

  // wait for Luigi to update DOM
  setTimeout(async () => {
    await setNavFooterText();
  }, 100);
}

async function createClusterManagementNodes(features) {
  const activeClusterName = getActiveClusterName();

  const childrenNodes = [
    {
      hideSideNav: true,
      pathSegment: 'remove',
      async onNodeActivation() {
        await deleteActiveCluster();
        return false;
      },
    },
    {
      pathSegment: 'preferences',
      viewUrl: config.coreUIModuleUrl + '/preferences',
      openNodeInModal: { title: i18next.t('preferences.title'), size: 'm' },
    },
  ];

  const clusterManagementNode = {
    pathSegment: 'clusters',
    hideFromNav: true,
    hideSideNav: true,
    viewUrl: config.coreUIModuleUrl + '/clusters',
    viewGroup: coreUIViewGroupName,
    children: childrenNodes,
    context: {
      clusters: await getClusters(),
      activeClusterName,
      language: i18next.language,
      busolaClusterParams: await getBusolaClusterParams(),
      features,
      ssoData: getSSOAuthData(),
      settings: {
        pagination: {
          pageSize: getPageSize(),
          AVAILABLE_PAGE_SIZES,
        },
      },
    },
  };

  const notActiveCluster = name => name !== activeClusterName;

  const clusterNodes = Object.keys(getClusters())
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
    context: { currentCluster: getActiveCluster() },
  };

  return [clusterManagementNode, clusterNode, noPermissionsNode];
}

async function createNavigationForNoCluster() {
  await initFeatures();

  return {
    profile: {
      items: [
        {
          icon: 'settings',
          label: i18next.t('top-nav.profile.preferences'),
          link: '/clusters/preferences',
          openNodeInModal: {
            title: i18next.t('preferences.title'),
            size: 'm',
          },
        },
      ],
    },
    preloadViewGroups: false,
    appSwitcher: await createAppSwitcher(),
    nodes: await createClusterManagementNodes(getFeatures()),
  };
}

export async function createNavigation() {
  try {
    const authData = getAuthData();
    if (!getActiveCluster() || !authData) {
      return await createNavigationForNoCluster();
    }

    await saveCARequired();
    fetchCache.init();
    await loadTargetClusterConfig();

    const config = await getCurrentConfig();

    await checkClusterStorageType(config.storage);

    // we assume all users can make SelfSubjectRulesReview request
    const activeCluster = getActiveCluster();
    const permissionSet = await fetchPermissions(
      authData,
      getCurrentContextNamespace(activeCluster.kubeconfig),
    );

    const groupVersions = await fetchAvailableApis(authData);

    const activeClusterName = activeCluster.kubeconfig['current-context'];

    await initFeatures();

    const optionsForCurrentCluster = {
      contextSwitcher: {
        defaultLabel: 'Select Namespace ...',
        parentNodePath: `/cluster/${encodeURIComponent(
          activeClusterName,
        )}/namespaces`, // absolute path,
        lazyloadOptions: true, // load options on click instead on page load
        customOptionsRenderer: (option, isSelected) => {
          if (option.customRendererCategory === 'overview') {
            return `<a class="fd-menu__link" style="border-bottom: 1px solid #eeeeef"><span class="fd-menu__addon-before"><i class="sap-icon--dimension" role="presentation"></i></span><span class="fd-menu__title">${option.label}</span></a>`;
          }
          let className = 'fd-menu__link' + (isSelected ? ' is-selected' : '');
          return `<a class="${className} ">${option.label}</a>`;
        },
        options: getNamespaces,
      },
      profile: {
        items: [
          {
            icon: 'settings',
            label: i18next.t('top-nav.profile.preferences'),
            link: `/cluster/${encodeURIComponent(
              activeClusterName,
            )}/preferences`,
            openNodeInModal: {
              title: i18next.t('preferences.title'),
              size: 'm',
            },
          },
        ],
      },
    };

    if (!hasAnyRoleBound(permissionSet)) {
      const error = i18next.t('common.errors.no-permissions-no-role');
      saveLocation(`/no-permissions?${NODE_PARAM_PREFIX}error=${error}`);
    }

    return {
      preloadViewGroups: false,
      nodeAccessibilityResolver: node =>
        navigationPermissionChecker(node, permissionSet),
      appSwitcher: await createAppSwitcher(),
      ...optionsForCurrentCluster,
      nodes: await createNavigationNodes(
        await getFeatures(),
        groupVersions,
        permissionSet,
      ),
    };
  } catch (err) {
    saveActiveClusterName(null);
    fetchCache.clear();
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
      showAlert({
        text: errorNotification,
        type: 'error',
      });
      console.warn(err);
    }
    return await createNavigationForNoCluster();
  }
}

async function getObservabilityNodes(authData) {
  const observabilityFeature = (await getCurrentConfig()).features
    .OBSERVABILITY;

  if (!observabilityFeature || !observabilityFeature.isEnabled) return [];

  const links = observabilityFeature.config.links;

  const CATEGORY = {
    label: 'Observability',
    icon: 'stethoscope',
    collapsible: true,
  };
  const navNodes = await Promise.all(
    links.map(async ({ label, path }) => {
      try {
        return {
          category: CATEGORY,
          externalLink: {
            url: 'https://' + (await fetchObservabilityHost(authData, path)),
            sameWindow: false,
          },
          label,
        };
      } catch (e) {
        return undefined;
      }
    }),
  );
  return navNodes.filter(n => n);
}

export async function createNavigationNodes(
  features,
  groupVersions,
  permissionSet,
) {
  const authData = getAuthData();
  const activeCluster = getActiveCluster();

  if (!activeCluster || !getAuthData()) {
    return await createClusterManagementNodes(features);
  }

  const activeClusterName = encodeURIComponent(
    activeCluster.kubeconfig['current-context'],
  );
  const { navigation = {}, hiddenNamespaces = [] } =
    activeCluster?.config || {};

  const createClusterNodes = async () => {
    const staticNodes = getStaticRootNodes(
      getChildrenNodesForNamespace,
      groupVersions,
      permissionSet,
      features,
    );
    const observabilitySection = await getObservabilityNodes(authData);
    const externalNodes = addExternalNodes(features.EXTERNAL_NODES);
    const allNodes = [
      ...staticNodes,
      ...observabilitySection,
      ...externalNodes,
    ];
    hideDisabledNodes(navigation.disabledNodes, allNodes, false);
    return allNodes;
  };

  const clusterNodes = await createClusterNodes();

  const namespaceNodes =
    (await clusterNodes
      .find(n => n.resourceType === 'namespaces')
      ?.children[0]?.children?.()) || [];

  const simplifyNodes = nodes =>
    nodes
      .filter(n => n.resourceType)
      .map(n => ({
        resourceType: n.resourceType.toLowerCase(),
        label: n.label,
        viewUrl: n.viewUrl,
        category:
          typeof n.category === 'object' ? n.category.label : n.category,
        pathSegment: n.pathSegment,
        navigationContext: n.navigationContext,
      }));

  const nodes = [
    {
      pathSegment: 'cluster',
      hideFromNav: true,
      onNodeActivation: () => {
        window.Luigi.navigation().navigate(`/cluster/${activeClusterName}`);
      },
      children: [
        {
          navigationContext: 'cluster',
          pathSegment: activeClusterName,
          children: clusterNodes,
        },
      ],
      context: {
        authData,
        activeClusterName,
        groups,
        features,
        clusters: getClusters(),
        hiddenNamespaces,
        cluster: activeCluster.currentContext.cluster,
        config: activeCluster.config,
        kubeconfig: activeCluster.kubeconfig,
        language: i18next.language,
        ssoData: getSSOAuthData(),
        groupVersions,
        settings: {
          pagination: {
            pageSize: getPageSize(),
            AVAILABLE_PAGE_SIZES,
          },
        },
        clusterNodes: simplifyNodes(clusterNodes),
        namespaceNodes: simplifyNodes(namespaceNodes),
      },
    },
  ];
  return [...nodes, ...(await createClusterManagementNodes(features))];
}

async function getNamespaces() {
  const activeCluster = getActiveCluster();
  const namespace = getCurrentContextNamespace(activeCluster.kubeconfig);

  if (namespace) {
    return createNamespacesList([{ name: namespace }]);
  }

  const { hiddenNamespaces = [] } = getCurrentConfig();
  try {
    let namespaces = await fetchNamespaces(getAuthData());
    if (!getFeatureToggle('showHiddenNamespaces')) {
      namespaces = namespaces.filter(ns => !hiddenNamespaces.includes(ns.name));
    }
    return createNamespacesList(namespaces);
  } catch (e) {
    showAlert({
      text: `Cannot fetch namespaces: ${e.message}`,
      type: 'error',
    });
    return [];
  }
}

async function getChildrenNodesForNamespace(
  groupVersions,
  permissionSet,
  features,
) {
  const { navigation = {} } = getCurrentConfig();
  const staticNodes = getStaticChildrenNodesForNamespace(
    groupVersions,
    permissionSet,
    features,
  );

  hideDisabledNodes(navigation.disabledNodes, staticNodes, true);
  return staticNodes;
}
