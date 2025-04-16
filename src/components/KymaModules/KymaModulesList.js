import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { DynamicPageHeader, FlexBox, Text } from '@ui5/webcomponents-react';
import { HintButton } from 'shared/components/DescriptionHint/DescriptionHint';
import { useState } from 'react';
import KymaModulesEdit from 'components/KymaModules/KymaModulesEdit.js';

import {
  apiGroup,
  apiVersion,
  Create,
  ReleaseChannelDescription,
  ResourceDescription,
  resourceType,
} from 'components/KymaModules';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { Label } from 'shared/ResourceForm/components/Label';
import { useModuleTemplatesQuery } from './kymaModulesQueries';
import { ModulesList } from './components/ModulesList';
import { KymaModuleContext } from './providers/KymaModuleProvider';
import { DynamicPageComponent } from 'shared/components/DynamicPageComponent/DynamicPageComponent';
import { ResourceCreate } from 'shared/components/ResourceCreate/ResourceCreate';
import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';
import { useProtectedResources } from 'shared/hooks/useProtectedResources';

export default function KymaModulesList({
  // resourceName,
  // resourceUrl,
  // kymaResource,
  // kymaResourceLoading,
  // selectedModules,
  namespaced,
  // setOpenedModuleIndex,
  // handleResourceDelete,
}) {
  const { t } = useTranslation();
  const [
    showReleaseChannelTitleDescription,
    setShowReleaseChannelTitleDescription,
  ] = useState(false);

  const {
    resourceName,
    resourceUrl,
    kymaResource,
    kymaResourceLoading,
    selectedModules,

    setOpenedModuleIndex,
    handleResourceDelete,
  } = useContext(KymaModuleContext);
  const namespace = 'kyma-system';

  const { isProtected, protectedResourceWarning } = useProtectedResources();

  // Fetching all Module Templates can be replcaed with fetching one by one from api after implementing https://github.com/kyma-project/lifecycle-manager/issues/2232
  const {
    data: moduleTemplates,
    loading: moduleTemplateLoading,
  } = useModuleTemplatesQuery({ skip: !resourceName });
  if (moduleTemplateLoading || kymaResourceLoading) {
    return <Spinner />;
  }

  return (
    <DynamicPageComponent
      className="kyma-modules"
      showYamlTab={false}
      layoutNumber="startColumn"
      title={t('kyma-modules.title')}
      description={ResourceDescription}
      content={
        <>
          <ModulesList
            key="kyma-modules-list"
            resource={kymaResource}
            moduleTemplates={moduleTemplates}
            resourceName={resourceName}
            selectedModules={selectedModules}
            kymaResource={kymaResource}
            namespaced={namespaced}
            resourceUrl={resourceUrl}
            setOpenedModuleIndex={setOpenedModuleIndex}
            handleResourceDelete={handleResourceDelete}
          />
        </>
      }
      inlineEditForm={() => (
        <ResourceCreate
          isEdit={true}
          confirmText={t('common.buttons.save')}
          protectedResource={isProtected(kymaResource)}
          protectedResourceWarning={protectedResourceWarning(
            kymaResource,
            true,
          )}
          renderForm={props => (
            <ErrorBoundary>
              <Create
                resource={kymaResource}
                resourceUrl={resourceUrl}
                {...props}
              />
            </ErrorBoundary>
          )}
        />
      )}
    />
  );
}
