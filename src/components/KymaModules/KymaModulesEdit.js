import { createPortal } from 'react-dom';
import { cloneDeep } from 'lodash';
import { useState } from 'react';
import { createPatch } from 'rfc6902';
import { useSetRecoilState } from 'recoil';
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
import { isFormOpenState } from 'state/formOpenAtom';
import { isResourceEditedState } from 'state/resourceEditedAtom';
import { ManagedWarnings } from 'components/KymaModules/components/ManagedWarnings';
import { ChannelWarning } from 'components/KymaModules/components/ChannelWarning';
import { UnmanagedModuleInfo } from 'components/KymaModules/components/UnmanagedModuleInfo';
import {
  useModulesReleaseQuery,
  useModuleTemplatesQuery,
} from './kymaModulesQueries';
import { findModuleSpec, findModuleStatus, setChannel } from './support';
import CommunityModulesEdit from 'components/KymaModules/KymaCommunityModulesEdit';
import { getCommunityModules } from 'components/KymaModules/components/CommunityModulesHelpers';

const addChannelsToModules = moduleReleaseMetas => {
  return (acc, module) => {
    const name =
      module.metadata?.labels['operator.kyma-project.io/module-name'];
    const existingModule = acc.find(item => item.name === name);
    const moduleMetaRelase = moduleReleaseMetas?.items.find(
      item => item.spec.moduleName === name,
    );

    const isModuleMetaRelease = acc.find(
      item => item.name === moduleMetaRelase?.spec?.moduleName,
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
        moduleMetaRelase?.spec.channels.forEach(channel => {
          if (!acc.find(item => item.name === name)) {
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
              docsUrl: module.spec.info.documentation,
            });
          } else {
            acc
              .find(item => item.name === name)
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

export default function KymaModulesEdit({ resource, ...props }) {
  const { t } = useTranslation();
  const [kymaResource, setKymaResource] = useState(cloneDeep(resource));
  const [initialResource] = useState(resource);
  const [initialUnchangedResource] = useState(cloneDeep(resource));
  const setIsResourceEdited = useSetRecoilState(isResourceEditedState);
  const setIsFormOpen = useSetRecoilState(isFormOpenState);

  const resourceName = kymaResource?.metadata.name;

  const {
    data: moduleReleaseMetas,
    loading: loadingModulesReleaseMetas,
  } = useModulesReleaseQuery({
    skip: !resourceName,
  });
  const {
    data: moduleTemplates,
    loading: loadingModuleTemplates,
  } = useModuleTemplatesQuery({
    skip: !resourceName,
  });

  const notification = useNotification();

  const getRequest = useSingleGet();
  const patchRequest = useUpdate();
  const [selectedModules, setSelectedModules] = useState(
    cloneDeep(initialResource?.spec?.modules) ?? [],
  );
  const [showChannelChangeWarning, setShowChannelChangeWarning] = useState(
    false,
  );
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

  const setManaged = (managed, index) => {
    selectedModules[index].managed = managed;

    setKymaResource({
      ...kymaResource,
      spec: {
        ...kymaResource.spec,
        modules: selectedModules,
      },
    });
    setIsManagedChanged(true);
    setShowManagedBox({ isOpen: true, onSave: false });
  };

  const installedModules = moduleTemplates?.items.filter(module => {
    const name =
      module.metadata?.labels['operator.kyma-project.io/module-name'];
    return (
      selectedModules?.findIndex(kymaResourceModule => {
        return kymaResourceModule.name === name;
      }) !== -1
    );
  });

  const modulesEditData = (installedModules || []).reduce(
    addChannelsToModules(moduleReleaseMetas),
    [],
  );

  const checkIfSelectedModuleIsBeta = moduleName => {
    return selectedModules.some(({ name, channel }) => {
      if (moduleName && name !== moduleName) {
        return false;
      }
      const moduleData = modulesEditData?.find(module => module.name === name);

      return moduleData
        ? moduleData.channels.some(
            ({ channel: ch, isBeta }) =>
              ch === (channel || kymaResource.spec.channel) && isBeta,
          )
        : false;
    });
  };

  const onChange = (module, value, index) => {
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
    const modulesList = [];
    modulesEditData?.forEach((module, i) => {
      const index = selectedModules?.findIndex(selectedModule => {
        return selectedModule.name === module?.name;
      });

      const mod = (
        <FlexBox
          direction="Column"
          style={{ gap: '0.5rem' }}
          key={module?.name}
        >
          <Label>{`${module.name}:`}</Label>
          <Select
            accessibleName={`${module.name} channel select`}
            onChange={event => {
              onChange(module, event.detail.selectedOption.value, index);
            }}
            value={
              findModuleSpec(kymaResource, module.name)?.channel ||
              findModuleStatus(kymaResource, module.name)?.channel ||
              'predefined'
            }
            className="channel-select"
          >
            <Option
              selected={
                !module.channels?.filter(
                  channel =>
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
              )} v${
                module.channels?.filter(
                  channel => channel.channel === kymaResource?.spec?.channel,
                )[0]?.version
              })`}
            </Option>
            {module.channels?.map(channel => (
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
            checked={findModuleSpec(kymaResource, module.name)?.managed}
            onChange={event => {
              setManaged(event.target.checked, index);
            }}
          />
        </FlexBox>
      );
      modulesList.push(mod);
    });

    return <div className="gridbox-editModule">{modulesList}</div>;
  };

  const showError = error => {
    console.error(error);
    notification.notifyError({
      content: t('common.create-form.messages.patch-failure', {
        resourceType: t('kyma-modules.kyma'),
        error: error.message,
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
      await patchRequest(props.resourceUrl, diff);

      onSuccess();
    } catch (e) {
      const isConflict = e instanceof HttpError && e.code === 409;
      if (isConflict) {
        const response = await getRequest(props.resourceUrl);
        const updatedResource = await response.json();

        const makeForceUpdateFn = closeModal => {
          return async () => {
            kymaResource.metadata.resourceVersion =
              initialUnchangedResource?.metadata.resourceVersion;
            try {
              await patchRequest(
                props.resourceUrl,
                createPatch(initialUnchangedResource, kymaResource),
              );
              closeModal();
              onSuccess();
            } catch (e) {
              showError(e);
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
            <Button onClick={makeForceUpdateFn(closeModal)}>
              {t('common.create-form.force-update')}
            </Button>,
            defaultCloseButton(closeModal),
          ],
          wider: true,
        });
      } else {
        showError(e);
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
          createUrl={props.resourceUrl}
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
                {t('extensibility.widgets.modules.no-modules-installed')}
              </MessageStrip>
            )}
          </ResourceForm.CollapsibleSection>
        </ResourceForm>
      )}
      <CommunityModulesEdit
        moduleReleaseMetas={moduleReleaseMetas}
      ></CommunityModulesEdit>
    </>
  );
}
