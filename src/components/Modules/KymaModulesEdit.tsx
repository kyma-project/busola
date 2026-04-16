import { createPortal } from 'react-dom';
import { cloneDeep } from 'lodash';
import { ReactNode, useState } from 'react';
import { createPatch } from 'rfc6902';
import { useTranslation } from 'react-i18next';

import { useNotification } from 'shared/contexts/NotificationContext';
import { useUpdate } from 'shared/hooks/BackendAPI/useMutation';
import { useSingleGet } from 'shared/hooks/BackendAPI/useGet';
import { HttpError } from 'shared/hooks/BackendAPI/config';
import { ForceUpdateModalContent } from 'shared/ResourceForm/ForceUpdateModalContent';

import {
  Button,
  CheckBox,
  FlexBox,
  Label,
  MessageStrip,
  Option,
  Select,
} from '@ui5/webcomponents-react';

import { ResourceForm } from 'shared/ResourceForm';
import './KymaModulesCreate.scss';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { isFormOpenAtom } from 'state/formOpenAtom';
import { isResourceEditedAtom } from 'state/resourceEditedAtom';
import { ManagedWarnings } from 'components/Modules/components/ManagedWarnings';
import { ChannelWarning } from 'components/Modules/components/ChannelWarning';
import { UnmanagedModuleInfo } from 'components/Modules/components/UnmanagedModuleInfo';
import {
  useModulesReleaseQuery,
  useModuleTemplatesQuery,
} from './kymaModulesQueries';
import {
  findModuleSpec,
  KymaResourceStatusModuleType,
  ModuleReleaseMetaListType,
  ModuleTemplateType,
  setChannel,
} from './support';
import CommunityModulesEdit from 'components/Modules/community/CommunityModulesEdit';
import { useSetAtom } from 'jotai';
import { ResourceFormProps } from 'shared/ResourceForm/components/ResourceForm';

type ChannelType = {
  channel: string;
  version: string;
  isBeta?: boolean;
  isMetaRelease?: boolean;
};

const addChannelsToModules = (
  moduleReleaseMetas: ModuleReleaseMetaListType,
) => {
  return (acc: any[], module: ModuleTemplateType) => {
    const name =
      module.metadata?.labels['operator.kyma-project.io/module-name'];
    const existingModule = acc.find((item) => item.name === name);
    const moduleMetaRelase = moduleReleaseMetas?.items.find(
      (item) => item.spec.moduleName === name,
    );

    const isModuleMetaRelease = acc.find(
      (item) => item.name === moduleMetaRelase?.spec?.moduleName,
    );

    if (module.spec.channel && !isModuleMetaRelease) {
      if (!existingModule) {
        acc.push({
          name: name,
          channels: [
            {
              channel: module.spec.channel,
              version: module.spec.descriptor.component.version,
              isBeta:
                module.metadata.labels['operator.kyma-project.io/beta'] ===
                'true',
              isMetaRelease: false,
            },
          ],
          docsUrl:
            module.metadata.annotations['operator.kyma-project.io/doc-url'],
        });
      } else if (existingModule) {
        existingModule.channels?.push({
          channel: module.spec.channel,
          version: module.spec.descriptor.component.version,
          isBeta:
            module.metadata.labels['operator.kyma-project.io/beta'] === 'true',
          isMetaRelease: false,
        });
      }
    } else {
      if (!existingModule) {
        moduleMetaRelase?.spec.channels.forEach((channel) => {
          if (!acc.find((item) => item.name === name)) {
            acc.push({
              name: name,
              channels: [
                {
                  channel: channel.channel,
                  version: channel.version,
                  isBeta: moduleMetaRelase.spec.beta ?? false,
                  isMetaRelease: true,
                },
              ],
              docsUrl: module.spec.info?.documentation,
            });
          } else {
            acc
              .find((item) => item.name === name)
              .channels.push({
                channel: channel.channel,
                version: channel.version,
                isBeta: moduleMetaRelase.spec.beta ?? false,
                isMetaRelease: true,
              });
          }
        });
      }
    }
    return acc;
  };
};

export default function KymaModulesEdit({
  resource,
  resourceUrl,
  ...props
}: ResourceFormProps & { resourceUrl: string }) {
  const { t } = useTranslation();
  const [kymaResource, setKymaResource] = useState(cloneDeep(resource));
  const [initialResource] = useState(resource);
  const [initialUnchangedResource] = useState(cloneDeep(resource));
  const setIsResourceEdited = useSetAtom(isResourceEditedAtom);
  const setIsFormOpen = useSetAtom(isFormOpenAtom);

  const resourceName = kymaResource?.metadata.name;

  const { data: moduleReleaseMetas, loading: loadingModulesReleaseMetas } =
    useModulesReleaseQuery({
      skip: !resourceName,
    });
  const { data: moduleTemplates, loading: loadingModuleTemplates } =
    useModuleTemplatesQuery({
      skip: !resourceName,
    });

  const notification = useNotification();

  const getRequest = useSingleGet();
  const patchRequest = useUpdate();
  const [selectedModules, setSelectedModules] = useState<
    KymaResourceStatusModuleType[]
  >(cloneDeep(initialResource?.spec?.modules) ?? []);
  const [showChannelChangeWarning, setShowChannelChangeWarning] =
    useState(false);
  const [isManagedChanged, setIsManagedChanged] = useState(false);
  const [showMessageBox, setShowMessageBox] = useState({
    isOpen: false,
  });
  const [showManagedBox, setShowManagedBox] = useState({
    isOpen: false,
    onSave: false,
  });

  if (loadingModuleTemplates || loadingModulesReleaseMetas) {
    return (
      <div style={{ height: 'calc(100vh - 14rem)' }}>
        <Spinner />
      </div>
    );
  }

  const setManaged = (managed: boolean, index: number) => {
    const newSelectedModules = [...selectedModules].map((module, idx) => {
      if (index === idx) {
        return { ...module, managed: managed };
      }
      return module;
    });

    setKymaResource({
      ...kymaResource,
      spec: {
        ...kymaResource.spec,
        modules: newSelectedModules,
      },
    });
    setIsManagedChanged(true);
    setShowManagedBox({ isOpen: true, onSave: false });
  };

  const installedModules = moduleTemplates?.items.filter((module) => {
    const name =
      module.metadata?.labels['operator.kyma-project.io/module-name'];
    return (
      selectedModules?.findIndex((kymaResourceModule) => {
        return kymaResourceModule.name === name;
      }) !== -1
    );
  });

  const modulesEditData = (installedModules || []).reduce(
    addChannelsToModules(moduleReleaseMetas ?? { items: [] }),
    [],
  );

  const checkIfSelectedModuleIsBeta = (moduleName?: string) => {
    return selectedModules.some(({ name, channel }) => {
      if (moduleName && name !== moduleName) {
        return false;
      }
      const moduleData = modulesEditData?.find(
        (module) => module.name === name,
      );

      return moduleData
        ? moduleData.channels.some(
            ({ channel: ch, isBeta }: ChannelType) =>
              ch === (channel || kymaResource.spec.channel) && isBeta,
          )
        : false;
    });
  };

  const onChange = (
    module: { name: string; channels: { version: string; channel: string }[] },
    value: string,
    index: number,
  ) => {
    setChannel(module, value, index, selectedModules, setSelectedModules);
    setKymaResource({
      ...kymaResource,
      spec: {
        ...kymaResource.spec,
        modules: selectedModules,
      },
    });
    setShowChannelChangeWarning(true);
  };

  const renderModules = () => {
    const modulesList: ReactNode[] = [];
    modulesEditData?.forEach((module) => {
      const index = selectedModules?.findIndex((selectedModule) => {
        return selectedModule.name === module?.name;
      });

      const modulePredefinedVersion = module.channels?.filter(
        (channel: ChannelType) =>
          channel.channel === kymaResource?.spec?.channel,
      )[0]?.version;

      const mod = (
        <FlexBox
          direction="Column"
          style={{ gap: '0.5rem' }}
          key={module?.name}
        >
          <Label>{`${module.name}:`}</Label>
          <Select
            accessibleName={`${module.name} channel select`}
            onChange={(event) => {
              onChange(module, event.detail.selectedOption.value ?? '', index);
            }}
            value={
              findModuleSpec(kymaResource, module.name)?.channel || 'predefined'
            }
            className="channel-select"
          >
            {!!modulePredefinedVersion && (
              <Option
                selected={
                  !module.channels?.filter(
                    (channel: ChannelType) =>
                      channel.channel ===
                      findModuleSpec(kymaResource, module.name)?.channel,
                  )
                }
                value={'predefined'}
                key={`predefined-${module.name}`}
              >
                {`${t(
                  'kyma-modules.predefined-channel',
                )} (${kymaResource?.spec?.channel[0].toUpperCase()}${kymaResource?.spec?.channel.slice(
                  1,
                )} v${modulePredefinedVersion})`}
              </Option>
            )}
            {module.channels?.map((channel: ChannelType) => (
              <Option
                selected={
                  channel.channel ===
                  findModuleSpec(kymaResource, module.name)?.channel
                }
                key={`${channel.channel}-${module.name}${
                  channel.isMetaRelease ? '-meta' : ''
                }`}
                value={channel.channel}
                additionalText={channel?.isBeta ? 'Beta' : ''}
              >
                {`${(
                  channel?.channel[0] || ''
                ).toUpperCase()}${channel.channel.slice(1)} (v${
                  channel.version
                })`}{' '}
              </Option>
            ))}
          </Select>
          <CheckBox
            accessibleName={`${module.name} managed checkbox`}
            text={t('kyma-modules.managed')}
            checked={
              (findModuleSpec(kymaResource, module.name) as any)?.managed
            }
            onChange={(event) => {
              setManaged(event.target.checked, index);
            }}
          />
        </FlexBox>
      );
      modulesList.push(mod);
    });

    return <div className="gridbox-editModule">{modulesList}</div>;
  };

  const showError = (error: Error) => {
    console.error(error);
    notification.notifyError({
      content: t('common.create-form.messages.patch-failure', {
        resourceType: t('kyma-modules.kyma'),
        error: error?.message,
      }),
    });
  };

  const onSuccess = () => {
    notification.notifySuccess({
      content: t('common.create-form.messages.patch-success', {
        resourceType: t('kyma-modules.kyma'),
      }),
    });

    setIsResourceEdited({
      isEdited: false,
    });
    setIsManagedChanged(false);

    setIsFormOpen({
      formOpen: false,
    });
  };
  const handleCreate = async () => {
    try {
      const diff = createPatch(initialUnchangedResource, kymaResource);
      await patchRequest(resourceUrl, diff);

      onSuccess();
    } catch (e) {
      const isConflict = e instanceof HttpError && e.code === 409;
      if (isConflict) {
        const response = await getRequest(resourceUrl);
        const updatedResource = await response.json();

        const makeForceUpdateFn = (closeModal: () => void) => {
          return async () => {
            kymaResource.metadata.resourceVersion =
              initialUnchangedResource?.metadata.resourceVersion;
            try {
              await patchRequest(
                resourceUrl,
                createPatch(initialUnchangedResource, kymaResource),
              );
              closeModal();
              onSuccess();
            } catch (e) {
              showError(e as Error);
            }
          };
        };

        notification.notifyError({
          content: (
            <ForceUpdateModalContent
              error={e}
              singularName={t('kyma-modules.kyma')}
              initialResource={updatedResource}
              modifiedResource={kymaResource}
            />
          ),
          actions: (closeModal, defaultCloseButton) => [
            <Button key="force-update" onClick={makeForceUpdateFn(closeModal)}>
              {t('common.create-form.force-update')}
            </Button>,
            defaultCloseButton(closeModal),
          ],
          wider: true,
        });
      } else {
        showError(e as Error);
        return false;
      }
    }
  };

  const skipModuleFn = () => {
    if (isManagedChanged) {
      setShowManagedBox({
        ...showManagedBox,
        isOpen: true,
        onSave: true,
      });
    }
    if (showChannelChangeWarning) {
      setShowMessageBox({
        ...showMessageBox,
        isOpen: true,
      });
    }
    return isManagedChanged || showChannelChangeWarning;
  };

  return (
    <>
      {createPortal(
        <ChannelWarning
          showMessageBox={showMessageBox}
          setShowMessageBox={setShowMessageBox}
          handleCreate={handleCreate}
        />,
        document.body,
      )}
      {createPortal(
        <ManagedWarnings
          showManagedBox={showManagedBox}
          setShowManagedBox={setShowManagedBox}
          handleCreate={handleCreate}
          showChannelChangeWarning={showChannelChangeWarning}
          setShowMessageBox={setShowMessageBox}
        />,
        document.body,
      )}
      {kymaResource && (
        <ResourceForm
          {...props}
          className="kyma-modules-create"
          pluralKind="kymas"
          singularName={t('kyma-modules.kyma')}
          resource={kymaResource}
          initialResource={initialResource}
          setResource={setKymaResource}
          createUrl={resourceUrl}
          disableDefaultFields
          skipCreateFn={skipModuleFn}
        >
          <ResourceForm.CollapsibleSection
            defaultOpen
            defaultTitleType
            className="collapsible-margins"
            title={t('kyma-modules.modules-channel')}
          >
            <UnmanagedModuleInfo kymaResource={kymaResource} />
            {modulesEditData?.length !== 0 ? (
              <>
                {checkIfSelectedModuleIsBeta() ? (
                  <MessageStrip
                    key={'beta'}
                    design="Critical"
                    hideCloseButton
                    className="sap-margin-top-tiny"
                  >
                    {t('kyma-modules.beta-alert')}
                  </MessageStrip>
                ) : null}
                {renderModules()}
              </>
            ) : (
              <MessageStrip
                design="Critical"
                hideCloseButton
                className="sap-margin-top-small"
              >
                {t('kyma-modules.no-modules-installed')}
              </MessageStrip>
            )}
          </ResourceForm.CollapsibleSection>
        </ResourceForm>
      )}
      <CommunityModulesEdit />
    </>
  );
}
