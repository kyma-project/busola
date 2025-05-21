import { Tag, Text } from '@ui5/webcomponents-react';
import {
  ModuleTemplateListType,
  ModuleTemplateStatus,
  ModuleTemplateType,
  useGetManagerStatus,
} from '../support';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { useTranslation } from 'react-i18next';
import { useModulesReleaseQuery } from '../kymaModulesQueries';
import { ModuleStatus, resolveType } from './ModuleStatus';
import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';
import { ExternalLink } from 'shared/components/ExternalLink/ExternalLink';
import { useMemo } from 'react';

type RowResourceType = {
  name: string;
  channel: string;
  version: string;
  resource: { kind: string };
};

type ModuleReleaseMetasType = {
  items: { spec: { moduleName: string; beta: boolean } }[];
};

type ModulesListRowsProps = {
  resourceName: string;
  resource: RowResourceType;
  moduleTemplates: ModuleTemplateListType;
  hasDetailsLink: (resource: RowResourceType) => boolean;
};

export const CommunityModulesListRows = ({
  resourceName,
  resource,
  moduleTemplates,
  hasDetailsLink,
}: ModulesListRowsProps) => {
  const { t } = useTranslation();
  const { data: moduleReleaseMetas } = useModulesReleaseQuery({
    skip: !resourceName,
  });
  const findModuleReleaseMeta = (moduleName: string) => {
    return (moduleReleaseMetas as ModuleReleaseMetasType | null)?.items.find(
      item => item.spec.moduleName === moduleName,
    );
  };

  const moduleTemplate = useMemo(
    () =>
      moduleTemplates.items.find(
        template => template.metadata.name === resource.name,
      ),
    [moduleTemplates],
  );

  const { data: moduleStatus } = 'Unknown'; //useGetManagerStatus({
  // ...moduleTemplate?.spec?.data,
  //});

  const checkBeta = (
    module: ModuleTemplateType | undefined,
    currentModuleReleaseMeta?: { spec: { moduleName: string; beta: boolean } },
  ) => {
    return (
      module?.metadata.labels['operator.kyma-project.io/beta'] === 'true' ||
      currentModuleReleaseMeta?.spec?.beta === true
    );
  };

  const showDetailsLink = hasDetailsLink(resource);

  const currentModuleTemplate = moduleTemplates.items.find(
    moduleTemplate => moduleTemplate.metadata.name === resource.name,
  );

  const { data: managerResourceState } = useGetManagerStatus(
    currentModuleTemplate?.spec?.manager,
  );
  // console.log(managerResourceState);
  // if (
  //   moduleStatus &&
  //   !moduleStatus.resource &&
  //   currentModuleTemplate?.spec?.data
  // ) {
  //   const moduleCr = currentModuleTemplate?.spec?.data;

  //   moduleStatus.resource = {
  //     kind: moduleCr.kind,
  //     apiVersion: moduleCr.apiVersion,
  //     metadata: {
  //       name: moduleCr.metadata.name,
  //       namespace: moduleCr.metadata.namespace,
  //     },
  //   };
  // }

  const moduleDocs =
    currentModuleTemplate?.spec?.info?.documentation ||
    currentModuleTemplate?.metadata?.annotations[
      'operator.kyma-project.io/doc-url'
    ];

  //const currentModuleReleaseMeta = findModuleReleaseMeta(resource.name);
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
      {/* {checkBeta(currentModuleTemplate, currentModuleReleaseMeta) ? (
        <Tag
          className="sap-margin-begin-tiny"
          hideStateIcon
          colorScheme="3"
          design="Set2"
        >
          {t('kyma-modules.beta')}
        </Tag>
      ) : null} */}
      {moduleStatus?.state === ModuleTemplateStatus.Unmanaged && (
        <Tag
          className="sap-margin-begin-tiny"
          hideStateIcon
          colorScheme="5"
          design="Set2"
        >
          {moduleStatus.state}
        </Tag>
      )}
    </>,
    // Namespace
    currentModuleTemplate?.metadata?.namespace || EMPTY_TEXT_PLACEHOLDER,
    // Channel
    <>{moduleStatus?.channel}</>,
    // Version
    currentModuleTemplate?.spec?.version || EMPTY_TEXT_PLACEHOLDER,
    // Module State
    <ModuleStatus
      key="module-state"
      resource={{
        resource: {
          ...moduleTemplate?.spec?.data,
        },
      }}
    />,
    // Installation State
    <StatusBadge
      key="installation-state"
      resourceKind="kymas"
      type={resolveType(moduleStatus?.state ?? '')}
      tooltipContent={moduleStatus?.message}
    >
      {managerResourceState}
    </StatusBadge>,
    // Documentation
    moduleDocs ? (
      <ExternalLink url={moduleDocs}>{t('common.headers.link')}</ExternalLink>
    ) : (
      EMPTY_TEXT_PLACEHOLDER
    ),
  ];
};
