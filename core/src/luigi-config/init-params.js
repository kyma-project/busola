import createEncoder from 'json-url';
import {
  saveClusterParams,
  saveActiveClusterName,
  setCluster,
  getClusters,
} from './clusters';

const encoder = createEncoder('lzma');

function getResponseParams(usePKCE = true) {
  if (usePKCE) {
    return {
      responseType: 'code',
      responseMode: 'query',
    };
  } else {
    return { responseType: 'id_token' };
  }
}

function createSystemNamespacesList(namespaces) {
  return namespaces ? namespaces.split(' ') : [];
}

export async function saveInitParamsIfPresent(location) {
  const initParams = new URL(location).searchParams.get('init');
  if (initParams) {
    const decoded = await encoder.decompress(initParams);
    const systemNamespaces = createSystemNamespacesList(
      decoded.config?.systemNamespaces
    );
    const params = {
      ...decoded,
      config: {
        ...decoded.config,
        systemNamespaces,
      },
    };
    if (decoded.auth) {
      params.auth = {
        ...decoded.auth,
        ...getResponseParams(decoded.auth.usePKCE),
      };
    }
    if (!params.cluster.name) {
      params.cluster.name = params.cluster.server.replace(
        /^https?:\/\/(api\.)?/,
        ''
      );
    }

    const clusterName = params.cluster.name;
    const clusters = getClusters();

    if (clusterName in clusters) {
      const settings = {
        header: 'Replace cluster?',
        body: `Are you sure you want to override settings for ${clusterName} cluster?`,
        buttonConfirm: 'Replace',
        buttonDismiss: 'Cancel',
      };
      Luigi.ux()
        .showConfirmationModal(settings)
        .then(() => {
          saveClusterParams(params);
          saveActiveClusterName(clusterName);
          setCluster(clusterName);
        })
        .catch(() => {});
    } else {
      saveClusterParams(params);
      saveActiveClusterName(clusterName);
      setCluster(clusterName);
    }
  }
}
