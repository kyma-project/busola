import { createPortal } from 'react-dom';
import { cloneDeep } from 'lodash';
import { useState } from 'react';
import { createPatch } from 'rfc6902';
import { useRecoilState } from 'recoil';
import { useTranslation, Trans } from 'react-i18next';
import { useUrl } from 'hooks/useUrl';

import { useNotification } from 'shared/contexts/NotificationContext';
import { useGet } from 'shared/hooks/BackendAPI/useGet';
import { useUpdate } from 'shared/hooks/BackendAPI/useMutation';
import { useSingleGet } from 'shared/hooks/BackendAPI/useGet';
import { HttpError } from 'shared/hooks/BackendAPI/config';
import { columnLayoutState } from 'state/columnLayoutAtom';
import { ForceUpdateModalContent } from 'shared/ResourceForm/ForceUpdateModalContent';

import {
  Button,
  FlexBox,
  Label,
  MessageBox,
  MessageStrip,
  Option,
  Select,
} from '@ui5/webcomponents-react';
import { spacing } from '@ui5/webcomponents-react-base';

import { ResourceForm } from 'shared/ResourceForm';
import './KymaModulesCreate.scss';

export default function KymaModulesCreate({ resource, ...props }) {
  const { t } = useTranslation();
  const [kymaResource, setKymaResource] = useState(cloneDeep(resource));
  const [initialResource] = useState(resource);
  const [initialUnchangedResource] = useState(cloneDeep(resource));

  const resourceName = kymaResource?.metadata.name;
  const modulesResourceUrl = `/apis/operator.kyma-project.io/v1beta2/moduletemplates`;

  const { data: modules } = useGet(modulesResourceUrl, {
    pollingInterval: 3000,
    skip: !resourceName,
  });

  const [layoutColumn, setLayoutColumn] = useRecoilState(columnLayoutState);
  const notification = useNotification();
  const { scopedUrl } = useUrl();

  const getRequest = useSingleGet();
  const patchRequest = useUpdate();
  const [selectedModules] = useState(initialResource?.spec?.modules ?? []);
  const [isEdited, setIsEdited] = useState(false);
  const [showMessageBox, setShowMessageBox] = useState({
    isOpen: false,
    hide: false,
  });

  const setChannel = (module, channel, index) => {
    if (
      selectedModules.find(
        selectedModule => selectedModule.name === module.name,
      )
    ) {
      if (channel === 'predefined') {
        delete selectedModules[index].channel;
      } else selectedModules[index].channel = channel;
    } else {
      selectedModules.push({
        name: module.name,
      });
      if (channel !== 'predefined')
        selectedModules[selectedModules.length - 1].channel = channel;
    }

    setKymaResource({
      ...kymaResource,
      spec: {
        ...kymaResource.spec,
        modules: selectedModules,
      },
    });
    setIsEdited(true);
  };
  const installedModules = modules?.items.filter(module => {
    const name =
      module.metadata?.labels['operator.kyma-project.io/module-name'];
    return (
      selectedModules?.findIndex(kymaResourceModule => {
        return kymaResourceModule.name === name;
      }) !== -1
    );
  });

  const modulesEditData = (installedModules || []).reduce((acc, module) => {
    const name =
      module.metadata?.labels['operator.kyma-project.io/module-name'];
    const existingModule = acc.find(item => item.name === name);

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
          },
        ],
        docsUrl:
          module.metadata.annotations['operator.kyma-project.io/doc-url'],
      });
    } else {
      existingModule.channels?.push({
        channel: module.spec.channel,
        version: module.spec.descriptor.component.version,
        isBeta:
          module.metadata.labels['operator.kyma-project.io/beta'] === 'true',
      });
    }
    return acc;
  }, []);

  const findStatus = moduleName => {
    return kymaResource?.status?.modules?.find(
      module => moduleName === module.name,
    );
  };

  const findSpec = moduleName => {
    return kymaResource?.spec.modules?.find(
      module => moduleName === module.name,
    );
  };

  const checkIfSelectedModuleIsBeta = moduleName => {
    return selectedModules.some(({ name, channel }) => {
      if (moduleName && name !== moduleName) {
        return false;
      }
      const moduleData = modulesEditData?.find(module => module.name === name);
      return moduleData
        ? moduleData.channels.some(
            ({ channel: ch, isBeta }) => ch === channel && isBeta,
          )
        : false;
    });
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
          <Label>{module.name}</Label>
          <Select
            onChange={event => {
              setChannel(module, event.detail.selectedOption.value, index);
            }}
            value={
              findSpec(module.name)?.channel ||
              findStatus(module.name)?.channel ||
              'predefined'
            }
            className="channel-select"
          >
            <Option
              selected={
                !module.channels?.filter(
                  channel => channel.channel === findSpec(module.name)?.channel,
                )
              }
              value={'predefined'}
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
                selected={channel.channel === findSpec(module.name)?.channel}
                key={channel.channel}
                value={channel.channel}
                additionalText={channel?.isBeta ? 'Beta' : ''}
              >
                {`${channel.channel[0].toUpperCase()}${channel.channel.slice(
                  1,
                )} (v${channel.version})`}{' '}
              </Option>
            ))}
          </Select>
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
    setLayoutColumn({
      ...layoutColumn,
      layout: 'OneColumn',
      showCreate: null,
      endColumn: {
        resourceName: kymaResource.metadata.name,
        resourceType: kymaResource.kind,
        namespaceId: kymaResource.metadata.namespace,
      },
    });
    window.history.pushState(
      window.history.state,
      '',
      `${scopedUrl(`kymas/${encodeURIComponent(kymaResource.metadata.name)}`)}`,
    );
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

  return (
    <>
      {createPortal(
        <MessageBox
          type="Warning"
          open={showMessageBox.isOpen}
          onClose={() => {
            setShowMessageBox({ isOpen: false, hide: true });
          }}
          titleText={t('kyma-modules.change-release-channel')}
          actions={[
            <Button
              design="Emphasized"
              key="discard"
              onClick={() => handleCreate()}
            >
              {t('kyma-modules.change')}
            </Button>,
            <Button design="Transparent" key="cancel">{`${t(
              'common.buttons.cancel',
            )}`}</Button>,
          ]}
        >
          <Trans i18nKey="kyma-modules.change-release-channel-warning">
            <span style={{ fontWeight: 'bold' }} />
          </Trans>
        </MessageBox>,
        document.body,
      )}
      <ResourceForm
        {...props}
        className="kyma-modules-create"
        pluralKind="kymas"
        singularName={t('kyma-modules.kyma')}
        resource={kymaResource}
        initialResource={initialResource}
        initialUnchangedResource={initialUnchangedResource}
        setResource={setKymaResource}
        createUrl={props.resourceUrl}
        disableDefaultFields
        skipCreateFn={() => {
          if (isEdited && !showMessageBox.hide) {
            setShowMessageBox({ ...showMessageBox, isOpen: true, hide: true });
            return true;
          }
          return false;
        }}
      >
        <ResourceForm.CollapsibleSection
          defaultOpen
          defaultTitleType
          className="collapsible-margins"
          title={t('kyma-modules.modules-channel')}
        >
          {modulesEditData?.length !== 0 ? (
            <>
              {checkIfSelectedModuleIsBeta() ? (
                <MessageStrip
                  key={'beta'}
                  design="Warning"
                  hideCloseButton
                  style={spacing.sapUiTinyMarginTop}
                >
                  {t('kyma-modules.beta-alert')}
                </MessageStrip>
              ) : null}
              {renderModules()}
            </>
          ) : (
            <MessageStrip
              design="Warning"
              hideCloseButton
              style={spacing.sapUiSmallMarginTop}
            >
              {t('extensibility.widgets.modules.no-modules-installed')}
            </MessageStrip>
          )}
        </ResourceForm.CollapsibleSection>
      </ResourceForm>
    </>
  );
}
