import { createContext, useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@ui5/webcomponents-react';

import { cloneDeep } from 'lodash';
import { t } from 'i18next';

import { useKymaQuery } from '../kymaModulesQueries';
import { useNotification } from 'shared/contexts/NotificationContext';
import { useCreateResource } from 'shared/ResourceForm/useCreateResource';
import { checkSelectedModule } from '../support';
import { ModulesDeleteBox } from '../components/ModulesDeleteBox';
import { ModuleTemplatesContext } from './ModuleTemplatesProvider';

export const KymaModuleContext = createContext({
  resourceName: null,
  resourceUrl: null,
  kymaResource: null,
  kymaResourceLoading: false,
  initialUnchangedResource: null,
  kymaResourceState: null,
  setKymaResourceState: () => {},
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

  const { kymaModuleTemplates, moduleTemplatesLoading } = useContext(
    ModuleTemplatesContext,
  );

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
            moduleTemplates={kymaModuleTemplates}
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
