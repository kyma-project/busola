import { createContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@ui5/webcomponents-react';

import { cloneDeep } from 'lodash';
import { t } from 'i18next';

import { useKymaQuery, useModuleTemplatesQuery } from '../kymaModulesQueries';
import { useNotification } from 'shared/contexts/NotificationContext';
import { useCreateResource } from 'shared/ResourceForm/useCreateResource';
import { checkSelectedModule } from '../support';
import { ModulesDeleteBox } from '../components/ModulesDeleteBox';

export const KymaModuleContext = createContext({
  resourceName: null,
  resourceUrl: null,
  kymaResource: null,
  kymaResourceLoading: false,
  initialUnchangedResource: null,
  kymaResourceState: null,
  setKymaResourceState: () => {},
  moduleTemplates: null,
  moduleTemplatesLoading: false,
  selectedModules: {},
  setOpenedModuleIndex: () => {},
  handleResourceDelete: () => {},
  deleteModuleButton: () => <></>,
});

export function KymaModuleContextProvider({
  children,
  setLayoutColumn,
  layoutState,
  DeleteMessageBox,
  handleResourceDelete,
  showDeleteDialog,
}) {
  const {
    data: kymaResource,
    loading: kymaResourceLoading,
    resourceUrl,
  } = useKymaQuery();
  const [activeKymaModules, setActiveKymaModules] = useState(
    kymaResource?.spec?.modules ?? [],
  );
  const [openedModuleIndex, setOpenedModuleIndex] = useState();
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    if (kymaResource) {
      setActiveKymaModules(kymaResource?.spec?.modules || []);
      setKymaResourceState(kymaResource);
      setInitialUnchangedResource(cloneDeep(kymaResource));
    }
  }, [kymaResource]);

  useEffect(() => {
    if (layoutState?.layout) {
      setDetailsOpen(layoutState?.layout !== 'OneColumn');
    }
  }, [layoutState]);

  const [initialUnchangedResource, setInitialUnchangedResource] = useState();
  const [kymaResourceState, setKymaResourceState] = useState();
  const notification = useNotification();

  const handleModuleUninstall = useCreateResource({
    singularName: 'Kyma',
    pluralKind: 'Kymas',
    resource: kymaResourceState,
    initialResource: initialUnchangedResource,
    updateInitialResource: setInitialUnchangedResource,
    createUrl: resourceUrl,
    afterCreatedFn: () =>
      notification.notifySuccess({
        content: t('kyma-modules.module-uninstall'),
      }),
  });

  // Fetching all Module Templates can be replaced with fetching one by one from api after implementing https://github.com/kyma-project/lifecycle-manager/issues/2232
  const {
    data: moduleTemplates,
    loading: moduleTemplatesLoading,
  } = useModuleTemplatesQuery({
    skip: !kymaResource?.metadata?.name,
  });

  const deleteModuleButton = (
    <div>
      <Button onClick={() => handleResourceDelete({})} design="Transparent">
        {t('common.buttons.delete-module')}
      </Button>
    </div>
  );

  return (
    <KymaModuleContext.Provider
      value={{
        resourceName: kymaResource?.metadata?.name,
        resourceUrl: resourceUrl,
        kymaResource: kymaResource,
        kymaResourceLoading: kymaResourceLoading,
        initialUnchangedResource: initialUnchangedResource,
        kymaResourceState: kymaResourceState,
        setKymaResourceState: setKymaResourceState,
        moduleTemplates: moduleTemplates,
        moduleTemplatesLoading: moduleTemplatesLoading,
        selectedModules: activeKymaModules,
        setOpenedModuleIndex: setOpenedModuleIndex,
        DeleteMessageBox: DeleteMessageBox,
        handleResourceDelete: handleResourceDelete,
        showDeleteDialog: showDeleteDialog,
        deleteModuleButton: deleteModuleButton,
      }}
    >
      {createPortal(
        !kymaResourceLoading && !moduleTemplatesLoading && showDeleteDialog && (
          <ModulesDeleteBox
            DeleteMessageBox={DeleteMessageBox}
            selectedModules={activeKymaModules}
            chosenModuleIndex={
              openedModuleIndex ??
              // Find index of the selected module after a refresh or other case after which we have undefined.
              activeKymaModules.findIndex(module =>
                checkSelectedModule(module, layoutState),
              )
            }
            kymaResource={kymaResource}
            kymaResourceState={kymaResourceState}
            moduleTemplates={{
              ...moduleTemplates,
              items: [
                ...moduleTemplates.items,
                {
                  apiVersion: 'operator.kyma-project.io/v1beta2',
                  kind: 'ModuleTemplate',
                  metadata: {
                    name: 'cluster-ip-029',
                    namespace: 'kyma-system',
                    labels: {
                      'operator.kyma-project.io/module-name': 'cluster-ip',
                    },
                    annotations: {
                      'operator.kyma-project.io/is-cluster-scoped': 'false',
                    },
                  },
                  spec: {
                    moduleName: 'cluster-ips',
                    version: '0.0.29',
                    mandatory: false,
                    requiresDowntime: false,
                    info: {
                      repository:
                        'https://github.com/pbochynski/cluster-ip.git',
                      documentation: 'https://github.com/pbochynski',
                      icons: [
                        {
                          name: 'module-icon',
                          link:
                            'https://raw.githubusercontent.com/pbochynski/cluster-ip/refs/heads/main/logo.png',
                        },
                      ],
                    },
                    associatedResources: [
                      {
                        group: 'operator.kyma-project.io',
                        version: 'v1alpha2',
                        kind: 'ClusterIP',
                      },
                    ],
                    data: {
                      apiVersion: 'operator.kyma-project.io/v1alpha1',
                      kind: 'ClusterIP',
                      metadata: {
                        name: 'cluster-ip-zones',
                      },
                      spec: {
                        nodeSpreadLabel: 'topology.kubernetes.io/zone',
                      },
                    },
                    manager: {
                      name: 'cluster-ip-controller-manager',
                      group: 'apps',
                      version: 'v1',
                      kind: 'Deployment',
                    },
                    descriptor: {
                      component: {
                        componentReferences: [],
                        name: 'kyma-project.io/module/cluster-ip',
                        provider:
                          '{"name":"kyma-project.io","labels":[{"name":"kyma-project.io/built-by","value":"modulectl","version":"v1"}]}',
                        repositoryContexts: [
                          {
                            baseUrl: 'http://k3d-oci.localhost:5001',
                            componentNameMapping: 'urlPath',
                            type: 'OCIRegistry',
                          },
                        ],
                        resources: [
                          {
                            access: {
                              localReference:
                                'sha256:b88d172173d41c7b0799512718e598efa5643e9eb3aeebbf88fd8e5e6e18098f',
                              mediaType: 'application/x-tar',
                              referenceName: 'raw-manifest',
                              type: 'localBlob',
                            },
                            digest: {
                              hashAlgorithm: 'SHA-256',
                              normalisationAlgorithm: 'genericBlobDigest/v1',
                              value:
                                'b88d172173d41c7b0799512718e598efa5643e9eb3aeebbf88fd8e5e6e18098f',
                            },
                            name: 'raw-manifest',
                            relation: 'local',
                            type: 'directory',
                            version: '0.0.29',
                          },
                          {
                            access: {
                              localReference:
                                'sha256:633d91a28e03e1bcb495095e92430a2d996e13faaa15ead90cc180514cf5a2c3',
                              mediaType: 'application/x-tar',
                              referenceName: 'default-cr',
                              type: 'localBlob',
                            },
                            digest: {
                              hashAlgorithm: 'SHA-256',
                              normalisationAlgorithm: 'genericBlobDigest/v1',
                              value:
                                '633d91a28e03e1bcb495095e92430a2d996e13faaa15ead90cc180514cf5a2c3',
                            },
                            name: 'default-cr',
                            relation: 'local',
                            type: 'directory',
                            version: '0.0.29',
                          },
                        ],
                        sources: [
                          {
                            access: {
                              commit:
                                '106643ead24aff8da197fc89a46ce546193ea8f1',
                              repoUrl:
                                'https://github.com/pbochynski/cluster-ip.git',
                              type: 'gitHub',
                            },
                            labels: [
                              {
                                name: 'git.kyma-project.io/ref',
                                value: 'HEAD',
                                version: 'v1',
                              },
                            ],
                            name: 'module-sources',
                            type: 'Github',
                            version: '0.0.29',
                          },
                        ],
                        version: '0.0.29',
                      },
                      meta: {
                        schemaVersion: 'v2',
                      },
                    },
                    resources: [
                      {
                        name: 'rawManifest',
                        link:
                          'https://github.com/pbochynski/cluster-ip/releases/download/0.0.29/cluster-ip-operator.yaml',
                      },
                    ],
                  },
                },
              ],
            }}
            detailsOpen={detailsOpen}
            setKymaResourceState={setKymaResourceState}
            setInitialUnchangedResource={setInitialUnchangedResource}
            setChosenModuleIndex={setOpenedModuleIndex}
            handleModuleUninstall={handleModuleUninstall}
            setLayoutColumn={setLayoutColumn}
          />
        ),
        document.body,
      )}
      {children}
    </KymaModuleContext.Provider>
  );
}
