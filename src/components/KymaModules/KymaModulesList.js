import { useTranslation } from 'react-i18next';

import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { Label, DynamicPageHeader, Button } from '@ui5/webcomponents-react';
import { HintButton } from 'shared/components/DescriptionHint/DescriptionHint';
import { spacing } from '@ui5/webcomponents-react-base';
import { useState } from 'react';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { useGet } from 'shared/hooks/BackendAPI/useGet';
import { ExternalLink } from 'shared/components/ExternalLink/ExternalLink';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';
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
import { Link } from 'shared/components/Link/Link';

export function KymaModulesList(props) {
  const { t } = useTranslation();

  const [showTitleDescription, setShowTitleDescription] = useState(false);
  const [
    showReleaseChannelTitleDescription,
    setShowReleaseChannelTitleDescription,
  ] = useState(false);
  const setLayoutColumn = useSetRecoilState(columnLayoutState);
  const { clusterUrl } = useUrl();

  const { data: kymaResources } = useGet(
    '/apis/operator.kyma-project.io/v1beta2/namespaces/kyma-system/kymas',
  );

  const resourceName = kymaResources?.items[0].metadata.name;
  const resourceUrl = `/apis/operator.kyma-project.io/v1beta2/namespaces/kyma-system/kymas/${resourceName}`;
  const namespace = 'kyma-system';

  const modulesResourceUrl = `/apis/operator.kyma-project.io/v1beta2/moduletemplates`;

  const { data: modules } = useGet(modulesResourceUrl, {
    pollingInterval: 3000,
  });

  const { data: kymaResource } = useGet(resourceUrl, {
    pollingInterval: 3000,
  });

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

    const checkBeta = module => {
      return module?.metadata.labels['operator.kyma-project.io/beta'] === 'true'
        ? 'beta'
        : EMPTY_TEXT_PLACEHOLDER;
    };

    const headerRenderer = () => [
      t('common.headers.name'),
      '',
      t('kyma-modules.namespaces'),
      t('kyma-modules.channel'),
      t('kyma-modules.version'),
      t('kyma-modules.state'),
      t('kyma-modules.documentation'),
    ];

    const rowRenderer = resource => {
      const path = findStatus(resource.name)?.resource?.metadata?.namespace
        ? clusterUrl(
            `kymamodules/namespaces/${
              findStatus(resource.name)?.resource?.metadata?.namespace
            }/${pluralize(
              findStatus(resource.name)?.resource?.kind || '',
            ).toLowerCase()}/${
              findStatus(resource.name)?.resource?.metadata?.name
            }`,
          )
        : clusterUrl(
            `kymamodules/${pluralize(
              findStatus(resource.name)?.resource?.kind || '',
            ).toLowerCase()}/${
              findStatus(resource.name)?.resource?.metadata?.name
            }`,
          );

      return [
        // Name
        <Link
          url={path}
          onClick={() => {
            setLayoutColumn({
              midColumn: {
                resourceType: pluralize(
                  findStatus(resource.name)?.resource?.kind || '',
                ).toLowerCase(),
                resourceName: findStatus(resource.name)?.resource?.metadata
                  ?.name,
                namespaceId:
                  findStatus(resource.name)?.resource?.metadata.namespace || '',
              },
              layout: 'TwoColumnsMidExpanded',
              endColumn: null,
            });
            window.history.pushState(
              window.history.state,
              '',
              `${path}?layout=TwoColumnsMidExpanded`,
            );
          }}
        >
          {resource.name}
        </Link>,
        // Beta
        checkBeta(
          findModule(
            resource.name,
            resource.channel || kymaResource?.spec.channel,
          ),
        ),
        // Namespace
        findStatus(resource.name)?.resource.metadata.namespace ||
          EMPTY_TEXT_PLACEHOLDER,
        // Channel
        findStatus(resource.name)?.channel || EMPTY_TEXT_PLACEHOLDER,
        // Version
        findStatus(resource.name)?.version || EMPTY_TEXT_PLACEHOLDER,
        // State
        <StatusBadge
          resourceKind="kymas"
          type={
            findStatus(resource.name)?.state === 'Ready'
              ? 'Success'
              : findStatus(resource.name)?.state || 'UNKNOWN'
          }
        >
          {findStatus(resource.name)?.state}
        </StatusBadge>,
        // Documentation
        <ExternalLink
          url={
            findModule(
              resource.name,
              resource.channel || kymaResource?.spec.channel,
            )?.metadata
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
    return (
      <GenericList
        extraHeaderContent={[
          <Button design="Emphasized" onClick={handleShowAddModule}>
            {t('common.buttons.add')}
          </Button>,
        ]}
        customColumnLayout={customColumnLayout}
        enableColumnLayout
        entries={resource.spec.modules}
        headerRenderer={headerRenderer}
        rowRenderer={rowRenderer}
        disableHiding={true}
        displayArrow={false}
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
    );
  };

  return (
    <ResourceDetails
      layoutNumber="StartColumn"
      headerContent={
        <DynamicPageHeader>
          <Label showColon>{t('kyma-modules.release-channel')}</Label>
          <Label>{kymaResource?.spec.channel}</Label>
          <HintButton
            style={spacing.sapUiTinyMarginBegin}
            setShowTitleDescription={setShowReleaseChannelTitleDescription}
            showTitleDescription={showReleaseChannelTitleDescription}
            description={ReleaseChannelDescription}
            context="details-release-channel"
          />
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
              context="details"
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
