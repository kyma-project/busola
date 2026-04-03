import {
  createContext,
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { ToolbarButton } from '@ui5/webcomponents-react';

import { cloneDeep } from 'lodash';
import { t } from 'i18next';

import { useKymaQuery } from '../kymaModulesQueries';
import { useNotification } from 'shared/contexts/NotificationContext';
import { useCreateResource } from 'shared/ResourceForm/useCreateResource';
import {
  checkSelectedModule,
  findModuleStatus,
  KymaResourceType,
  ModuleTemplateType,
} from '../support';
import { ModulesDeleteBox } from '../components/ModulesDeleteBox';
import { ModuleTemplatesContext } from './ModuleTemplatesProvider';
import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';
import { useProtectedResources } from 'shared/hooks/useProtectedResources';
import { ProtectedResourceWarning } from 'shared/components/ProtectedResourcesButton';
import pluralize from 'pluralize';
import { ColumnLayoutState } from 'state/columnLayoutAtom';

type KymaModuleContextProviderProps = {
  children: ReactNode;
  setLayoutColumn: Dispatch<SetStateAction<ColumnLayoutState>>;
  layoutState: ColumnLayoutState;
  DeleteMessageBox: FC<{
    onDelete: () => void;
    onCancel: () => void;
    resourceName: string;
  }>;
  handleResourceDelete: (options: { moduleName?: string }) => void;
  showDeleteDialog: boolean;
  namespaced?: boolean;
  performDelete: () => void;
  performCancel: () => void;
};

type KymaModuleContextType = {
  resourceName: string | null;
  resourceUrl: string | null;
  kymaResource: KymaResourceType | null;
  kymaResourceLoading: boolean;
  initialUnchangedResource: KymaResourceType | null;
  kymaResourceState: KymaResourceType | undefined;
  setKymaResourceState: (state: KymaResourceType) => void;
  selectedModules: any;
  setOpenedModuleIndex: Dispatch<SetStateAction<number | null>>;
  handleResourceDelete: (options: { moduleName?: string }) => void;
  customHeaderActions: ReactNode;
  showDeleteDialog: boolean;
  DeleteMessageBox: FC<{
    onDelete: () => void;
    onCancel: () => void;
    resourceName: string;
  }>;
  isCommunityModuleSelected: boolean;
  namespaced: boolean;
  performDelete: () => void;
  performCancel: () => void;
  moduleTemplatesLoading: boolean;
};

export const KymaModuleContext = createContext<KymaModuleContextType>({
  resourceName: null,
  resourceUrl: null,
  kymaResource: null,
  kymaResourceLoading: false,
  initialUnchangedResource: null,
  kymaResourceState: undefined,
  setKymaResourceState: () => {},
  selectedModules: {},
  setOpenedModuleIndex: () => {},
  handleResourceDelete: () => {},
  customHeaderActions: <></>,
  showDeleteDialog: false,
  DeleteMessageBox: () => <></>,
  isCommunityModuleSelected: false,
  namespaced: false,
  performDelete: () => {},
  performCancel: () => {},
  moduleTemplatesLoading: false,
});

export function KymaModuleContextProvider({
  children,
  setLayoutColumn,
  layoutState,
  DeleteMessageBox,
  handleResourceDelete,
  showDeleteDialog,
  namespaced,
  performCancel,
  performDelete,
}: KymaModuleContextProviderProps) {
  const {
    data: kymaResource,
    loading: kymaResourceLoading,
    resourceUrl,
  } = useKymaQuery();

  const [activeKymaModules, setActiveKymaModules] = useState(
    kymaResource?.spec?.modules ?? [],
  );
  const [openedModuleIndex, setOpenedModuleIndex] = useState<number | null>(
    null,
  );
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [initialUnchangedResource, setInitialUnchangedResource] =
    useState<KymaResourceType | null>(null);
  const [kymaResourceState, setKymaResourceState] = useState<
    KymaResourceType | undefined
  >(undefined);
  const notification = useNotification();
  const { isProtected, isProtectedResource } = useProtectedResources();

  useEffect(() => {
    if (kymaResource) {
      const timeoutId = setTimeout(() => {
        setActiveKymaModules(kymaResource?.spec?.modules || []);
        setKymaResourceState(kymaResource);
        setInitialUnchangedResource(cloneDeep(kymaResource));
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  }, [kymaResource]);

  useEffect(() => {
    if (layoutState?.layout) {
      const timeoutId = setTimeout(() => {
        setDetailsOpen(layoutState?.layout !== 'OneColumn');
      }, 0);

      return () => clearTimeout(timeoutId);
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
        title: '',
      }),
  });

  const {
    moduleTemplates: kymaModuleTemplates,
    moduleTemplatesLoading,
    communityModuleTemplates,
  } = useContext(ModuleTemplatesContext);

  const getOpenedModuleIndex = (
    moduleIndex: number | null,
    activeModules?: any[],
  ) => {
    const index =
      moduleIndex ??
      // Find index of the selected module after a refresh or other case after which we have undefined.
      activeModules?.findIndex((module) =>
        checkSelectedModule(module, layoutState),
      );
    return index !== undefined && index > -1 ? index : undefined;
  };

  const getModuleName = () =>
    getOpenedModuleIndex(openedModuleIndex, activeKymaModules) !== undefined
      ? activeKymaModules[
          getOpenedModuleIndex(openedModuleIndex, activeKymaModules) ?? -1
        ]?.name
      : undefined;

  const isMaintenancePending = findModuleStatus(
    kymaResource as KymaResourceType,
    getModuleName(),
  )?.maintenance;

  const isCommunityModuleSelected = () => {
    const communityModulesNames = communityModuleTemplates?.items?.map(
      (module) =>
        pluralize(
          (module as ModuleTemplateType)?.metadata?.labels[
            'operator.kyma-project.io/module-name'
          ]?.replace('-', '') || '',
        ),
    );
    return communityModulesNames?.includes(
      layoutState?.midColumn?.resourceType ?? '',
    );
  };

  // Use isProtectedResource for showing the badge (always show if resource matches rules)
  const showProtectedResourceWarning =
    isProtectedResource(kymaResource) && !isCommunityModuleSelected();
  // Use isProtected for blocking modifications (considers user setting)
  const isResourceProtected =
    isProtected(kymaResource) && !isCommunityModuleSelected();

  const protectedBadge = showProtectedResourceWarning && (
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
        resourceName: kymaResource?.metadata?.name ?? null,
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
        isCommunityModuleSelected: isCommunityModuleSelected(),
        namespaced: !!namespaced,
        performDelete: performDelete,
        performCancel: performCancel,
        moduleTemplatesLoading: moduleTemplatesLoading,
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
              showDeleteDialog={showDeleteDialog}
              performDelete={performDelete}
              performCancel={performCancel}
              selectedModules={activeKymaModules}
              chosenModuleIndex={
                getOpenedModuleIndex(openedModuleIndex, activeKymaModules) ?? -1
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
              namespaced={!!namespaced}
            />
          ),
        document.body,
      )}
      {children}
    </KymaModuleContext.Provider>
  );
}
