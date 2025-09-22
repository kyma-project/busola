import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { SetStateAction, useAtom, useSetAtom } from 'jotai';
import { useFeature } from 'hooks/useFeature';
import { columnLayoutAtom } from 'state/columnLayoutAtom';
import { ResourceForm } from 'shared/ResourceForm';
import { MessageStrip } from '@ui5/webcomponents-react';
import { Spinner } from 'shared/components/Spinner/Spinner';
import {
  getAvailableCommunityModules,
  installCommunityModule,
  VersionInfo,
} from 'components/Modules/community/communityModulesHelpers';
import {
  getModuleName,
  ModuleTemplateListType,
  ModuleTemplateType,
} from 'components/Modules/support';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { UnsavedMessageBox } from 'shared/components/UnsavedMessageBox/UnsavedMessageBox';
import { createPortal } from 'react-dom';
import { isResourceEditedAtom } from 'state/resourceEditedAtom';
import { usePost } from 'shared/hooks/BackendAPI/usePost';
import { CommunityModuleContext } from 'components/Modules/community/providers/CommunityModuleProvider';
import CommunityModuleCard from 'components/Modules/community/components/CommunityModuleCard';
import { allNodesAtom } from 'state/navigation/allNodesAtom';
import { useNotification } from 'shared/contexts/NotificationContext';

import 'components/Modules/KymaModulesAddModule.scss';
import { useUpdate } from 'shared/hooks/BackendAPI/useMutation';
import { useAtomValue } from 'jotai/index';
import UploadDialog from 'components/Modules/community/components/UploadDialog';
import {
  State,
  uploadStateAtom,
} from 'components/Modules/community/components/uploadStateAtom';
import { useSingleGet } from 'shared/hooks/BackendAPI/useGet';

type VersionDisplayInfo = {
  moduleTemplate: {
    name: string;
    namespace: string;
  };
  version: string;
  installed: boolean;
  textToDisplay: string;
  icon?: { link: string; name: string };
  docsURL?: string;
};
type ModuleDisplayInfo = {
  name: string;
  versions: VersionDisplayInfo[];
};

function onVersionChange(
  moduleTemplates: ModuleTemplateListType,
  moduleTemplatesToApply: Map<string, ModuleTemplateType>,
  setModulesTemplatesToApply: (
    update: SetStateAction<Map<string, ModuleTemplateType>>,
  ) => void,
  setIsResourceEdited: (update: SetStateAction<any>) => void,
): any {
  return (value: string, shouldRemove: boolean) => {
    const newModulesTemplatesToApply = new Map(moduleTemplatesToApply);

    const [name, namespace] = value.split('|');
    const newModuleTemplateToApply = moduleTemplates.items.find(
      (item) =>
        item.metadata.namespace === namespace && item.metadata.name === name,
    );
    if (!newModuleTemplateToApply) {
      console.warn(`Can't find module template`);
      return;
    }

    let moduleName = getModuleName(newModuleTemplateToApply);

    if (shouldRemove) {
      newModulesTemplatesToApply.delete(moduleName);
    } else if (newModuleTemplateToApply) {
      newModulesTemplatesToApply.set(
        getModuleName(newModuleTemplateToApply),
        newModuleTemplateToApply,
      );
    }
    if (newModulesTemplatesToApply.size === 0) {
      setIsResourceEdited({
        isEdited: false,
      });
    } else {
      setIsResourceEdited({
        isEdited: true,
      });
    }

    setModulesTemplatesToApply(newModulesTemplatesToApply);
  };
}

function transformDataForDisplay(
  availableCommunityModules: Map<string, VersionInfo[]>,
): ModuleDisplayInfo[] {
  return Array.from(availableCommunityModules, ([moduleName, versions]) => {
    return {
      name: moduleName,
      versions: versions.map((v) => ({
        moduleTemplate: {
          name: v.moduleTemplateName,
          namespace: v.moduleTemplateNamespace,
        },
        version: v.version,
        installed: v.installed ?? false,
        textToDisplay: `v${v.version}`,
        icon: v.icon,
        docsURL: v.docsURL,
      })),
    };
  });
}

export default function CommunityModulesAddModule(props: any) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isEnabled: isCommunityModulesEnabled } =
    useFeature('COMMUNITY_MODULES');
  const notification = useNotification();
  const postRequest = usePost();
  const singleGet = useSingleGet();
  const setIsResourceEdited = useSetAtom(isResourceEditedAtom);
  const [resourcesToApply, setResourcesToApply] = useState<{ value: any }[]>(
    [],
  );
  const [layoutColumn, setLayoutColumn] = useAtom(columnLayoutAtom);

  const [
    communityModulesTemplatesToApply,
    setCommunityModulesTemplatesToApply,
  ] = useState(new Map<string, ModuleTemplateType>());

  const {
    notInstalledCommunityModuleTemplates,
    installedCommunityModulesLoading: notInstalledCommunityModulesLoading,
  } = useContext(CommunityModuleContext);

  const availableCommunityModules = useMemo(() => {
    if (!notInstalledCommunityModulesLoading) {
      return getAvailableCommunityModules(
        notInstalledCommunityModuleTemplates,
        {} as ModuleTemplateListType,
      );
    } else {
      return new Map();
    }
  }, [
    notInstalledCommunityModuleTemplates,
    notInstalledCommunityModulesLoading,
  ]);

  const [columnsCount, setColumnsCount] = useState(2);
  const [cardsContainerRef, setCardsContainerRef] =
    useState<HTMLDivElement | null>(null);

  const patchRequest = useUpdate();
  const clusterNodes = useAtomValue(allNodesAtom).filter(
    (node) => !node.namespaced,
  );
  const namespaceNodes = useAtomValue(allNodesAtom).filter(
    (node) => node.namespaced,
  );

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadState, setUploadState] = useAtom(uploadStateAtom);

  const calculateColumns = useCallback(() => {
    if (cardsContainerRef?.clientWidth) {
      const containerWidth = cardsContainerRef?.clientWidth;
      const cardWidth = 350;
      const gap = 16;
      const colNumber = Math.max(
        1,
        Math.floor((containerWidth + gap) / (cardWidth + gap)),
      );
      return colNumber;
    }
    return 2;
  }, [cardsContainerRef]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      setColumnsCount(calculateColumns());
    });

    if (cardsContainerRef) {
      resizeObserver.observe(cardsContainerRef);
    }

    return () => {
      if (cardsContainerRef) {
        resizeObserver.unobserve(cardsContainerRef);
      }
    };
  }, [cardsContainerRef, calculateColumns]);
  if (notInstalledCommunityModulesLoading) {
    return (
      <div style={{ height: 'calc(100vh - 14rem)' }}>
        <Spinner />
      </div>
    );
  }

  const communityModulesToDisplay = transformDataForDisplay(
    availableCommunityModules,
  );

  const isChecked = (name: string) => {
    const sth = !!communityModulesTemplatesToApply.get(name);
    return sth;
  };
  const renderCards = () => {
    const columns = Array.from({ length: columnsCount }, (): any => []);

    communityModulesToDisplay?.forEach((module, i) => {
      const card = (
        <CommunityModuleCard
          module={module}
          key={`${module.name}+${i}`}
          isChecked={isChecked}
          onChange={onVersionChange(
            notInstalledCommunityModuleTemplates,
            communityModulesTemplatesToApply,
            setCommunityModulesTemplatesToApply,
            setIsResourceEdited,
          )}
          selectedModules={communityModulesTemplatesToApply}
        />
      );
      columns[i % columnsCount].push(card);
    });

    return (
      <div
        className="gridbox-addModule sap-margin-top-small"
        ref={setCardsContainerRef}
      >
        {columns.map((column, columnIndex) => (
          <div
            className={`gridbox-addModule-column column-${columnIndex}`}
            key={columnIndex}
          >
            {column}
          </div>
        ))}
      </div>
    );
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setUploadModalOpen(true);
    (async function () {
      try {
        const callBack = (
          moduleName: string,
          moduleState: State,
          message?: string,
        ) => {
          console.log(moduleState);
          const moduleStateToUpdate = uploadState?.find(
            (uploadState) => uploadState.moduleName === moduleName,
          );
          if (!moduleStateToUpdate) {
            const newUploadState = {
              moduleName,
              message: message || '',
              state: moduleState,
            };
            setUploadState([...uploadState, newUploadState]);
            console.log(newUploadState);
            return;
          }

          const uploadStateToUpdate = uploadState?.map((uploadState) => {
            if (uploadState.moduleName === moduleName) {
              uploadState.state = moduleState;
              uploadState.message = message || '';
              return uploadState;
            } else {
              return uploadState;
            }
          });
          console.log(uploadStateToUpdate);
          setUploadState(uploadStateToUpdate);
        };

        const operationPromises = communityModulesTemplatesToApply
          .values()
          .map((moduleTemplate) =>
            installCommunityModule(
              moduleTemplate,
              clusterNodes,
              namespaceNodes,
              postRequest,
              patchRequest,
              singleGet,
              callBack,
            ),
          );
        await Promise.allSettled(operationPromises);

        notification.notifySuccess({
          content: t('modules.community.messages.success', {
            resourceType: 'Community Module',
          }),
        });

        setUploadModalOpen(false);
        setUploadState([]);
        setLayoutColumn({
          ...layoutColumn,
          layout: 'OneColumn',
          midColumn: null,
          endColumn: null,
          showCreate: null,
        });
        navigate(window.location.pathname, { replace: true });
      } catch (e) {
        console.error(e);
        notification.notifyError({
          content: t('modules.community.messages.install-failure', {
            resourceType: 'Community Module',
            error: e instanceof Error && e?.message ? e.message : '',
          }),
        });
      }
    })();
  };

  if (isCommunityModulesEnabled) {
    return (
      <>
        <ResourceForm
          {...props}
          disableDefaultFields
          formElementRef={props.formElementRef}
          onChange={props.onChange}
          layoutNumber="startColumn"
          resetLayout
          afterCreatedCustomMessage={t(
            'modules.community.messages.module-added',
          )}
          formWithoutPanel
          className="add-modules-form"
          onSubmit={handleSubmit}
        >
          <>
            {communityModulesToDisplay?.length !== 0 ? (
              renderCards()
            ) : (
              <MessageStrip
                design="Critical"
                hideCloseButton
                className="sap-margin-top-small"
              >
                {t('modules.community.no-modules')}
              </MessageStrip>
            )}
          </>
        </ResourceForm>
        {uploadModalOpen &&
          createPortal(<UploadDialog state={uploadState} />, document.body)}
        {createPortal(<UnsavedMessageBox />, document.body)}
      </>
    );
  } else {
    return <></>;
  }
}
