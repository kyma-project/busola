import { useTranslation } from 'react-i18next';
import { useFeature } from 'hooks/useFeature';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';
import { CollapsibleSection } from 'shared/ResourceForm/components/CollapsibleSection';
import CommunityModuleVersionSelect from 'components/Modules/community/components/CommunityModuleVersionSelect';
import { Spinner } from 'shared/components/Spinner/Spinner';
import {
  fetchResourcesToApply,
  getAvailableCommunityModules,
  transformDataForDisplay,
} from 'components/Modules/community/communityModulesHelpers';
import {
  DEFAULT_K8S_NAMESPACE,
  getModuleName,
  ModuleTemplateListType,
  ModuleTemplateType,
} from 'components/Modules/support';
import { Button, Form, FormItem, MessageStrip } from '@ui5/webcomponents-react';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
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
import { useSetAtom } from 'jotai';
import { TFunction } from 'i18next';

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

function onSave(
  uploadResources: () => void,
  setIsResourceEdited: (_: any) => void,
  notification: NotificationContextArgs,
  t: TFunction,
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
    installedCommunityModules,
    installedCommunityModuleTemplates,
    installedCommunityModulesLoading,
    installedVersions,
  } = useContext(CommunityModuleContext);

  const availableCommunityModules = useMemo(() => {
    if (!moduleTemplatesLoading && !installedCommunityModulesLoading) {
      const allTemplates: ModuleTemplateListType = {
        items: [
          ...(installedCommunityModuleTemplates?.items || []),
          ...(communityModuleTemplates?.items || []),
        ],
      };
      return getAvailableCommunityModules(
        allTemplates,
        installedCommunityModuleTemplates,
        installedVersions,
      );
    } else {
      return new Map();
    }
  }, [
    communityModuleTemplates,
    moduleTemplatesLoading,
    installedCommunityModuleTemplates,
    installedCommunityModulesLoading,
    installedVersions,
  ]);

  const handleVersionChange = useCallback(
    (value?: string) => {
      if (!value) return;
      const [name, namespace] = value.split('|');
      const items = communityModuleTemplates.items as ModuleTemplateType[];
      const newModuleTemplateToApply = items.find(
        (item) =>
          item.metadata.namespace === namespace && item.metadata.name === name,
      );
      if (!newModuleTemplateToApply) {
        console.warn(`Can't find module template`);
        return;
      }

      const moduleName = getModuleName(newModuleTemplateToApply);

      setCommunityModulesTemplatesToApply((prev) => {
        const newMap = new Map(prev);
        const existingTemplate = prev.get(moduleName);

        if (existingTemplate) {
          const moduleInstalled = isModuleInstalled(
            newModuleTemplateToApply,
            installedCommunityModuleTemplates,
          );
          if (moduleInstalled) {
            newMap.delete(moduleName);
          } else {
            newMap.set(moduleName, newModuleTemplateToApply);
          }
        } else {
          newMap.set(moduleName, newModuleTemplateToApply);
        }

        setIsResourceEdited({ isEdited: newMap.size > 0 });
        return newMap;
      });
    },
    [
      communityModuleTemplates,
      installedCommunityModuleTemplates,
      setIsResourceEdited,
    ],
  );

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

  const installedModuleNames = new Set(
    installedCommunityModules.map((m) => m.name),
  );

  const communityModulesToDisplay = transformDataForDisplay(
    availableCommunityModules,
  ).filter((module) => installedModuleNames.has(module.name));

  if (isCommunityModulesEnabled) {
    return (
      <section>
        <UI5Panel
          testid={'community-modules-edit'}
          title={''}
          accessibleName={t('modules.community.accessible-name.edit')}
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
                    {communityModulesToDisplay.length !== 0 ? (
                      <div className={'edit'}>
                        {communityModulesToDisplay.map((module, idx) => (
                          <CommunityModuleVersionSelect
                            key={`${module.name}+${idx}`}
                            module={module}
                            onChange={handleVersionChange}
                          />
                        ))}
                      </div>
                    ) : installedCommunityModules.length !== 0 ? (
                      <Spinner />
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
