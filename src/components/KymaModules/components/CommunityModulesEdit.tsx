import { useTranslation } from 'react-i18next';
import { useFeature } from 'hooks/useFeature';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';
import { CollapsibleSection } from 'shared/ResourceForm/components/CollapsibleSection';
import CommunityModuleVersionSelect, {
  ModuleDisplayInfo,
} from 'components/KymaModules/components/CommunityModuleVersionSelect';
import { Spinner } from 'shared/components/Spinner/Spinner';
import {
  getAllResourcesYamls,
  getAvailableCommunityModules,
  VersionInfo,
} from 'components/KymaModules/components/communityModulesHelpers';
import {
  getModuleName,
  ModuleTemplateListType,
  ModuleTemplateType,
} from 'components/KymaModules/support';
import { Button } from '@ui5/webcomponents-react';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { UnsavedMessageBox } from 'shared/components/UnsavedMessageBox/UnsavedMessageBox';
import { createPortal } from 'react-dom';
import { SetterOrUpdater, useSetRecoilState } from 'recoil';
import { isResourceEditedState } from 'state/resourceEditedAtom';
import { useUploadResources } from 'resources/Namespaces/YamlUpload/useUploadResources';
import { PostFn, usePost } from 'shared/hooks/BackendAPI/usePost';
import { CommunityModuleContext } from 'components/KymaModules/providers/CommunityModuleProvider';
import {
  NotificationContextArgs,
  useNotification,
} from 'shared/contexts/NotificationContext';
import { ModuleTemplatesContext } from 'components/KymaModules/providers/ModuleTemplatesProvider';

const isModuleInstalled = (
  foundModuleTemplate: ModuleTemplateType,
  installedCommunityModules: ModuleTemplateListType,
) => {
  return installedCommunityModules.items.find(
    item =>
      item.metadata.name === foundModuleTemplate.metadata.name &&
      item.metadata.namespace === foundModuleTemplate.metadata.namespace,
  );
};

function onVersionChange(
  moduleTemplates: ModuleTemplateListType,
  installedModuleTemplates: ModuleTemplateListType,
  moduleTemplatesToApply: Map<string, ModuleTemplateType>,
  setModulesTemplatesToApply: SetterOrUpdater<Map<string, ModuleTemplateType>>,
  setIsResourceEdited: SetterOrUpdater<any>,
): any {
  return (value: string) => {
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
    const moduleTemplateToApply = moduleTemplatesToApply.get(moduleName);

    if (moduleTemplateToApply) {
      const moduleInstalled = isModuleInstalled(
        newModuleTemplateToApply,
        installedModuleTemplates,
      );
      if (moduleInstalled) {
        newModulesTemplatesToApply.delete(moduleName);
      } else {
        newModulesTemplatesToApply.set(moduleName, newModuleTemplateToApply);
      }
    } else {
      newModulesTemplatesToApply.set(moduleName, newModuleTemplateToApply);
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

function fetchResourcesToApply(
  communityModulesToApply: Map<string, ModuleTemplateType>,
  setResourcesToApply: Function,
  post: PostFn,
) {
  const resourcesLinks = [...communityModulesToApply.values()]
    .map(moduleTpl => moduleTpl.spec.resources)
    .flat()
    .map(item => item?.link || '');

  (async function() {
    try {
      const yamls = await getAllResourcesYamls(resourcesLinks, post);

      const yamlsResources = yamls?.map(resource => {
        return { value: resource };
      });

      setResourcesToApply(yamlsResources || []);
    } catch (e) {
      console.error(e);
    }
  })();
}

function onSave(
  uploadResources: Function,
  setIsResourceEdited: Function,
  notification: NotificationContextArgs,
  t: Function,
) {
  return () => {
    try {
      uploadResources();
      setIsResourceEdited({
        isEdited: false,
      });

      notification.notifySuccess({
        content: t('kyma-modules.modules-updated'),
      });
    } catch (e) {
      notification.notifyError({
        content: t('kyma-modules.modules-update-failed'),
      });
      console.error(e);
    }
  };
}

function transformDataForDisplay(
  availableCommunityModules: Map<string, VersionInfo[]>,
  t: Function,
): ModuleDisplayInfo[] {
  return Array.from(availableCommunityModules, ([moduleName, versions]) => {
    const formatDisplayText = (v: VersionInfo): string => {
      const version = `${v.channel ? v.channel + ' ' : ''}(v${v.version})${
        v.beta ? ' - Beta' : ''
      }`;
      if (v.installed) {
        return t('community-modules.installed') + ` ${version}`;
      } else {
        return version;
      }
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
      })),
    };
  });
}

export default function CommunityModulesEdit() {
  const { t } = useTranslation();
  const { isEnabled: isCommunityModulesEnabled } = useFeature(
    'COMMUNITY_MODULES',
  );
  const notification = useNotification();
  const post = usePost();
  const setIsResourceEdited = useSetRecoilState(isResourceEditedState);
  const [resourcesToApply, setResourcesToApply] = useState<{ value: any }[]>(
    [],
  );
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
    communityModuleTemplates,
    moduleReleaseMetasLoading,
    moduleReleaseMetas,
  } = useContext(ModuleTemplatesContext);
  const {
    installedCommunityModuleTemplates,
    installedCommunityModulesLoading,
  } = useContext(CommunityModuleContext);

  const availableCommunityModules = useMemo(() => {
    if (!moduleReleaseMetasLoading) {
      return getAvailableCommunityModules(
        communityModuleTemplates,
        installedCommunityModuleTemplates,
        moduleReleaseMetas,
      );
    } else {
      return new Map();
    }
  }, [
    communityModuleTemplates,
    moduleReleaseMetas,
    installedCommunityModuleTemplates,
    moduleReleaseMetasLoading,
  ]);

  useEffect(() => {
    fetchResourcesToApply(
      communityModulesTemplatesToApply,
      setResourcesToApply,
      post,
    );
  }, [communityModulesTemplatesToApply]); // eslint-disable-line react-hooks/exhaustive-deps

  if (installedCommunityModulesLoading || moduleTemplatesLoading) {
    return (
      <div style={{ height: 'calc(100vh - 14rem)' }}>
        <Spinner />
      </div>
    );
  }

  const communityModulesToDisplay = transformDataForDisplay(
    availableCommunityModules,
    t,
  );

  if (isCommunityModulesEnabled) {
    return (
      <section>
        <UI5Panel
          title={''}
          headerActions={
            <Button
              className="min-width-button"
              onClick={onSave(
                uploadResources,
                setIsResourceEdited,
                notification,
                t,
              )}
              design="Emphasized"
            >
              {t('common.buttons.save')}
            </Button>
          }
          children={
            <CollapsibleSection
              defaultTitleType
              defaultOpen={true}
              className="collapsible-margins"
              title={t('community-modules.title')}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '3fr 3fr',
                  gap: '0.5rem 1rem',
                }}
              >
                {communityModulesToDisplay &&
                  communityModulesToDisplay.map((module, idx) => {
                    return (
                      <CommunityModuleVersionSelect
                        key={`${module.name}+${idx}`}
                        module={module}
                        onChange={onVersionChange(
                          communityModuleTemplates,
                          installedCommunityModuleTemplates,
                          communityModulesTemplatesToApply,
                          setCommunityModulesTemplatesToApply,
                          setIsResourceEdited,
                        )}
                      />
                    );
                  })}
              </div>
            </CollapsibleSection>
          }
        ></UI5Panel>
        {createPortal(<UnsavedMessageBox />, document.body)}
      </section>
    );
  } else {
    return <></>;
  }
}
