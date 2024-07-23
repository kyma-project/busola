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
} from '@ui5/webcomponents-react';

import { HintButton } from 'shared/components/DescriptionHint/DescriptionHint';
import { spacing } from '@ui5/webcomponents-react-base';
import { useState } from 'react';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { useGet, useGetList } from 'shared/hooks/BackendAPI/useGet';
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
import { cloneDeep } from 'lodash';
import { useCreateResource } from 'shared/ResourceForm/useCreateResource';
import { useNotification } from 'shared/contexts/NotificationContext';
import { useDeleteResource } from 'shared/hooks/useDeleteResource';
import { isFormOpenState } from 'state/formOpenAtom';
import { ModuleStatus } from './components/ModuleStatus';

export function KymaModulesList(props) {
  const { t } = useTranslation();

  const [showTitleDescription, setShowTitleDescription] = useState(false);
  const [
    showReleaseChannelTitleDescription,
    setShowReleaseChannelTitleDescription,
  ] = useState(false);
  const setLayoutColumn = useSetRecoilState(columnLayoutState);
  const setIsFormOpen = useSetRecoilState(isFormOpenState);
  const { clusterUrl } = useUrl();

  const [DeleteMessageBox, handleResourceDelete] = useDeleteResource({
    resourceType: t('kyma-modules.title'),
    forceConfirmDelete: true,
  });

  const { data: kymaResources, loading: kymaResourcesLoading } = useGet(
    '/apis/operator.kyma-project.io/v1beta2/namespaces/kyma-system/kymas',
  );
  const { data: kymaExt } = useGetList(
    ext => ext.metadata.labels['app.kubernetes.io/part-of'] === 'Kyma',
  )('/api/v1/configmaps?labelSelector=busola.io/extension=resource', {
    pollingInterval: 5000,
  });

  const resourceName =
    kymaResources?.items.find(kymaResource => kymaResource?.status)?.metadata
      .name || kymaResources?.items[0]?.metadata?.name;
  const resourceUrl = `/apis/operator.kyma-project.io/v1beta2/namespaces/kyma-system/kymas/${resourceName}`;
  const namespace = 'kyma-system';

  const modulesResourceUrl = `/apis/operator.kyma-project.io/v1beta2/moduletemplates`;

  const { data: modules, loading: modulesLoading } = useGet(
    modulesResourceUrl,
    {
      pollingInterval: 3000,
    },
  );

  const { data: kymaResource, loading: kymaResourceLoading } = useGet(
    resourceUrl,
    {
      pollingInterval: 3000,
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
    const findModule = (moduleName, channel) => {
      return modules?.items?.find(
        module =>
          moduleName ===
            module.metadata.labels['operator.kyma-project.io/module-name'] &&
          module.spec.channel === channel,
      );
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
      t('kyma-modules.state'),
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
      const moduleIndex = kymaResource?.spec?.modules
        ? kymaResource?.spec?.modules?.findIndex(kymaResourceModule => {
            return kymaResourceModule?.name === resource?.name;
          })
        : null;
      const isChannelOverriden =
        moduleIndex !== null
          ? kymaResource?.spec?.modules[moduleIndex]?.channel !== undefined
          : false;

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
          {checkBeta(
            findModule(
              resource.name,
              resource?.channel || kymaResource?.spec?.channel,
            ),
          ) ? (
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
            : EMPTY_TEXT_PLACEHOLDER}
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
        // State
        <ModuleStatus moduleStatus={moduleStatus} resource={resource} />,
        // Documentation
        <ExternalLink
          url={
            findModule(
              resource.name,
              resource.channel || kymaResource?.spec.channel,
            )?.metadata?.annotations['operator.kyma-project.io/doc-url']
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

    const [selectedModules] = useState(kymaResource?.spec?.modules || []);
    const [initialUnchangedResource] = useState(cloneDeep(kymaResource));
    const [kymaResourceState, setKymaResourceState] = useState(kymaResource);
    const notification = useNotification();
    const handleModuleUninstall = useCreateResource({
      singularName: 'Kyma',
      pluralKind: 'Kymas',
      resource: kymaResourceState,
      initialUnchangedResource: initialUnchangedResource,
      createUrl: resourceUrl,
      afterCreatedFn: () =>
        notification.notifySuccess({
          content: t('kyma-modules.module-uninstall'),
        }),
    });

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
          handleResourceDelete({
            deleteFn: () => {
              selectedModules.splice(index, 1);

              setKymaResourceState({
                ...kymaResource,
                spec: {
                  ...kymaResource.spec,
                  modules: selectedModules,
                },
              });
              handleModuleUninstall();
            },
          });
        },
      },
    ];

    const handleClickResource = (resourceName, resource) => {
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

    return (
      <>
        {createPortal(
          <DeleteMessageBox
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
      customTitle={
        <>
          {t('kyma-modules.title')}
          {
            <HintButton
              style={spacing.sapUiTinyMarginBegin}
              setShowTitleDescription={setShowTitleDescription}
              showTitleDescription={showTitleDescription}
              description={ResourceDescription}
            />
          }
        </>
      }
      createResourceForm={KymaModulesCreate}
      disableResourceDetailsCard
      disableDelete
      {...props}
    />
  );
}

export default KymaModulesList;
