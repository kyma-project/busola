import { useTranslation } from 'react-i18next';
import { useFeature } from 'hooks/useFeature';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';
import { CollapsibleSection } from 'shared/ResourceForm/components/CollapsibleSection';
import CommunityModuleEdit from 'components/KymaModules/components/ModuleEdit';
import { useGetInstalledModules } from 'components/KymaModules/hooks';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { getAvailableCommunityModules, VersionInfo } from 'components/KymaModules/components/CommunityModulesHelpers';
import { ModuleReleaseMetaListType, ModuleTemplateListType } from 'components/KymaModules/support';
import { Button } from '@ui5/webcomponents-react';

type CommunityModulesEditProp = {
  communityModules: ModuleTemplateListType;
  moduleReleaseMetas: ModuleReleaseMetaListType;
  loadingModuleTemplates: boolean;
  onChange: any;
};

export default function CommunityModulesEdit({
                                               communityModules,
                                               moduleReleaseMetas,
                                               loadingModuleTemplates,
                                               onChange,
                                             }: CommunityModulesEditProp) {
  const { t } = useTranslation();
  const { isEnabled: isCommunityModulesEnabled } = useFeature(
    'COMMUNITY_MODULES',
  );

  const {
    installed: installedCommunityModules,
    loading,
  } = useGetInstalledModules(communityModules, loadingModuleTemplates);
  if (loading) {
    return (
      <div style={{ height: 'calc(100vh - 14rem)' }}>
        <Spinner />
      </div>
    );
  }

  const availableCommunityModules = getAvailableCommunityModules(
    communityModules,
    moduleReleaseMetas,
  );

  console.log('installed community modules', installedCommunityModules);
  console.log('available community modules', availableCommunityModules);

  // TODO: extract it as a separte method -> markInstalledVersion
  installedCommunityModules.forEach(installedModule => {
    const foundModuleVersions = availableCommunityModules.get(
      installedModule.name,
    );
    if (foundModuleVersions) {
      const versionIdx = foundModuleVersions.findIndex(version => {
        return version.version === installedModule.version;
      });

      if (versionIdx > -1) {
        foundModuleVersions[versionIdx].installed = true;
      } else {
        //   TODO: add it as installed, this shouldn't happen!
      }
    }
  });

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
          key: v.moduleTemplateName,
          version: v.version,
          channel: v.channel ?? '',
          installed: v.installed ?? false,
          textToDisplay: formatDisplayText(v),
        })),
      };
    },
  );

  const onSave = () => {
  };
  console.log(communityModulesToDisplay);

  if (isCommunityModulesEnabled || loading) {
    // @ts-ignore
    return (
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
                    <CommunityModuleEdit module={module} onChange={onChange} />
                  );
                })}
            </div>
            {/*</Form>*/}
          </CollapsibleSection>
        }
      ></UI5Panel>

      //
      // <ResourceForm
      //   {...props}
      //   className="kyma-modules-create"
      //   pluralKind="kymas"
      //   singularName={t('kyma-modules.kyma')}
      //   resource={kymaResource}
      //   initialResource={initialResource}
      //   setResource={setKymaResource}
      //   createUrl={props.resourceUrl}
      //   disableDefaultFields
      //   skipCreateFn={skipModuleFn}
      // >
      //   <ResourceForm.CollapsibleSection
      //     defaultOpen
      //     defaultTitleType
      //     className="collapsible-margins"
      //     title={t('kyma-modules.modules-channel')}
      //   >
      //     <UnmanagedModuleInfo kymaResource={kymaResource} />
      //     {modulesEditData?.length !== 0 ? (
      //       <>
      //         {checkIfSelectedModuleIsBeta() ? (
      //           <MessageStrip
      //             key={'beta'}
      //             design="Critical"
      //             hideCloseButton
      //             className="sap-margin-top-tiny"
      //           >
      //             {t('kyma-modules.beta-alert')}
      //           </MessageStrip>
      //         ) : null}
      //         {renderModules()}
      //       </>
      //     ) : (
      //       <MessageStrip
      //         design="Critical"
      //         hideCloseButton
      //         className="sap-margin-top-small"
      //       >
      //         {t('extensibility.widgets.modules.no-modules-installed')}
      //       </MessageStrip>
      //     )}
      //   </ResourceForm.CollapsibleSection>
      // </ResourceForm>
    );
  } else {
    return <></>;
  }
}
