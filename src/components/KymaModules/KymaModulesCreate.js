import { cloneDeep } from 'lodash';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGet } from 'shared/hooks/BackendAPI/useGet';
import { MessageStrip, Option, Select, Text } from '@ui5/webcomponents-react';
import { spacing } from '@ui5/webcomponents-react-base';

import { ResourceForm } from 'shared/ResourceForm';
import './KymaModulesCreate.scss';

export default function KymaModulesCreate({ resource, ...props }) {
  const { t } = useTranslation();
  const [kymaResource, setKymaResource] = useState(cloneDeep(resource));
  const [initialResource] = useState(resource);
  const [initialUnchangedResource] = useState(resource);

  const resourceName = kymaResource?.metadata.name;
  const modulesResourceUrl = `/apis/operator.kyma-project.io/v1beta2/moduletemplates`;

  const { data: modules } = useGet(modulesResourceUrl, {
    pollingInterval: 3000,
    skip: !resourceName,
  });

  const [selectedModules] = useState(initialResource?.spec?.modules ?? []);

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
  const renderCards = () => {
    const cards = [];
    modulesEditData?.forEach((module, i) => {
      const index = selectedModules?.findIndex(selectedModule => {
        return selectedModule.name === module?.name;
      });

      const card = (
        <>
          <Text>{module.name}</Text>
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
        </>
      );
      cards.push(card);
    });

    return (
      <div className="gridbox-editModule" style={spacing.sapUiSmallMarginTop}>
        {cards}
      </div>
    );
  };

  return (
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
            {renderCards()}
          </>
        ) : (
          <MessageStrip
            design="Warning"
            hideCloseButton
            style={spacing.sapUiSmallMarginTop}
          >
            {t('extensibility.widgets.modules.no-modules')}
          </MessageStrip>
        )}
      </ResourceForm.CollapsibleSection>
    </ResourceForm>
  );
}
