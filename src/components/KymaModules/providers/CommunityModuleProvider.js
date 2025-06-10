import { createContext, useContext, useEffect, useState } from 'react';
import { t } from 'i18next';
import { useGetInstalledModules } from '../hooks';
import { ModuleTemplatesContext } from './ModuleTemplatesProvider';
import { createPortal } from 'react-dom';
import { ModulesDeleteBox } from '../components/ModulesDeleteBox';
import { checkSelectedModule } from '../support';
import { Button } from '@ui5/webcomponents-react';
import { cloneDeep } from 'lodash';
import { useNotification } from 'shared/contexts/NotificationContext';
import { useCreateResource } from 'shared/ResourceForm/useCreateResource';

export const CommunityModuleContext = createContext({
  setOpenedModuleIndex: () => {},
  handleResourceDelete: () => {},
  deleteModuleButton: () => <></>,
  installedCommunityModules: [],
  communityModulesLoading: false,
  communityModuleTemplates: null,
});

export function CommunityModuleContextProvider({
  children,
  layoutState,
  showDeleteDialog,
  DeleteMessageBox,
  handleResourceDelete,
  setLayoutColumn,
}) {
  const [openedModuleIndex, setOpenedModuleIndex] = useState();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [initialUnchangedResource, setInitialUnchangedResource] = useState();
  const [kymaResourceState, setKymaResourceState] = useState();

  const notification = useNotification();
  const { moduleTemplatesLoading, communityModuleTemplates } = useContext(
    ModuleTemplatesContext,
  );

  const {
    installed: installedCommunityModules,
    loading: communityModulesLoading,
  } = useGetInstalledModules(communityModuleTemplates, moduleTemplatesLoading);
  /////////////////////////// TODO: Is it necessary? KymaResource? resourceUrl?
  const handleModuleUninstall = useCreateResource({
    singularName: 'Kyma',
    pluralKind: 'Kymas',
    resource: kymaResourceState,
    initialResource: initialUnchangedResource,
    updateInitialResource: setInitialUnchangedResource,
    createUrl:
      ' /apis/operator.kyma-project.io/v1beta2/namespaces/kyma-system/kymas/default',
    afterCreatedFn: () =>
      notification.notifySuccess({
        content: t('kyma-modules.module-uninstall'),
      }),
  });

  useEffect(() => {
    if (layoutState?.layout) {
      setDetailsOpen(layoutState?.layout !== 'OneColumn');
    }
  }, [layoutState]);

  useEffect(() => {
    /////////////////////////// TODO: Is it proper for KymaResource and KymaResourceState?
    if (installedCommunityModules?.[openedModuleIndex]?.resource) {
      setKymaResourceState(
        installedCommunityModules[openedModuleIndex].resource,
      );
      setInitialUnchangedResource(
        cloneDeep(installedCommunityModules[openedModuleIndex].resource),
      );
    }
  }, [installedCommunityModules, openedModuleIndex]);

  const deleteModuleButton = (
    <div>
      <Button onClick={() => handleResourceDelete({})} design="Transparent">
        {t('common.buttons.delete-module')}
      </Button>
    </div>
  );

  return (
    <CommunityModuleContext.Provider
      value={{
        setOpenedModuleIndex: setOpenedModuleIndex,
        showDeleteDialog: showDeleteDialog,
        installedCommunityModules: installedCommunityModules,
        communityModulesLoading: communityModulesLoading,
        DeleteMessageBox: DeleteMessageBox,
        deleteModuleButton: deleteModuleButton,
        handleResourceDelete: handleResourceDelete,
      }}
    >
      {createPortal(
        !communityModulesLoading &&
          !moduleTemplatesLoading &&
          showDeleteDialog && (
            <ModulesDeleteBox
              DeleteMessageBox={DeleteMessageBox}
              selectedModules={installedCommunityModules}
              chosenModuleIndex={
                openedModuleIndex ??
                // Find index of the selected module after a refresh or other case after which we have undefined.
                installedCommunityModules.findIndex(module =>
                  checkSelectedModule(module, layoutState),
                )
              }
              kymaResource={kymaResourceState}
              kymaResourceState={kymaResourceState}
              moduleTemplates={communityModuleTemplates}
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
    </CommunityModuleContext.Provider>
  );
}
