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
  transformDataForDisplay,
} from 'components/Modules/community/communityModulesHelpers';
import {
  getModuleName,
  ModuleTemplateListType,
  ModuleTemplateType,
} from 'components/Modules/support';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { isResourceEditedAtom } from 'state/resourceEditedAtom';
import { refreshExtenshionsAtom } from 'state/refreshExtenshionsAtom';
import { PostFn, usePost } from 'shared/hooks/BackendAPI/usePost';
import { CommunityModuleContext } from 'components/Modules/community/providers/CommunityModuleProvider';
import CommunityModuleCard from 'components/Modules/community/components/CommunityModuleCard';
import {
  NotificationContextArgs,
  useNotification,
} from 'shared/contexts/NotificationContext';

import 'components/Modules/KymaModulesAddModule.scss';
import { useSingleGet } from 'shared/hooks/BackendAPI/useGet';
import {
  CommunityModulesInstallationContext,
  moduleInstallationState,
} from 'components/Modules/community/providers/CommunitModulesInstalationProvider';
import { State } from 'components/Modules/community/components/uploadStateAtom';
import { MutationFn, useUpdate } from 'shared/hooks/BackendAPI/useMutation';
import { useAtomValue } from 'jotai/index';
import { allNodesAtom } from 'state/navigation/allNodesAtom';
import {
  CallbackFn,
  installCommunityModule,
} from 'components/Modules/community/communityModulesInstallHelpers';
import { UnsavedMessageBox } from 'shared/components/UnsavedMessageBox/UnsavedMessageBox';
import { createPortal } from 'react-dom';
import { Description } from 'shared/components/Description/Description';
import { CommunityModulesSourcesList } from './components/CommunityModulesSourcesList/CommunityModulesSourcesList';
import { TFunction } from 'i18next';

function onVersionChange(
  moduleTemplates: ModuleTemplateListType,
  moduleTemplatesToApply: { map: Map<string, ModuleTemplateType> },
  setModulesTemplatesToApply: (
    update: SetStateAction<{ map: Map<string, ModuleTemplateType> }>,
  ) => void,
  setIsResourceEdited: (update: SetStateAction<any>) => void,
): any {
  return (value: string, shouldRemove: boolean) => {
    const newModulesTemplatesToApply = new Map(moduleTemplatesToApply.map);

    const [name, namespace] = value.split('|');
    const newModuleTemplateToApply = moduleTemplates.items.find(
      (item) =>
        item.metadata.namespace === namespace && item.metadata.name === name,
    );
    if (!newModuleTemplateToApply) {
      console.warn(`Can't find module template`);
      return;
    }

    const moduleName = getModuleName(newModuleTemplateToApply);

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

    setModulesTemplatesToApply({ map: newModulesTemplatesToApply });
  };
}

async function upload(
  t: TFunction,
  communityModulesTemplatesToUpload: { map: Map<string, ModuleTemplateType> },
  setModulesTemplatesToUpload: React.Dispatch<
    SetStateAction<{ map: Map<string, ModuleTemplateType> }>
  >,
  clusterNodes: any,
  namespaceNodes: any,
  postRequest: PostFn,
  patchRequest: MutationFn,
  singleGet: (_: any) => Promise<Response>,
  notification: NotificationContextArgs,
  callback: CallbackFn,
) {
  if (communityModulesTemplatesToUpload.map.size === 0) {
    return;
  }

  try {
    let errorOccurred = false;
    for (const module of communityModulesTemplatesToUpload.map.values()) {
      try {
        notification.notifySuccess({
          content: t('modules.community.messages.upload', {
            resourceType: getModuleName(module),
          }),
        });

        await installCommunityModule(
          module,
          clusterNodes,
          namespaceNodes,
          postRequest,
          patchRequest,
          singleGet,
          callback,
        );
      } catch (e) {
        errorOccurred = true;
        notification.notifyError({
          content: t('modules.community.messages.install-failure', {
            resourceType: getModuleName(module),
            error: e instanceof Error && e?.message ? e.message : '',
          }),
        });
      }
    }
    setModulesTemplatesToUpload({ map: new Map() });
    if (!errorOccurred) {
      notification.notifySuccess({
        content: t('modules.community.messages.success', {
          resourceType: 'Community Module',
        }),
      });
    }
  } catch (e) {
    console.error(e);
    notification.notifyError({
      content: t('modules.community.messages.install-failure', {
        resourceType: 'Community Module',
        error: e instanceof Error && e?.message ? e.message : '',
      }),
    });
  }
}

export default function CommunityModulesAddModule(props: any) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isEnabled: isCommunityModulesEnabled } =
    useFeature('COMMUNITY_MODULES');
  const setIsResourceEdited = useSetAtom(isResourceEditedAtom);

  const [refreshExtenshionsCount, setRefreshExtenshions] = useAtom(
    refreshExtenshionsAtom,
  );
  const notification = useNotification();
  const postRequest = usePost();
  const patchRequest = useUpdate();

  const singleGet = useSingleGet();
  const clusterNodes = useAtomValue(allNodesAtom).filter(
    (node) => !node.namespaced,
  );
  const namespaceNodes = useAtomValue(allNodesAtom).filter(
    (node) => node.namespaced,
  );

  const [layoutColumn, setLayoutColumn] = useAtom(columnLayoutAtom);

  const [
    communityModulesTemplatesToApply,
    setCommunityModulesTemplatesToApply,
  ] = useState({ map: new Map<string, ModuleTemplateType>() });

  const {
    notInstalledCommunityModuleTemplates,
    installedCommunityModuleTemplates,
    installedCommunityModulesLoading: notInstalledCommunityModulesLoading,
    installedVersions,
  } = useContext(CommunityModuleContext);

  const { callback, modulesDuringUpload } = useContext(
    CommunityModulesInstallationContext,
  );

  const upgradeableCommunityModuleTemplates = useMemo(() => {
    if (!installedCommunityModuleTemplates?.items) {
      return { items: [] };
    }

    const upgradeable = installedCommunityModuleTemplates.items.filter(
      (module) => {
        const managerKey = `${module.metadata.name}:${module.spec?.manager?.namespace}`;
        const installedVersion = installedVersions.get(managerKey);
        return installedVersion && installedVersion !== module.spec.version;
      },
    );

    return { items: upgradeable };
  }, [installedCommunityModuleTemplates, installedVersions]);

  const modulesToHide = useMemo(() => {
    return new Set(
      modulesDuringUpload
        .filter((m: moduleInstallationState) => m.state !== State.Error)
        .map((m: moduleInstallationState) => getModuleName(m.moduleTpl)),
    );
  }, [modulesDuringUpload]);

  const allAvailableModuleTemplates = useMemo(() => {
    const combinedItems = [
      ...(notInstalledCommunityModuleTemplates?.items || []),
      ...(upgradeableCommunityModuleTemplates?.items || []),
    ].filter((module) => !modulesToHide.has(getModuleName(module)));
    return { items: combinedItems };
  }, [
    notInstalledCommunityModuleTemplates,
    upgradeableCommunityModuleTemplates,
    modulesToHide,
  ]);

  const availableCommunityModules = useMemo(() => {
    if (!notInstalledCommunityModulesLoading) {
      return getAvailableCommunityModules(
        allAvailableModuleTemplates,
        {} as ModuleTemplateListType,
      );
    } else {
      return new Map();
    }
  }, [allAvailableModuleTemplates, notInstalledCommunityModulesLoading]);

  const [columnsCount, setColumnsCount] = useState(2);
  const [cardsContainerRef, setCardsContainerRef] =
    useState<HTMLDivElement | null>(null);

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
    const sth = !!communityModulesTemplatesToApply.map.get(name);
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
            allAvailableModuleTemplates,
            communityModulesTemplatesToApply,
            setCommunityModulesTemplatesToApply,
            setIsResourceEdited,
          )}
          selectedModules={communityModulesTemplatesToApply.map}
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
    for (const module of communityModulesTemplatesToApply.map.values()) {
      callback(module, State.Downloading);
    }
    upload(
      t,
      communityModulesTemplatesToApply,
      setCommunityModulesTemplatesToApply,
      clusterNodes,
      namespaceNodes,
      postRequest,
      patchRequest,
      singleGet,
      notification,
      callback,
    );
    navigate(window.location.pathname, { replace: true });
    setRefreshExtenshions(refreshExtenshionsCount + 1);
    setLayoutColumn({
      ...layoutColumn,
      layout: 'OneColumn',
      midColumn: null,
      endColumn: null,
      showCreate: null,
    });
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
            <MessageStrip
              design="Critical"
              hideCloseButton
              className="sap-margin-top-small"
            >
              <Description
                i18nKey={'modules.community.sla-warning'}
                url={'https://kyma-project.io/#/community-modules/user/README'}
              />
            </MessageStrip>
            <CommunityModulesSourcesList />
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
        {createPortal(<UnsavedMessageBox />, document.body)}
      </>
    );
  } else {
    return <></>;
  }
}
