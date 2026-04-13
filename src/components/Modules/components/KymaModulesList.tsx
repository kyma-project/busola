import React, { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@ui5/webcomponents-react';
import {
  KymaResourceSpecModuleType,
  KymaResourceStatusModuleType,
  KymaResourceType,
  ModuleTemplateListType,
} from '../support';
import { UnmanagedModuleInfo } from './UnmanagedModuleInfo';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { ModulesListRows } from './ModulesListRows';
import { useModuleNavigation } from 'components/Modules/hooks/useModuleNavigation';
import { useModuleCrdsAndExtensions } from 'components/Modules/hooks/useModuleCrdsAndExtensions';
import { useShowAddModule } from 'components/Modules/hooks/useShowAddModule';

type ModulesListProps = {
  resource: KymaResourceType;
  moduleTemplates: ModuleTemplateListType;
  resourceName: string;
  selectedModules: { name: string }[];
  kymaResource: KymaResourceType;
  namespaced: boolean;
  resourceUrl: string;
  protectedResource: boolean;
  setOpenedModuleIndex: Dispatch<SetStateAction<number | null>>;
  handleResourceDelete: (resourceData: any) => void;
  customSelectedEntry?: string;
  setSelectedEntry?: Dispatch<SetStateAction<any>>;
};

export const KymaModulesList = ({
  resource,
  moduleTemplates,
  resourceName,
  selectedModules,
  kymaResource,
  namespaced,
  resourceUrl,
  protectedResource,
  setOpenedModuleIndex,
  handleResourceDelete,
  customSelectedEntry,
  setSelectedEntry,
}: ModulesListProps) => {
  const { t } = useTranslation();

  const { extensions, crds } = useModuleCrdsAndExtensions('kyma', [
    selectedModules,
  ]);

  const { handleClickResource, hasDetailsLink, customColumnLayout } =
    useModuleNavigation({
      moduleTemplates,
      extensions,
      crds,
      namespaced,
      installedModules: selectedModules,
      setOpenedModuleIndex,
      setSelectedEntry,
    });

  const handleShowAddModule = useShowAddModule(resourceUrl, 'kyma');

  const headerRenderer = () => [
    t('common.headers.name'),
    t('kyma-modules.namespaces'),
    t('kyma-modules.channel'),
    t('kyma-modules.version'),
    t('kyma-modules.module-state'),
    t('kyma-modules.installation-state'),
    t('kyma-modules.documentation'),
  ];

  const actions = [
    {
      name: t('common.buttons.delete'),
      tooltip: () => t('common.buttons.delete'),
      icon: 'delete',
      disabledHandler: (resource: { name: string }) => {
        const index = selectedModules?.findIndex((kymaResourceModule) => {
          return kymaResourceModule.name === resource.name;
        });
        return index < 0 || protectedResource;
      },
      handler: (resource: { name: string }) => {
        const index = selectedModules?.findIndex((kymaResourceModule) => {
          return kymaResourceModule.name === resource.name;
        });
        setOpenedModuleIndex(index);
        handleResourceDelete({});
      },
    },
  ];

  function getEntries(
    statusModules: KymaResourceStatusModuleType[] = [],
    specModules: KymaResourceSpecModuleType[] = [],
  ) {
    specModules.forEach((specItem) => {
      const exists = statusModules.some(
        (statusItem) => statusItem?.name === specItem?.name,
      );

      if (!exists) {
        statusModules.push({ name: specItem.name });
      }
    });
    return statusModules;
  }

  return (
    <React.Fragment key="modules-list">
      <UnmanagedModuleInfo kymaResource={kymaResource} />
      <GenericList
        testid={'kyma-modules-list'}
        className={'modules-list'}
        actions={actions as any}
        customRowClick={handleClickResource}
        extraHeaderContent={[
          <Button
            key="add-module"
            disabled={!resource || protectedResource}
            onClick={handleShowAddModule}
          >
            {t('common.buttons.add')}
          </Button>,
        ]}
        customColumnLayout={customColumnLayout as any}
        enableColumnLayout
        hasDetailsView
        entries={
          getEntries(resource?.status?.modules, resource?.spec?.modules) as any
        }
        headerRenderer={headerRenderer}
        rowRenderer={(resource) =>
          ModulesListRows({
            resourceName,
            resource,
            kymaResource,
            moduleTemplates,
            hasDetailsLink,
            protectedResource,
          })
        }
        disableHiding={false}
        displayArrow
        title={'Modules'}
        sortBy={{
          name: (a: { name: any }, b: { name: any }) =>
            a.name?.localeCompare(b.name),
        }}
        emptyListProps={
          {
            image: 'TntComponents',
            titleText: `${t('common.labels.no')} ${t(
              'kyma-modules.title',
            ).toLocaleLowerCase()}`,
            subtitleText: t('kyma-modules.no-modules-description'),
            url: 'https://help.sap.com/docs/btp/sap-business-technology-platform/kyma-s-modular-approach?locale=en-US&state=DRAFT&version=Cloud',
            buttonText: t('common.buttons.add'),
            showButton: true,
            onClick: handleShowAddModule,
          } as any
        }
        customSelectedEntry={customSelectedEntry}
      />
    </React.Fragment>
  );
};
