import { createContext, useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ToolbarButton } from '@ui5/webcomponents-react';

import { cloneDeep } from 'lodash';
import { t } from 'i18next';

import { useKymaQuery } from '../kymaModulesQueries';
import { useNotification } from 'shared/contexts/NotificationContext';
import { useCreateResource } from 'shared/ResourceForm/useCreateResource';
import { checkSelectedModule, findModuleStatus } from '../support';
import { ModulesDeleteBox } from '../components/ModulesDeleteBox';
import { ModuleTemplatesContext } from './ModuleTemplatesProvider';
import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';
import { useProtectedResources } from 'shared/hooks/useProtectedResources';
import { ProtectedResourceWarning } from 'shared/components/ProtectedResourcesButton';

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
  customHeaderActions: <></>,
  namespaced: false,
});

export function KymaModuleContextProvider({
  children,
  setLayoutColumn,
  layoutState,
  DeleteMessageBox,
  handleResourceDelete,
  showDeleteDialog,
  namespaced,
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

  const [initialUnchangedResource, setInitialUnchangedResource] = useState();
  const [kymaResourceState, setKymaResourceState] = useState();
  const notification = useNotification();
  const { isProtected } = useProtectedResources();

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

  const handleModuleUninstall = useCreateResource({
    singularName: 'Kyma',
    pluralKind: 'Kymas',
    resource: kymaResourceState,
    initialResource: initialUnchangedResource,
    updateInitialResource: setInitialUnchangedResource,
    createUrl: resourceUrl,
    afterCreatedFn: () =>
      notification.notifySuccess({
        content: t('kyma-modules.messages.module-uninstall'),
      }),
  });

  const { moduleTemplates: kymaModuleTemplates, moduleTemplatesLoading } =
    useContext(ModuleTemplatesContext);

  const getOpenedModuleIndex = (moduleIndex, activeModules) => {
    const index =
      moduleIndex ??
      // Find index of the selected module after a refresh or other case after which we have undefined.
      activeModules?.findIndex((module) =>
        checkSelectedModule(module, layoutState),
      );
    return index > -1 ? index : undefined;
  };

  const getModuleName = () =>
    getOpenedModuleIndex(openedModuleIndex, activeKymaModules) !== undefined
      ? activeKymaModules[
          getOpenedModuleIndex(openedModuleIndex, activeKymaModules)
        ]?.name
      : undefined;

  const isMaintenancePending = findModuleStatus(
    kymaResource,
    getModuleName(),
  )?.maintenance;

  const isResourceProtected = isProtected(kymaResource);

  const protectedBadge = isResourceProtected && (
    <ProtectedResourceWarning entry={kymaResource} />
  );

  const maintenanceBadge = isMaintenancePending === true && (
    <StatusBadge
      type="Critical"
      key={`pending-maintenance-${getModuleName()}`}
      tooltipContent={t('kyma-modules.maintenance-tooltip')}
    >
      {t('kyma-modules.maintenance-pending')}
    </StatusBadge>
  );

  const customHeaderActions = (
    <>
      {protectedBadge}
      {maintenanceBadge}
      <ToolbarButton
        disabled={isResourceProtected}
        onClick={() => handleResourceDelete({})}
        design="Transparent"
        text={t('common.buttons.delete-module')}
      />
    </>
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
        customHeaderActions: customHeaderActions,
      }}
    >
      {createPortal(
        getOpenedModuleIndex(openedModuleIndex, activeKymaModules) !==
          undefined &&
          !kymaResourceLoading &&
          !moduleTemplatesLoading &&
          showDeleteDialog && (
            <ModulesDeleteBox
              DeleteMessageBox={DeleteMessageBox}
              selectedModules={activeKymaModules}
              chosenModuleIndex={getOpenedModuleIndex(
                openedModuleIndex,
                activeKymaModules,
              )}
              kymaResource={kymaResource}
              kymaResourceState={kymaResourceState}
              moduleTemplates={kymaModuleTemplates}
              detailsOpen={detailsOpen}
              setKymaResourceState={setKymaResourceState}
              setInitialUnchangedResource={setInitialUnchangedResource}
              setChosenModuleIndex={setOpenedModuleIndex}
              handleModuleUninstall={handleModuleUninstall}
              setLayoutColumn={setLayoutColumn}
              namespaced={namespaced}
            />
          ),
        document.body,
      )}
      {children}
    </KymaModuleContext.Provider>
  );
}
