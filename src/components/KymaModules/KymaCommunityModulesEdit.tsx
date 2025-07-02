import { useTranslation } from 'react-i18next';
import { useFeature } from 'hooks/useFeature';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';
import { CollapsibleSection } from 'shared/ResourceForm/components/CollapsibleSection';
import CommunityModuleEdit from 'components/KymaModules/components/ModuleEdit';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { getAvailableCommunityModules, VersionInfo } from 'components/KymaModules/components/CommunityModulesHelpers';
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
import { getAllResourcesYamls } from 'components/KymaModules/tmpInstallHelpers';
import { usePost } from 'shared/hooks/BackendAPI/usePost';
import { CommunityModuleContext } from 'components/KymaModules/providers/CommunityModuleProvider';
import { useNotification } from 'shared/contexts/NotificationContext';
import { ModuleTemplatesContext } from 'components/KymaModules/providers/ModuleTemplatesProvider';

type CommunityModulesEditProp = {
  communityModules: ModuleTemplateListType;
  moduleReleaseMetas: ModuleReleaseMetaListType;
  loadingModuleTemplates: boolean;
};


// TODO: detect if version return to the initial one to setChanged to false
function onCommunityChange(communityModules: ModuleTemplateListType, installedCommunityModules: ModuleTemplateListType, communityModulesToApply: Map<string, any>, setCommunityModulesToApply: SetterOrUpdater<any>, setIsResourceEdited: SetterOrUpdater<any>): any {
  return (module: string, value: string) => {
    console.log(module, value);
    const [name, namespace] = value.split('|');
    const moduleTemplate = {
      name,
      namespace,
    };
    const newModulesToUpdated = new Map(communityModulesToApply);


    // TODO: refactor it
    const foundModule = communityModules.items.find(item => item.metadata.namespace === moduleTemplate.namespace && item.metadata.name === moduleTemplate.name);
    if (foundModule) {
      const moduleToUpdate = communityModulesToApply.get(getModuleName(foundModule));
      if (moduleToUpdate) {
        const installedModule = installedCommunityModules.items.find(item => getModuleName(item) === foundModule.metadata.name && item.metadata.namespace === foundModule.metadata.namespace);
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

export default function CommunityModulesEdit({
                                               communityModules,
                                               moduleReleaseMetas,
                                               loadingModuleTemplates,
                                             }: CommunityModulesEditProp) {
  const { t } = useTranslation();
  const { isEnabled: isCommunityModulesEnabled } = useFeature(
    'COMMUNITY_MODULES',
  );

  const notification = useNotification();
  const { moduleTemplatesLoading, communityModuleTemplates } = useContext(
    ModuleTemplatesContext,
  );
  const { installedCommunityModules, installedCommunityModulesLoading } = useContext(CommunityModuleContext);

  const [resourcesToApply, setResourcesToApply] = useState<{ value: any }[]>([]);
  const uploadResources = useUploadResources(resourcesToApply, setResourcesToApply, () => {
  }, 'default');


  const post = usePost();
  const [communityModulesToApply, setCommunityModulesToApply] = useState(new Map<string, ModuleTemplateType>());
  const setIsResourceEdited = useSetRecoilState(isResourceEditedState);


  console.log(installedCommunityModules)
  const availableCommunityModules = useMemo(() => {
    return getAvailableCommunityModules(
      communityModuleTemplates,
      installedCommunityModules,
      moduleReleaseMetas,
    );
  }, [communityModuleTemplates, moduleReleaseMetas, installedCommunityModules]);

  // TODO: this code is from Agata
  useEffect(() => {
    const resourcesLinks = [...communityModulesToApply.values()].map(moduleTpl => moduleTpl.spec.resources).flat().map(item => item?.link || '');

    console.log(resourcesLinks);
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
  }, [communityModulesToApply]);

  if (installedCommunityModulesLoading || moduleTemplatesLoading) {
    return (
      <div style={{ height: 'calc(100vh - 14rem)' }}>
        <Spinner />
      </div>
    );
  }

  console.log('available community modules', availableCommunityModules);

  const onSave = () => {
    console.log('Saving version change');
    uploadResources();
    setIsResourceEdited({
      isEdited: false,
    });

    notification.notifySuccess({
      content: t('kyma-modules.module-updated'),
    });
  };


  const communityModulesToDisplay = Array.from(
    availableCommunityModules,
    ([key, versionInfo]) => {
      const formatDisplayText = (v: VersionInfo): string => {
        const version = (v.channel ? v.channel + ' ' : '') + `(v${v.version})` + (v.beta ? '- Beta' : '');
        if (v.installed) {
          return t('community-modules.installed') + ` ${version}`;
        } else {
          return version;
        }
      };

      return {
        name: key,
        versions: versionInfo.map(v => ({
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
    },
  );


  if (isCommunityModulesEnabled) {
    return (
      <section>
        <UI5Panel
          title={''}
          headerActions={
            <Button
              className="min-width-button"
              // disabled={readOnly || disableEdit}
              // aria-disabled={readOnly || disableEdit}
              onClick={onSave}
              design="Emphasized"
              // tooltip={invalidPopupMessage}
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
              {/*<Form*/}
              {/*  className={'resource-form ui5-content-density-compact'}*/}
              {/*  labelSpan="S0 M0 L0 XL0"*/}
              {/*  layout="S1 M1 L1 XL1"*/}
              {/*>*/}
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
                      <CommunityModuleEdit module={module}
                                           onChange={onCommunityChange(communityModuleTemplates, installedCommunityModules, communityModulesToApply, setCommunityModulesToApply, setIsResourceEdited)} />
                    );
                  })}
              </div>
              {/*</Form>*/}
            </CollapsibleSection>
          }
        >
        </UI5Panel>
        {createPortal(<UnsavedMessageBox />, document.body)}
      </section>
    );
  } else {
    return <></>;
  }
}

