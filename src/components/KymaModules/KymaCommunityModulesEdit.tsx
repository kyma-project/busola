import { useTranslation } from 'react-i18next';
import { useFeature } from 'hooks/useFeature';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';
import { CollapsibleSection } from 'shared/ResourceForm/components/CollapsibleSection';
import CommunityModuleEdit from 'components/KymaModules/components/ModuleEdit';
import { useGetInstalledModules } from 'components/KymaModules/hooks';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { getAvailableCommunityModules, VersionInfo } from 'components/KymaModules/components/CommunityModulesHelpers';
import { ModuleReleaseMetaListType, ModuleTemplateListType, ModuleTemplateType } from 'components/KymaModules/support';
import { Button } from '@ui5/webcomponents-react';
import React, { useEffect, useMemo, useState } from 'react';
import { UnsavedMessageBox } from 'shared/components/UnsavedMessageBox/UnsavedMessageBox';
import { createPortal } from 'react-dom';
import { SetterOrUpdater, useSetRecoilState } from 'recoil';
import { isResourceEditedState } from 'state/resourceEditedAtom';
import { useUploadResources } from 'resources/Namespaces/YamlUpload/useUploadResources';
import { getAllResourcesYamls } from 'components/KymaModules/tmpInstallHelpers';
import { usePost } from 'shared/hooks/BackendAPI/usePost';

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


    const foundModule = communityModules.items.find(item => item.metadata.namespace === moduleTemplate.namespace && item.metadata.name === moduleTemplate.name);
    if (foundModule) {
      const moduleToUpdate = communityModulesToApply.get(foundModule.spec.moduleName);
      if (moduleToUpdate) {
        const installedModule = installedCommunityModules.items.find(item => item.metadata.name === foundModule.metadata.name && item.metadata.namespace === foundModule.metadata.namespace);
        if (installedModule) {
          newModulesToUpdated.delete(foundModule.spec.moduleName);
        } else {
          newModulesToUpdated.set(foundModule.spec.moduleName, foundModule);
        }
        //   Delete if installed or update if not installed
      } else {
        newModulesToUpdated.set(foundModule.spec.moduleName, foundModule);
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


function findModule(communityModulesToApply: [any], moduleTemplate: { name: string, namespace: string }): any {

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

  const [resourcesToApply, setResourcesToApply] = useState<{value:any}[]>([]);
  const uploadResources = useUploadResources(resourcesToApply, setResourcesToApply, () => {
  }, null);


  const post = usePost();
  const [communityModulesToApply, setCommunityModulesToApply] = useState(new Map<string, ModuleTemplateType>());
  const setIsResourceEdited = useSetRecoilState(isResourceEditedState);


  const availableCommunityModules = useMemo(() => {
    return getAvailableCommunityModules(
      communityModules,
      moduleReleaseMetas,
    );
  }, [communityModules, moduleReleaseMetas]);

  const {
    installed: installedCommunityModules,
    loading: installedCommunityModulesLoading,
  } = useGetInstalledModules(communityModules, loadingModuleTemplates);


  // TODO: this code is from Agata
  useEffect(() => {
    const resourcesLinks = [...communityModulesToApply.values()].map(moduleTpl => moduleTpl.spec.resources).flat().map(item => item?.link || '');

    console.log(resourcesLinks);
    (async function() {
      try {
        const yamls = await getAllResourcesYamls(resourcesLinks, post);

        const yamlsResources = yamls?.map(resource => {
          return { value: resource };
        })

        setResourcesToApply(yamlsResources || []);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [communityModulesToApply]);
  // TODO:

  if (installedCommunityModulesLoading) {
    return (
      <div style={{ height: 'calc(100vh - 14rem)' }}>
        <Spinner />
      </div>
    );
  }

  // console.log('installed community modules', installedCommunityModules);
  // console.log('available community modules', availableCommunityModules);

  // TODO: extract it as a separate method -> markInstalledVersion
  installedCommunityModules.items.forEach(installedModule => {
    const foundModuleVersions = availableCommunityModules.get(
      installedModule.spec.moduleName || installedModule.metadata.labels['operator.kyma-project.io/module-name'],
    );
    if (foundModuleVersions) {
      const versionIdx = foundModuleVersions.findIndex(version => {
        return version.version === installedModule.spec.version;
      });

      if (versionIdx > -1) {
        foundModuleVersions[versionIdx].installed = true;
      } else {
        //   TODO: add it as installed, this shouldn't happen!
      }
    }
  });


  const onSave = () => {
    console.log('Saving version change');
    uploadResources();
  //   TODO: use notifications
  };


  const communityModulesToDisplay = Array.from(
    availableCommunityModules,
    ([key, versionInfo]) => {
      const formatDisplayText = (v: VersionInfo): string => {
        const version = (v.channel ? v.channel + ' ' : '') + `(v${v.version})`;
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
            name: v.moduleTemplate?.metadata.name,
            namespace: v.moduleTemplate?.metadata.namespace,
          },
          version: v.version,
          channel: v.channel ?? '',
          installed: v.installed ?? false,
          textToDisplay: formatDisplayText(v),
        })),
      };
    },
  );


  if (isCommunityModulesEnabled || installedCommunityModulesLoading) {
    // @ts-ignore
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
                                           onChange={onCommunityChange(communityModules, installedCommunityModules, communityModulesToApply, setCommunityModulesToApply, setIsResourceEdited)} />
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

