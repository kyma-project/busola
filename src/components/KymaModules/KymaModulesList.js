import { useTranslation } from 'react-i18next';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { DynamicPageHeader, FlexBox, Text } from '@ui5/webcomponents-react';
import { HintButton } from 'shared/components/DescriptionHint/DescriptionHint';
import { useState } from 'react';
import KymaModulesEdit from 'components/KymaModules/KymaModulesEdit.js';
import {
  apiGroup,
  apiVersion,
  ReleaseChannelDescription,
  ResourceDescription,
  resourceType,
} from 'components/KymaModules';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { Label } from 'shared/ResourceForm/components/Label';
import { useModuleTemplatesQuery } from './kymaModulesQueries';
import { ModulesList } from './components/ModulesList';

export default function KymaModulesList({
  resourceName,
  resourceUrl,
  kymaResource,
  kymaResourceLoading,
  selectedModules,
  namespaced,
  setOpenedModuleIndex,
  handleResourceDelete,
}) {
  const { t } = useTranslation();
  const [
    showReleaseChannelTitleDescription,
    setShowReleaseChannelTitleDescription,
  ] = useState(false);

  const namespace = 'kyma-system';

  // Fetching all Module Templates can be replcaed with fetching one by one from api after implementing https://github.com/kyma-project/lifecycle-manager/issues/2232
  const {
    data: moduleTemplates,
    loading: moduleTemplateLoading,
  } = useModuleTemplatesQuery({ skip: !resourceName });
  if (moduleTemplateLoading || kymaResourceLoading) {
    return <Spinner />;
  }

  return (
    <ResourceDetails
      className="kyma-modules"
      layoutNumber="startColumn"
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
      customComponents={[
        resource => (
          <ModulesList
            key="kyma-modules-list"
            resource={resource}
            moduleTemplates={moduleTemplates}
            resourceName={resourceName}
            selectedModules={selectedModules}
            kymaResource={kymaResource}
            namespaced={namespaced}
            resourceUrl={resourceUrl}
            setOpenedModuleIndex={setOpenedModuleIndex}
            handleResourceDelete={handleResourceDelete}
          />
        ),
      ]}
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
