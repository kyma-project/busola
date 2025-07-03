import { useTranslation } from 'react-i18next';
import { useFeature } from 'hooks/useFeature';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';
import { CollapsibleSection } from 'shared/ResourceForm/components/CollapsibleSection';
import CommunityModuleEdit, {
  ModuleDisplayInfo,
} from 'components/KymaModules/components/CommunityModuleEdit';
import { Spinner } from 'shared/components/Spinner/Spinner';
import {
  getAllResourcesYamls,
  getAvailableCommunityModules,
  VersionInfo,
} from 'components/KymaModules/components/CommunityModulesHelpers';
import {
  getModuleName,
  ModuleReleaseMetaListType,
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

type CommunityModulesEditProp = {
  moduleReleaseMetas: ModuleReleaseMetaListType;
};

// TODO: detect if version return to the initial one to setChanged to false
function onCommunityChange(
  communityModules: ModuleTemplateListType,
  installedCommunityModules: ModuleTemplateListType,
  communityModulesToApply: Map<string, any>,
  setCommunityModulesToApply: SetterOrUpdater<any>,
  setIsResourceEdited: SetterOrUpdater<any>,
): any {
  return (module: string, value: string) => {
    console.log(module, value);
    const [name, namespace] = value.split('|');
    const moduleTemplate = {
      name,
      namespace,
    };
    const newModulesToUpdated = new Map(communityModulesToApply);

    // TODO: refactor it
    const foundModule = communityModules.items.find(
      item =>
        item.metadata.namespace === moduleTemplate.namespace &&
        item.metadata.name === moduleTemplate.name,
    );
    if (foundModule) {
      const moduleToUpdate = communityModulesToApply.get(
        getModuleName(foundModule),
      );
      if (moduleToUpdate) {
        const installedModule = installedCommunityModules.items.find(
          item =>
            getModuleName(item) === foundModule.metadata.name &&
            item.metadata.namespace === foundModule.metadata.namespace,
        );
        if (installedModule) {
          newModulesToUpdated.delete(getModuleName(foundModule));
        } else {
          newModulesToUpdated.set(getModuleName(foundModule), foundModule);
        }
        //   Delete if installed or update if not installed
      } else {
        newModulesToUpdated.set(getModuleName(foundModule), foundModule);
      }
    } else {
    }

    console.log('Modules to Update', newModulesToUpdated);
    if (newModulesToUpdated.size === 0) {
      setIsResourceEdited({
        isEdited: false,
      });
    } else {
      setIsResourceEdited({
        isEdited: true,
      });
    }
    setCommunityModulesToApply(newModulesToUpdated);
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
      console.log('Saving version change');
      uploadResources();
      setIsResourceEdited({
        isEdited: false,
      });

      notification.notifySuccess({
        content: t('kyma-modules.module-updated'),
      });
    } catch (e) {
      notification.notifyError({
        content: t('kyma-modules.module-update-failed'),
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
      const version =
        (v.channel ? v.channel + ' ' : '') +
        `(v${v.version})` +
        (v.beta ? '- Beta' : '');
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

export default function CommunityModulesEdit({
  moduleReleaseMetas,
}: CommunityModulesEditProp) {
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
  const [communityModulesToApply, setCommunityModulesToApply] = useState(
    new Map<string, ModuleTemplateType>(),
  );

  const { moduleTemplatesLoading, communityModuleTemplates } = useContext(
    ModuleTemplatesContext,
  );
  const {
    installedCommunityModuleTemplates,
    installedCommunityModulesLoading,
  } = useContext(CommunityModuleContext);

  const availableCommunityModules = useMemo(() => {
    return getAvailableCommunityModules(
      communityModuleTemplates,
      installedCommunityModuleTemplates,
      moduleReleaseMetas,
    );
  }, [
    communityModuleTemplates,
    moduleReleaseMetas,
    installedCommunityModuleTemplates,
  ]);

  useEffect(() => {
    fetchResourcesToApply(communityModulesToApply, setResourcesToApply, post);
  }, [communityModulesToApply]);

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
                  communityModulesToDisplay.map(module => {
                    return (
                      <CommunityModuleEdit
                        module={module}
                        onChange={onCommunityChange(
                          communityModuleTemplates,
                          installedCommunityModuleTemplates,
                          communityModulesToApply,
                          setCommunityModulesToApply,
                          setIsResourceEdited,
                        )}
                      />
                    );
                  })}
              </div>
              {/*</Form>*/}
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
