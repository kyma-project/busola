import { useTranslation } from 'react-i18next';

import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { Label, DynamicPageHeader, Button } from '@ui5/webcomponents-react';
import { Description } from 'shared/components/Description/Description';
import { HintButton } from 'shared/components/DescriptionHint/DescriptionHint';
import { spacing } from '@ui5/webcomponents-react-base';
import { useState } from 'react';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { useGet } from 'shared/hooks/BackendAPI/useGet';
import { ExternalLink } from 'shared/components/ExternalLink/ExternalLink';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';
import KymaModulesCreate from './KymaModulesCreate';

export function KymaModulesList(props) {
  const [showTitleDescription, setShowTitleDescription] = useState(false);
  const resourceUrl =
    '/apis/operator.kyma-project.io/v1beta2/namespaces/kyma-system/kymas/default';
  const resourceType = 'kymas';
  const resourceName = 'default';
  const namespace = 'kyma-system';
  const apiGroup = 'operator.kyma-project.io';
  const apiVersion = 'v1beta2';
  const description = (
    <Description
      i18nKey={'cron-jobs.description'}
      url={
        'https://help.sap.com/docs/btp/sap-business-technology-platform/kyma-s-modular-approach?locale=en-US&state=DRAFT&version=Cloud'
      }
    />
  );

  const modulesResourceUrl = `/apis/operator.kyma-project.io/v1beta2/moduletemplates`;

  const { data: modules } = useGet(modulesResourceUrl, {
    pollingInterval: 3000,
  });

  const { data: kymaResource } = useGet(resourceUrl, {
    pollingInterval: 3000,
  });

  const { t } = useTranslation();

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
      return [
        // Name
        resource.name,
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
              : findStatus(resource.name)?.state
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
            )?.metadata.annotations['operator.kyma-project.io/doc-url']
          }
        >
          {t('common.headers.link')}
        </ExternalLink>,
      ];
    };

    return (
      <GenericList
        extraHeaderContent={[
          <Button design="Emphasized">{t('common.buttons.add')}</Button>,
        ]}
        entries={resource.spec.modules}
        headerRenderer={headerRenderer}
        rowRenderer={rowRenderer}
        disableHiding={true}
        displayArrow={false}
        title={'Modules'}
      />
    );
  };

  return (
    <ResourceDetails
      headerContent={
        <DynamicPageHeader>
          <Label showColon>{t('kyma-modules.release-channel')}</Label>
          <Label>{kymaResource?.spec.channel}</Label>
          <HintButton />
        </DynamicPageHeader>
      }
      customComponents={[ModulesList]}
      apiGroup={apiGroup}
      apiVersion={apiVersion}
      description={description}
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
              description={description}
              context="details"
            />
          }
        </>
      }
      createResourceForm={KymaModulesCreate}
      disableEdit
      disableResourceDetailsCard
      disableDelete
      {...props}
    />
  );
}

export default KymaModulesList;
