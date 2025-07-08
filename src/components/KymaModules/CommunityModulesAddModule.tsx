import { useTranslation } from 'react-i18next';
import { useFeature } from 'hooks/useFeature';
import { ResourceForm } from 'shared/ResourceForm';
import { MessageStrip } from '@ui5/webcomponents-react';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';
import { CollapsibleSection } from 'shared/ResourceForm/components/CollapsibleSection';
import CommunityModuleVersionSelect from 'components/KymaModules/components/CommunityModuleVersionSelect'; //   ModuleDisplayInfo,
import { Spinner } from 'shared/components/Spinner/Spinner';
import {
  getAllResourcesYamls,
  getAvailableCommunityModules,
  VersionInfo,
} from 'components/KymaModules/components/CommunityModulesHelpers';
import {
  getModuleName,
  ModuleTemplateListType,
  ModuleTemplateType,
} from 'components/KymaModules/support';
import { Button } from '@ui5/webcomponents-react';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { UnsavedMessageBox } from 'shared/components/UnsavedMessageBox/UnsavedMessageBox';
import { createPortal } from 'react-dom';
import { SetterOrUpdater, useSetRecoilState } from 'recoil';
import { isResourceEditedState } from 'state/resourceEditedAtom';
import { useUploadResources } from 'resources/Namespaces/YamlUpload/useUploadResources';
import { PostFn, usePost } from 'shared/hooks/BackendAPI/usePost';
import { CommunityModuleContext } from 'components/KymaModules/providers/CommunityModuleProvider';
import CommunityModulesCard from 'components/KymaModules/components/CommunityModulesCard';

import {
  NotificationContextArgs,
  useNotification,
} from 'shared/contexts/NotificationContext';
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
  icon?: { link: string; name: string };
  docsURL?: string;
};
type ModuleDisplayInfo = {
  name: string;
  versions: VersionDisplayInfo[];
};
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
    if (newModuleTemplateToApply) {
      const moduleTemplateToApply = moduleTemplatesToApply.get(
        getModuleName(newModuleTemplateToApply),
      );
      if (moduleTemplateToApply) {
        const moduleInstalled = isModuleInstalled(
          newModuleTemplateToApply,
          installedModuleTemplates,
        );
        if (moduleInstalled) {
          newModulesTemplatesToApply.delete(
            getModuleName(newModuleTemplateToApply),
          );
        } else {
          newModulesTemplatesToApply.set(
            getModuleName(newModuleTemplateToApply),
            newModuleTemplateToApply,
          );
        }
      } else {
        newModulesTemplatesToApply.set(
          getModuleName(newModuleTemplateToApply),
          newModuleTemplateToApply,
        );
      }
    } else {
      console.warn(`Can't find module template`);
      return;
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
    console.log('newModulesTemplatesToApply', newModulesTemplatesToApply);
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
      console.log('resourcesToApply', yamlsResources || []);
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
        icon: v.icon,
        docsURL: v.docsURL,
      })),
    };
  });
}

export default function CommunityModulesAddModule(props: any) {
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
    if (!moduleReleaseMetasLoading && communityModuleTemplates) {
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
    console.log(
      'communityModulesTemplatesToApply',
      communityModulesTemplatesToApply,
      'resourcesToApply',
      resourcesToApply,
    );
  }, [communityModulesTemplatesToApply]); // eslint-disable-line react-hooks/exhaustive-deps

  const [columnsCount, setColumnsCount] = useState(2);
  const [
    cardsContainerRef,
    setCardsContainerRef,
  ] = useState<HTMLDivElement | null>(null);
  //   const setCardsContainerRef: React.Dispatch<React.SetStateAction<HTMLInputElement|null>>

  const calculateColumns = useCallback(() => {
    console.log(
      'lolo calculateColumns',
      cardsContainerRef,
      cardsContainerRef?.clientWidth,
    );
    if (cardsContainerRef?.clientWidth) {
      const containerWidth = cardsContainerRef?.clientWidth;
      const cardWidth = 350;
      const gap = 16;
      const colNumber = Math.max(
        1,
        Math.floor((containerWidth + gap) / (cardWidth + gap)),
      );
      console.log('colNumber', colNumber);
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

  const isChecked = (name: string) => {
    return !!communityModulesTemplatesToApply.get(name);
  };
  const renderCards = () => {
    const columns = Array.from({ length: columnsCount }, (): any => []);

    communityModulesToDisplay?.map((module, i) => {
      console.log(
        'communityModulesTemplatesToApply',
        communityModulesTemplatesToApply,
        'communityModulesToDisplay',
        communityModulesToDisplay,
        'i',
        i,
        'i % columnsCount',
        i % columnsCount,
      );
      //   const index = communityModulesTemplatesToApply?.findIndex(
      //     kymaResourceModule => {
      //       return kymaResourceModule.name === module?.name;
      //     },
      //   );

      const card = (
        <CommunityModulesCard
          module={module}
          //   index={index}
          key={`${module.name}+${i}`}
          isChecked={isChecked}
          onChange={onVersionChange(
            communityModuleTemplates,
            installedCommunityModuleTemplates,
            communityModulesTemplatesToApply,
            setCommunityModulesTemplatesToApply,
            setIsResourceEdited,
          )}
          //   setCheckbox={setCheckbox}
          //   selectedModules={selectedModules}
          //   setSelectedModules={setSelectedModules}
          //   checkIfStatusModuleIsBeta={checkIfStatusModuleIsBeta}
        />
      );
      columns[i % columnsCount].push(card);
      console.log(
        'columnsCount',
        columnsCount,
        'card',
        card,
        'i',
        i,
        'i % columnsCount',
        i % columnsCount,
      );
      console.log('columns', columns);
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
          afterCreatedCustomMessage={t('kyma-modules.messages.module-added')}
          formWithoutPanel
          className="add-modules-form"
          onSubmit={() => {}}
        >
          <>
            {communityModulesToDisplay?.length !== 0 ? (
              <>
                {/* {checkIfSelectedModuleIsBeta() ? (
                <MessageStrip
                  key={'beta'}
                  design="Critical"
                  hideCloseButton
                  className="sap-margin-top-small"
                >
                  {t('kyma-modules.beta-alert')}
                </MessageStrip>
              ) : null} */}
                {renderCards()}
              </>
            ) : (
              <MessageStrip
                design="Critical"
                hideCloseButton
                className="sap-margin-top-small"
              >
                {t('extensibility.widgets.modules.no-community-modules')}
              </MessageStrip>
            )}
          </>
        </ResourceForm>
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
                    communityModulesToDisplay.map((module, idx) => {
                      // return <div>lolo - {module.name}</div>;
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
        </section>

        {createPortal(<UnsavedMessageBox />, document.body)}
      </>
    );
  } else {
    return <></>;
  }
}
