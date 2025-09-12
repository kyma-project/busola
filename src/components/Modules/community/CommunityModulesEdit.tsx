import { useTranslation } from 'react-i18next';
import { useFeature } from 'hooks/useFeature';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';
import { CollapsibleSection } from 'shared/ResourceForm/components/CollapsibleSection';
import CommunityModuleVersionSelect, {
  ModuleDisplayInfo,
} from 'components/Modules/community/components/CommunityModuleVersionSelect';
import { Spinner } from 'shared/components/Spinner/Spinner';
import {
  fetchResourcesToApply,
  getAvailableCommunityModules,
  VersionInfo,
} from 'components/Modules/community/communityModulesHelpers';
import {
  DEFAULT_K8S_NAMESPACE,
  getModuleName,
  ModuleTemplateListType,
  ModuleTemplateType,
} from 'components/Modules/support';
import { Button, Form, FormItem, MessageStrip } from '@ui5/webcomponents-react';
import { useContext, useEffect, useMemo, useState } from 'react';
import { UnsavedMessageBox } from 'shared/components/UnsavedMessageBox/UnsavedMessageBox';
import { createPortal } from 'react-dom';
import { isResourceEditedAtom } from 'state/resourceEditedAtom';
import { useUploadResources } from 'resources/Namespaces/YamlUpload/useUploadResources';
import { usePost } from 'shared/hooks/BackendAPI/usePost';
import { CommunityModuleContext } from 'components/Modules/community/providers/CommunityModuleProvider';
import {
  NotificationContextArgs,
  useNotification,
} from 'shared/contexts/NotificationContext';
import { ModuleTemplatesContext } from 'components/Modules/providers/ModuleTemplatesProvider';

import 'components/Modules/community/CommunityModule.scss';
import { SetStateAction, useSetAtom } from 'jotai';

const isModuleInstalled = (
  foundModuleTemplate: ModuleTemplateType,
  installedCommunityModules: ModuleTemplateListType,
) => {
  return installedCommunityModules.items.find(
    (item) =>
      item.metadata.name === foundModuleTemplate.metadata.name &&
      item.metadata.namespace === foundModuleTemplate.metadata.namespace,
  );
};

function onVersionChange(
  moduleTemplates: ModuleTemplateListType,
  installedModuleTemplates: ModuleTemplateListType,
  moduleTemplatesToApply: Map<string, ModuleTemplateType>,
  setModulesTemplatesToApply: (
    update: SetStateAction<Map<string, ModuleTemplateType>>,
  ) => void,
  setIsResourceEdited: (update: SetStateAction<any>) => void,
): any {
  return (value: string) => {
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
        content: t('modules.community.messages.modules-updated'),
      });
    } catch (e) {
      notification.notifyError({
        content: t('modules.community.messages.modules-update-failed'),
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
      })),
    };
  });
}

export default function CommunityModulesEdit() {
  const { t } = useTranslation();
  const { isEnabled: isCommunityModulesEnabled } =
    useFeature('COMMUNITY_MODULES');
  const notification = useNotification();
  const post = usePost();
  const setIsResourceEdited = useSetAtom(isResourceEditedAtom);
  const [resourcesToApply, setResourcesToApply] = useState<{ value: any }[]>(
    [],
  );
  const uploadResources = useUploadResources(
    resourcesToApply,
    setResourcesToApply,
    () => {},
    DEFAULT_K8S_NAMESPACE,
  );
  const [
    communityModulesTemplatesToApply,
    setCommunityModulesTemplatesToApply,
  ] = useState(new Map<string, ModuleTemplateType>());

  const { moduleTemplatesLoading, communityModuleTemplates } = useContext(
    ModuleTemplatesContext,
  );
  const {
    installedCommunityModuleTemplates,
    installedCommunityModulesLoading,
  } = useContext(CommunityModuleContext);

  const availableCommunityModules = useMemo(() => {
    if (!moduleTemplatesLoading && !installedCommunityModulesLoading) {
      return getAvailableCommunityModules(
        communityModuleTemplates,
        installedCommunityModuleTemplates,
      );
    } else {
      return new Map();
    }
  }, [
    communityModuleTemplates,
    moduleTemplatesLoading,
    installedCommunityModuleTemplates,
    installedCommunityModulesLoading,
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
          testid={'community-modules-edit'}
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
        >
          <div className={'community-modules'}>
            <Form
              className="resource-form ui5-content-density-compact"
              labelSpan="S0 M0 L0 XL0"
              layout="S1 M1 L1 XL1"
            >
              <FormItem>
                <div className={'sap-margin-bottom-tiny'}>
                  <CollapsibleSection
                    defaultTitleType
                    defaultOpen={true}
                    className="collapsible-margins"
                    title={t('modules.community.title')}
                  >
                    {installedCommunityModuleTemplates.items.length !== 0 ? (
                      <div className={'edit'}>
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
                    ) : (
                      <MessageStrip
                        design="Critical"
                        hideCloseButton
                        className="sap-margin-top-small"
                      >
                        {t('modules.community.no-modules-installed')}
                      </MessageStrip>
                    )}
                  </CollapsibleSection>
                </div>
              </FormItem>
            </Form>
          </div>
        </UI5Panel>
        {createPortal(<UnsavedMessageBox />, document.body)}
      </section>
    );
  } else {
    return <></>;
  }
}
