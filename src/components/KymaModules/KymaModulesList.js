import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import jsyaml from 'js-yaml';

import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import {
  DynamicPageHeader,
  Button,
  FlexBox,
  Text,
  Badge,
  List,
  StandardListItem,
} from '@ui5/webcomponents-react';

import { HintButton } from 'shared/components/DescriptionHint/DescriptionHint';
import { spacing } from '@ui5/webcomponents-react-base';
import { useEffect, useState } from 'react';
import { GenericList } from 'shared/components/GenericList/GenericList';
import {
  useGet,
  useGetList,
  useSingleGet,
} from 'shared/hooks/BackendAPI/useGet';
import { ExternalLink } from 'shared/components/ExternalLink/ExternalLink';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import KymaModulesCreate from './KymaModulesCreate';
import {
  ReleaseChannelDescription,
  ResourceDescription,
  resourceType,
  apiGroup,
  apiVersion,
} from 'components/KymaModules';
import { useSetRecoilState } from 'recoil';
import { columnLayoutState } from 'state/columnLayoutAtom';
import { useUrl } from 'hooks/useUrl';
import pluralize from 'pluralize';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { Label } from 'shared/ResourceForm/components/Label';
import { isFormOpenState } from 'state/formOpenAtom';
import { ModuleStatus } from './components/ModuleStatus';
import { cloneDeep } from 'lodash';
import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';

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
  kymaResourcesLoading,
  kymaResourceState,
  selectedModules,
  setOpenedModuleIndex,
  detailsOpen,
}) {
  const { t } = useTranslation();
  const [
    showReleaseChannelTitleDescription,
    setShowReleaseChannelTitleDescription,
  ] = useState(false);
  const setLayoutColumn = useSetRecoilState(columnLayoutState);
  const setIsFormOpen = useSetRecoilState(isFormOpenState);
  const { clusterUrl } = useUrl();
  const fetch = useSingleGet();

  const { data: kymaExt } = useGetList(
    ext => ext.metadata.labels['app.kubernetes.io/part-of'] === 'Kyma',
  )('/api/v1/configmaps?labelSelector=busola.io/extension=resource', {
    pollingInterval: 5000,
  });

  const namespace = 'kyma-system';

  const modulesResourceUrl = `/apis/operator.kyma-project.io/v1beta2/moduletemplates`;

  const { data: modules, loading: modulesLoading } = useGet(
    modulesResourceUrl,
    {
      pollingInterval: 3000,
      skip: !resourceName,
    },
  );

  const crdUrl = `/apis/apiextensions.k8s.io/v1/customresourcedefinitions`;
  const { data: crds } = useGet(crdUrl, {
    pollingInterval: 5000,
  });
  const [chosenModuleIndex, setChosenModuleIndex] = useState(null);

  if (kymaResourcesLoading || modulesLoading || kymaResourceLoading) {
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
      // This change was made due to changes in modules and should be simplified once all modules migrate
      const moduleWithoutInfo = modules?.items?.find(
        module =>
          moduleName ===
            module.metadata.labels['operator.kyma-project.io/module-name'] &&
          module.spec.channel === channel,
      );
      const moduleWithInfo = modules?.items?.find(
        module =>
          moduleName ===
            module.metadata.labels['operator.kyma-project.io/module-name'] &&
          !module.spec.channel &&
          module.spec.version === version,
      );

      return moduleWithInfo ?? moduleWithoutInfo;
    };

    const findStatus = moduleName => {
      return kymaResource?.status.modules?.find(
        module => moduleName === module.name,
      );
    };
    const findExtension = resourceKind => {
      return kymaExt?.find(ext => {
        const { resource: extensionResource } =
          jsyaml.load(ext.data.general, { json: true }) || {};
        return extensionResource.kind === resourceKind;
      });
    };
    const checkBeta = module => {
      return (
        module?.metadata.labels['operator.kyma-project.io/beta'] === 'true'
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
      const moduleStatus = findStatus(resource.name);
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
      const moduleStatus = findStatus(resource.name);
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
          {checkBeta(currentModule) ? (
            <Badge style={spacing.sapUiTinyMarginBegin}>
              {t('kyma-modules.beta')}
            </Badge>
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
            <Badge
              hideStateIcon
              design="Set2"
              colorScheme="5"
              style={spacing.sapUiTinyMarginBegin}
            >
              {t('kyma-modules.channel-overridden')}
            </Badge>
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
          type={
            moduleStatus?.state === 'Ready'
              ? 'Success'
              : moduleStatus?.state === 'Processing' ||
                moduleStatus?.state === 'Deleting' ||
                moduleStatus?.state === 'Unmanaged' ||
                moduleStatus?.state === 'Unknown'
              ? 'None'
              : moduleStatus?.state || 'None'
          }
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
          findStatus(resource.name)?.resource?.kind || '',
        ),
        namespaceId:
          findStatus(resource.name)?.resource?.metadata?.namespace || '',
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
      const moduleStatus = findStatus(resourceName);
      const moduleCrd = findCrd(resource?.resource?.kind);
      const skipRedirect = !hasDetailsLink(resource);

      if (skipRedirect) {
        return;
      }

      const path = moduleStatus?.resource?.metadata?.namespace
        ? clusterUrl(
            `kymamodules/namespaces/${
              moduleStatus?.resource?.metadata?.namespace
            }/${
              isExtension
                ? `${pluralize(
                    moduleStatus?.resource?.kind || '',
                  ).toLowerCase()}/${moduleStatus?.resource?.metadata?.name}`
                : `${moduleCrd?.metadata?.name}/${moduleStatus?.resource?.metadata?.name}`
            }`,
          )
        : clusterUrl(
            `kymamodules/${
              isExtension
                ? `${pluralize(
                    moduleStatus?.resource?.kind || '',
                  ).toLowerCase()}/${moduleStatus?.resource?.metadata?.name}`
                : `${moduleCrd?.metadata?.name}/${moduleStatus?.resource?.metadata?.name}`
            }`,
          );

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

    const getAssciatedResources = () => {
      const module = findModule(
        selectedModules[chosenModuleIndex]?.name,
        selectedModules[chosenModuleIndex]?.channel ||
          kymaResource?.spec?.channel,
        selectedModules[chosenModuleIndex]?.version ||
          findStatus(selectedModules[chosenModuleIndex]?.name)?.version,
      );
      console.log(module?.spec?.associatedResources);
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
        console.log(json.items.length);
        return json.items.length;
      } catch (e) {
        console.warn(e);
        return 'Error';
      }
    };

    const fetchResourceCounts = async () => {
      const resources = getAssciatedResources();
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

    return (
      <>
        {!detailsOpen &&
          createPortal(
            <DeleteMessageBox
              additionalDeleteInfo={
                getAssciatedResources().length > 0 && (
                  <>
                    <List
                      headerText="AssociatedResources"
                      mode="None"
                      separators="All"
                    >
                      {getAssciatedResources().map(assResource => (
                        <StandardListItem
                          key={`${assResource.kind}-${assResource.group}-${assResource.version}`}
                          additionalText={
                            resourceCounts[
                              `${assResource.kind}-${assResource.group}-${assResource.version}`
                            ] || 'Loading...'
                          }
                        >
                          {pluralize(assResource?.kind)}
                        </StandardListItem>
                      ))}
                    </List>
                  </>
                )
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
      </>
    );
  };

  return (
    <ResourceDetails
      className="kyma-modules"
      layoutNumber="StartColumn"
      windowTitle={t('kyma-modules.title')}
      headerContent={
        <DynamicPageHeader>
          <FlexBox alignItems="Center">
            <Label showColon>{t('kyma-modules.release-channel')}</Label>
            <Text renderWhitespace={true}> </Text>
            <Text>{kymaResource?.spec.channel}</Text>
            <HintButton
              style={spacing.sapUiTinyMarginBegin}
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
      createResourceForm={KymaModulesCreate}
      disableResourceDetailsCard
      disableDelete
    />
  );
}
