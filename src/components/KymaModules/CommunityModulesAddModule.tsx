import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useRecoilState } from 'recoil';
import { useFeature } from 'hooks/useFeature';
import { columnLayoutState } from 'state/columnLayoutAtom';
import { ResourceForm } from 'shared/ResourceForm';
import { MessageStrip } from '@ui5/webcomponents-react';
import { Spinner } from 'shared/components/Spinner/Spinner';
import {
  fetchResourcesToApply,
  getAvailableCommunityModules,
  VersionInfo,
} from 'components/KymaModules/components/communityModulesHelpers';
import {
  getModuleName,
  ModuleTemplateListType,
  ModuleTemplateType,
} from 'components/KymaModules/support';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { UnsavedMessageBox } from 'shared/components/UnsavedMessageBox/UnsavedMessageBox';
import { createPortal } from 'react-dom';
import { SetterOrUpdater, useSetRecoilState } from 'recoil';
import { isResourceEditedState } from 'state/resourceEditedAtom';
import { useUploadResources } from 'resources/Namespaces/YamlUpload/useUploadResources';
import { usePost } from 'shared/hooks/BackendAPI/usePost';
import { CommunityModuleContext } from 'components/KymaModules/providers/CommunityModuleProvider';
import CommunityModuleCard from 'components/KymaModules/components/CommunityModuleCard';

import { useNotification } from 'shared/contexts/NotificationContext';
import { ModuleTemplatesContext } from 'components/KymaModules/providers/ModuleTemplatesProvider';

import './KymaModulesAddModule.scss';
type VersionDisplayInfo = {
  moduleTemplate: {
    name: string;
    namespace: string;
  };
  version: string;
  channel: string;
  installed: boolean;
  textToDisplay: string;
  beta?: boolean;
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
  setModulesTemplatesToApply: SetterOrUpdater<Map<string, ModuleTemplateType>>,
  setIsResourceEdited: SetterOrUpdater<any>,
): any {
  return (value: string, shouldRemove: boolean) => {
    const newModulesTemplatesToApply = new Map(moduleTemplatesToApply);

    const [name, namespace] = value.split('|');
    const newModuleTemplateToApply = moduleTemplates.items.find(
      item =>
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
    const formatDisplayText = (v: VersionInfo): string => {
      const version = `${v.channel ? v.channel + ' ' : ''}(v${v.version})`;
      return version;
    };

    return {
      name: moduleName,
      versions: versions.map(v => ({
        moduleTemplate: {
          name: v.moduleTemplateName,
          namespace: v.moduleTemplateNamespace,
        },
        version: v.version,
        channel: v.channel ?? '',
        installed: v.installed ?? false,
        textToDisplay: formatDisplayText(v),
        beta: v.beta,
        icon: v.icon,
        docsURL: v.docsURL,
      })),
    };
  });
}

export default function CommunityModulesAddModule(props: any) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isEnabled: isCommunityModulesEnabled } = useFeature(
    'COMMUNITY_MODULES',
  );
  const notification = useNotification();
  const post = usePost();
  const setIsResourceEdited = useSetRecoilState(isResourceEditedState);
  const [resourcesToApply, setResourcesToApply] = useState<{ value: any }[]>(
    [],
  );
  const [layoutColumn, setLayoutColumn] = useRecoilState(columnLayoutState);

  const uploadResources = useUploadResources(
    resourcesToApply,
    setResourcesToApply,
    () => {},
    'default',
  );
  const [
    communityModulesTemplatesToApply,
    setCommunityModulesTemplatesToApply,
  ] = useState(new Map<string, ModuleTemplateType>());

  const {
    moduleTemplatesLoading,
    moduleReleaseMetasLoading,
    moduleReleaseMetas,
  } = useContext(ModuleTemplatesContext);
  const {
    installedCommunityModules,
    notInstalledCommunityModuleTemplates,
    installedCommunityModulesLoading: notInstalledCommunityModulesLoading,
  } = useContext(CommunityModuleContext);

  const availableCommunityModules = useMemo(() => {
    if (!moduleReleaseMetasLoading && notInstalledCommunityModuleTemplates) {
      return getAvailableCommunityModules(
        notInstalledCommunityModuleTemplates,
        {} as ModuleTemplateListType,
        moduleReleaseMetas,
      );
    } else {
      return new Map();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    notInstalledCommunityModuleTemplates,
    installedCommunityModules,
    moduleReleaseMetas,
    moduleReleaseMetasLoading,
  ]);

  useEffect(() => {
    fetchResourcesToApply(
      communityModulesTemplatesToApply,
      setResourcesToApply,
      post,
    );
  }, [communityModulesTemplatesToApply]); // eslint-disable-line react-hooks/exhaustive-deps

  const [columnsCount, setColumnsCount] = useState(2);
  const [
    cardsContainerRef,
    setCardsContainerRef,
  ] = useState<HTMLDivElement | null>(null);

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
  if (notInstalledCommunityModulesLoading || moduleTemplatesLoading) {
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
    try {
      uploadResources();

      notification.notifySuccess({
        content: t('modules.community.messages.success', {
          resourceType: 'Community Module',
        }),
      });

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
        content: t('modules.community.messages.failure', {
          resourceType: 'Community Module',
          error: e instanceof Error && e?.message ? e.message : '',
        }),
      });
    }
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

        {createPortal(<UnsavedMessageBox />, document.body)}
      </>
    );
  } else {
    return <></>;
  }
}
