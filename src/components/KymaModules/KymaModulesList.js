import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import jsyaml from 'js-yaml';

import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import {
  Tag,
  Button,
  DynamicPageHeader,
  FlexBox,
  List,
  MessageStrip,
  ListItemStandard,
  Text,
} from '@ui5/webcomponents-react';

import { HintButton } from 'shared/components/DescriptionHint/DescriptionHint';
import React, { useState, useEffect } from 'react';

import { GenericList } from 'shared/components/GenericList/GenericList';
import {
  useGet,
  useGetList,
  useGetScope,
  useSingleGet,
} from 'shared/hooks/BackendAPI/useGet';
import { ExternalLink } from 'shared/components/ExternalLink/ExternalLink';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import KymaModulesEdit from 'components/KymaModules/KymaModulesEdit.js';
import {
  apiGroup,
  apiVersion,
  ReleaseChannelDescription,
  ResourceDescription,
  resourceType,
} from 'components/KymaModules';
import { useSetRecoilState } from 'recoil';
import { columnLayoutState } from 'state/columnLayoutAtom';
import { useUrl } from 'hooks/useUrl';
import pluralize from 'pluralize';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { Label } from 'shared/ResourceForm/components/Label';
import { isFormOpenState } from 'state/formOpenAtom';
import { ModuleStatus, resolveType } from './components/ModuleStatus';
import { cloneDeep } from 'lodash';
import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';
import { useNavigate } from 'react-router-dom';
import {
  useModulesReleaseQuery,
  useModuleTemplatesQuery,
} from './kymaModulesQueries';
import { findStatus } from './support';

export default function KymaModulesList({
  DeleteMessageBox,
  handleResourceDelete,
  handleModuleUninstall,
  setKymaResourceState,
  setInitialUnchangedResource,
  resourceName,
  resourceUrl,
  kymaResource,
  kymaResourceLoading,
  kymaResourceState,
  selectedModules,
  setOpenedModuleIndex,
  detailsOpen,
  namespaced,
}) {
  const { t } = useTranslation();
  const [
    showReleaseChannelTitleDescription,
    setShowReleaseChannelTitleDescription,
  ] = useState(false);
  const setLayoutColumn = useSetRecoilState(columnLayoutState);
  const setIsFormOpen = useSetRecoilState(isFormOpenState);
  const { clusterUrl, namespaceUrl } = useUrl();
  const fetch = useSingleGet();
  const getScope = useGetScope();
  const navigate = useNavigate();

  const { data: kymaExt } = useGetList(
    ext => ext.metadata.labels['app.kubernetes.io/part-of'] === 'Kyma',
  )('/api/v1/configmaps?labelSelector=busola.io/extension=resource', {
    pollingInterval: 5000,
  });

  const namespace = 'kyma-system';

  const { data: moduleReleaseMetas } = useModulesReleaseQuery({
    skip: !resourceName,
  });
  const {
    data: moduleTemplates,
    loading: moduleTemplateLoading,
  } = useModuleTemplatesQuery({ skip: !resourceName });

  const crdUrl = `/apis/apiextensions.k8s.io/v1/customresourcedefinitions`;
  const { data: crds } = useGet(crdUrl, {
    pollingInterval: 5000,
  });
  const [chosenModuleIndex, setChosenModuleIndex] = useState(null);

  if (moduleTemplateLoading || kymaResourceLoading) {
    return <Spinner />;
  }

  const handleShowAddModule = () => {
    setLayoutColumn({
      midColumn: null,
      endColumn: null,
      layout: 'TwoColumnsMidExpanded',
      showCreate: {
        resourceType: 'kymamodules',
        resourceUrl: resourceUrl,
      },
    });

    setIsFormOpen({ formOpen: true });
  };

  const ModulesList = resource => {
    const findModule = (moduleName, channel, version) => {
      // This change was made due to changes in moduleTemplates and should be simplified once all moduleTemplates migrate
      const moduleTemplateWithoutInfo = moduleTemplates?.items?.find(
        moduleTemplate =>
          moduleName ===
            moduleTemplate.metadata.labels[
              'operator.kyma-project.io/module-name'
            ] && moduleTemplate.spec.channel === channel,
      );
      const moduleWithInfo = moduleTemplates?.items?.find(
        moduleTemplate =>
          moduleName ===
            moduleTemplate.metadata.labels[
              'operator.kyma-project.io/module-name'
            ] &&
          !moduleTemplate.spec.channel &&
          moduleTemplate.spec.version === version,
      );

      return moduleWithInfo ?? moduleTemplateWithoutInfo;
    };

    const findModuleReleaseMeta = moduleName => {
      return moduleReleaseMetas?.items.find(
        item => item.spec.moduleName === moduleName,
      );
    };

    const findExtension = resourceKind => {
      return kymaExt?.find(ext => {
        const { resource: extensionResource } =
          jsyaml.load(ext.data.general, { json: true }) || {};
        return extensionResource.kind === resourceKind;
      });
    };

    const checkBeta = (module, currentModuleReleaseMeta) => {
      return (
        module?.metadata.labels['operator.kyma-project.io/beta'] === 'true' ||
        currentModuleReleaseMeta?.spec?.beta === true
      );
    };

    const findCrd = resourceKind => {
      return crds?.items?.find(crd => crd.spec?.names?.kind === resourceKind);
    };

    const headerRenderer = () => [
      t('common.headers.name'),
      t('kyma-modules.namespaces'),
      t('kyma-modules.channel'),
      t('kyma-modules.version'),
      t('kyma-modules.module-state'),
      t('kyma-modules.installation-state'),
      t('kyma-modules.documentation'),
    ];

    const hasDetailsLink = resource => {
      const isInstalled =
        selectedModules?.findIndex(kymaResourceModule => {
          return kymaResourceModule?.name === resource?.name;
        }) >= 0;
      const moduleStatus = findStatus(kymaResource, resource.name);
      const isDeletionFailed = moduleStatus?.state === 'Warning';
      const isError = moduleStatus?.state === 'Error';

      const hasExtension = !!findExtension(resource?.resource?.kind);
      const hasCrd = !!findCrd(resource?.resource?.kind);

      return (
        (isInstalled || isDeletionFailed || !isError) &&
        (hasCrd || hasExtension)
      );
    };

    const rowRenderer = resource => {
      const moduleStatus = findStatus(kymaResource, resource.name);
      const showDetailsLink = hasDetailsLink(resource);
      const moduleIndex = kymaResource?.spec?.modules?.findIndex(
        kymaResourceModule => {
          return kymaResourceModule?.name === resource?.name;
        },
      );

      const currentModule = findModule(
        resource.name,
        resource?.channel || kymaResource?.spec?.channel,
        resource?.version,
      );

      const currentModuleReleaseMeta = findModuleReleaseMeta(resource.name);

      const isChannelOverriden =
        kymaResource?.spec?.modules?.[moduleIndex]?.channel !== undefined;

      return [
        // Name
        <>
          {showDetailsLink ? (
            <Text style={{ fontWeight: 'bold', color: 'var(--sapLinkColor)' }}>
              {resource.name}
            </Text>
          ) : (
            resource.name
          )}
          {checkBeta(currentModule, currentModuleReleaseMeta) ? (
            <Tag
              className="sap-margin-begin-tiny"
              hideStateIcon
              colorScheme="3"
              design="Set2"
            >
              {t('kyma-modules.beta')}
            </Tag>
          ) : null}
        </>,
        // Namespace
        moduleStatus?.resource?.metadata?.namespace || EMPTY_TEXT_PLACEHOLDER,
        // Channel
        <>
          {moduleStatus?.channel
            ? moduleStatus?.channel
            : kymaResource?.spec?.modules?.[moduleIndex]?.channel}
          {isChannelOverriden ? (
            <Tag
              hideStateIcon
              design="Set2"
              colorScheme="5"
              className="sap-margin-begin-tiny"
            >
              {t('kyma-modules.channel-overridden')}
            </Tag>
          ) : (
            ''
          )}
        </>,
        // Version
        moduleStatus?.version || EMPTY_TEXT_PLACEHOLDER,
        // Module State
        <ModuleStatus resource={resource} />,
        // Installation State
        <StatusBadge
          resourceKind="kymas"
          type={resolveType(moduleStatus?.state)}
          tooltipContent={moduleStatus?.message}
        >
          {moduleStatus?.state || 'Unknown'}
        </StatusBadge>,
        // Documentation
        <ExternalLink
          url={
            currentModule?.spec?.info
              ? currentModule.spec.info.documentation
              : currentModule?.metadata?.annotations[
                  'operator.kyma-project.io/doc-url'
                ]
          }
        >
          {t('common.headers.link')}
        </ExternalLink>,
      ];
    };

    const customColumnLayout = resource => {
      return {
        resourceName: resource?.name,
        resourceType: pluralize(
          findStatus(kymaResource, resource.name)?.resource?.kind || '',
        ),
        namespaceId:
          findStatus(kymaResource, resource.name)?.resource?.metadata
            ?.namespace || '',
      };
    };

    const actions = [
      {
        name: t('common.buttons.delete'),
        tooltip: () => t('common.buttons.delete'),
        icon: 'delete',
        disabledHandler: resource => {
          const index = selectedModules?.findIndex(kymaResourceModule => {
            return kymaResourceModule.name === resource.name;
          });
          return index < 0;
        },
        handler: resource => {
          const index = selectedModules?.findIndex(kymaResourceModule => {
            return kymaResourceModule.name === resource.name;
          });
          setChosenModuleIndex(index);
          handleResourceDelete({});
        },
      },
    ];

    const handleClickResource = (resourceName, resource) => {
      setOpenedModuleIndex(
        selectedModules.findIndex(entry => entry.name === resourceName),
      );
      const isExtension = !!findExtension(resource?.resource?.kind);
      const moduleStatus = findStatus(kymaResource, resourceName);
      const moduleCrd = findCrd(resource?.resource?.kind);
      const skipRedirect = !hasDetailsLink(resource);

      if (skipRedirect) {
        return;
      }

      const pathName = `${
        isExtension
          ? `${pluralize(moduleStatus?.resource?.kind || '').toLowerCase()}/${
              moduleStatus?.resource?.metadata?.name
            }`
          : `${moduleCrd?.metadata?.name}/${moduleStatus?.resource?.metadata?.name}`
      }`;

      const partialPath = moduleStatus?.resource?.metadata?.namespace
        ? `kymamodules/namespaces/${moduleStatus?.resource?.metadata?.namespace}/${pathName}`
        : `kymamodules/${pathName}`;

      const path = namespaced
        ? namespaceUrl(partialPath)
        : clusterUrl(partialPath);

      if (!isExtension) {
        setLayoutColumn({
          midColumn: {
            resourceType: moduleCrd?.metadata?.name,
            resourceName: moduleStatus?.resource?.metadata?.name,
            namespaceId: moduleStatus?.resource?.metadata.namespace || '',
          },
          layout: 'TwoColumnsMidExpanded',
          endColumn: null,
        });
        window.history.pushState(
          window.history.state,
          '',
          `${path}?layout=TwoColumnsMidExpanded`,
        );
      } else {
        setLayoutColumn({
          midColumn: {
            resourceType: pluralize(
              moduleStatus?.resource?.kind || '',
            ).toLowerCase(),
            resourceName: moduleStatus?.resource?.metadata?.name,
            namespaceId: moduleStatus?.resource?.metadata.namespace || '',
          },
          layout: 'TwoColumnsMidExpanded',
          endColumn: null,
        });
      }

      window.history.pushState(
        window.history.state,
        '',
        `${path}?layout=TwoColumnsMidExpanded`,
      );
    };

    const getAssociatedResources = () => {
      const module = findModule(
        selectedModules[chosenModuleIndex]?.name,
        selectedModules[chosenModuleIndex]?.channel ||
          kymaResource?.spec?.channel,
        selectedModules[chosenModuleIndex]?.version ||
          findStatus(kymaResource, selectedModules[chosenModuleIndex]?.name)
            ?.version,
      );

      return module?.spec?.associatedResources || [];
    };

    const getNumberOfResources = async (kind, group, version) => {
      const url =
        group === 'v1'
          ? '/api/v1'
          : `/apis/${group}/${version}/${pluralize(kind.toLowerCase())}`;

      try {
        const response = await fetch(url);
        const json = await response.json();
        return json.items.length;
      } catch (e) {
        console.warn(e);
        return 'Error';
      }
    };

    const handleItemClick = async (kind, group, version) => {
      const isNamespaced = await getScope(group, version, kind);
      const path = `${pluralize(kind.toLowerCase())}`;
      const link = isNamespaced
        ? namespaceUrl(path, { namespace: '-all-' })
        : clusterUrl(path);

      navigate(link);
    };

    const fetchResourceCounts = async () => {
      const resources = getAssociatedResources();
      const counts = {};
      for (const resource of resources) {
        const count = await getNumberOfResources(
          resource.kind,
          resource.group,
          resource.version,
        );
        counts[
          `${resource.kind}-${resource.group}-${resource.version}`
        ] = count;
      }
      return counts;
    };

    const [resourceCounts, setResourceCounts] = useState({});

    useEffect(() => {
      const fetchCounts = async () => {
        const counts = await fetchResourceCounts();
        setResourceCounts(counts);
      };

      fetchCounts();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chosenModuleIndex]);

    const checkIfAssociatedResourceLeft = () => {
      const resources = getAssociatedResources();
      for (const resource of resources) {
        if (
          resourceCounts[
            `${resource.kind}-${resource.group}-${resource.version}`
          ] > 0
        ) {
          return true;
        }
      }
      return false;
    };

    return (
      <React.Fragment key="modules-list">
        {!detailsOpen &&
          createPortal(
            <DeleteMessageBox
              disableDeleteButton={checkIfAssociatedResourceLeft()}
              additionalDeleteInfo={
                <>
                  <Text>
                    {t('kyma-modules.delete-module', {
                      name: selectedModules[chosenModuleIndex]?.name,
                    })}
                  </Text>
                  {getAssociatedResources().length > 0 && (
                    <>
                      <MessageStrip design="Critical" hideCloseButton>
                        {t('kyma-modules.associated-resources-warning')}
                      </MessageStrip>
                      <List
                        headerText={t('kyma-modules.associated-resources')}
                        mode="None"
                        separators="All"
                      >
                        {getAssociatedResources().map(assResource => {
                          const resourceCount =
                            resourceCounts[
                              `${assResource.kind}-${assResource.group}-${assResource.version}`
                            ];

                          return (
                            <ListItemStandard
                              onClick={e => {
                                e.preventDefault();
                                handleItemClick(
                                  assResource.kind,
                                  assResource.group,
                                  assResource.version,
                                );
                              }}
                              type="Active"
                              key={`${assResource.kind}-${assResource.group}-${assResource.version}`}
                              additionalText={
                                (resourceCount === 0 ? '0' : resourceCount) ||
                                t('common.headers.loading')
                              }
                            >
                              {pluralize(assResource?.kind)}
                            </ListItemStandard>
                          );
                        })}
                      </List>
                    </>
                  )}
                </>
              }
              resourceTitle={selectedModules[chosenModuleIndex]?.name}
              deleteFn={() => {
                selectedModules.splice(chosenModuleIndex, 1);
                setKymaResourceState({
                  ...kymaResource,
                  spec: {
                    ...kymaResource.spec,
                    modules: selectedModules,
                  },
                });
                handleModuleUninstall();
                setInitialUnchangedResource(cloneDeep(kymaResourceState));
              }}
            />,
            document.body,
          )}
        <GenericList
          actions={actions}
          customRowClick={handleClickResource}
          extraHeaderContent={[
            <Button
              key="add-module"
              design="Emphasized"
              onClick={handleShowAddModule}
            >
              {t('common.buttons.add')}
            </Button>,
          ]}
          customColumnLayout={customColumnLayout}
          enableColumnLayout
          hasDetailsView
          entries={resource?.status?.modules}
          headerRenderer={headerRenderer}
          rowRenderer={rowRenderer}
          noHideFields={['Name', '', 'Namespace']}
          displayArrow
          title={'Modules'}
          sortBy={{
            name: (a, b) => a.name?.localeCompare(b.name),
          }}
          emptyListProps={{
            image: 'TntComponents',
            titleText: `${t('common.labels.no')} ${t(
              'kyma-modules.title',
            ).toLocaleLowerCase()}`,
            subtitleText: t('kyma-modules.no-modules-description'),
            url:
              'https://help.sap.com/docs/btp/sap-business-technology-platform/kyma-s-modular-approach?locale=en-US&state=DRAFT&version=Cloud',
            buttonText: t('common.buttons.add'),
            showButton: true,
            onClick: handleShowAddModule,
          }}
        />
      </React.Fragment>
    );
  };

  return (
    <ResourceDetails
      className="kyma-modules"
      layoutNumber="StartColumn"
      windowTitle={t('kyma-modules.title')}
      headerContent={
        <DynamicPageHeader className="no-shadow">
          <FlexBox alignItems="Center">
            <Label showColon>{t('kyma-modules.release-channel')}</Label>
            <Text style={{ marginRight: '0.2rem' }}> </Text>
            <Text>{kymaResource?.spec.channel}</Text>
            <HintButton
              className="sap-margin-begin-tiny"
              setShowTitleDescription={setShowReleaseChannelTitleDescription}
              showTitleDescription={showReleaseChannelTitleDescription}
              description={ReleaseChannelDescription}
              ariaTitle={t('kyma-modules.release-channel')}
            />
          </FlexBox>
        </DynamicPageHeader>
      }
      customComponents={[ModulesList]}
      apiGroup={apiGroup}
      apiVersion={apiVersion}
      resourceUrl={resourceUrl}
      resourceType={resourceType}
      resourceName={resourceName}
      namespace={namespace}
      customTitle={t('kyma-modules.title')}
      headerDescription={ResourceDescription}
      createResourceForm={KymaModulesEdit}
      disableResourceDetailsCard
      disableDelete
    />
  );
}
