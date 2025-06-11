import { useTranslation } from 'react-i18next';
import { useFeature } from 'hooks/useFeature';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';
import { CollapsibleSection } from 'shared/ResourceForm/components/CollapsibleSection';
import CommunityModuleEdit from 'components/KymaModules/components/ModuleEdit';

export default function CommunityModulesEdit({
  communityModulesToDisplay,
  onChange,
  ...props
}) {
  const t = useTranslation();
  const { isEnabled: isCommunityModulesEnabled } = useFeature(
    'COMMUNITY_MODULES',
  );

  if (isCommunityModulesEnabled) {
    return (
      <UI5Panel>
        <CollapsibleSection defaultOpen={true} title={'Community Modules!'}>
          {communityModulesToDisplay &&
            communityModulesToDisplay.map(module => {
              return (
                <CommunityModuleEdit module={module} onChange={onChange} />
              );
            })}
        </CollapsibleSection>
      </UI5Panel>

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
