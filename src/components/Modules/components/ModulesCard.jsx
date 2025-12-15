import { useEffect, useMemo, useState } from 'react';
import {
  Card,
  CheckBox,
  Label,
  ListItemStandard,
  Option,
  Panel,
  Select,
  Text,
  Title,
} from '@ui5/webcomponents-react';
import { ExternalLink } from 'shared/components/ExternalLink/ExternalLink';
import { useTranslation } from 'react-i18next';
import {
  findModuleSpec,
  findModuleStatus,
  setChannel,
} from 'components/Modules/support';

async function isImageAvailable(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function getImageSrc(module) {
  const defaultImage = '/assets/sap-logo.svg';
  const iconLink = module.icon.link;

  if (iconLink && (await isImageAvailable(iconLink))) {
    return iconLink;
  } else {
    return defaultImage;
  }
}

export default function ModulesCard({
  module,
  kymaResource,
  index,
  isChecked,
  setCheckbox,
  checkIfStatusModuleIsBeta,
  selectedModules,
  setSelectedModules,
}) {
  const { t } = useTranslation();
  const [imageSrc, setImageSrc] = useState('');

  useEffect(() => {
    async function checkImage() {
      const src = await getImageSrc(module);
      setImageSrc(src);
    }

    checkImage();
  }, [module]);

  const defaultVersion = useMemo(
    () =>
      module?.channels?.find(
        (channel) => channel?.channel === kymaResource?.spec?.channel,
      )?.version,
    [kymaResource?.spec?.channel, module?.channels],
  );

  // Check if the module version from kymaResource exists and set the channel if not.
  const checkIfVersionExistsAndSet = () => {
    if (!defaultVersion && module?.channels?.[0]?.channel) {
      setChannel(
        module,
        module.channels[0].channel,
        index,
        selectedModules,
        setSelectedModules,
      );
    }
  };

  const getNameForVersion = (version) => {
    if (typeof version === 'string' && version.startsWith('v')) {
      return version;
    }
    return `v${version}`;
  };

  const getSelectedValue = () => {
    const defaultValue = defaultVersion
      ? 'predefined'
      : module?.channels?.[0]?.channel;
    return (
      findModuleSpec(kymaResource, module.name)?.channel ||
      findModuleStatus(kymaResource, module.name)?.channel ||
      defaultValue
    );
  };

  return (
    <Card
      accessibleName={module.name}
      key={module.name}
      className="addModuleCard"
    >
      <ListItemStandard
        className="moduleCardHeader"
        onClick={() => {
          setCheckbox(module, !isChecked(module.name), index);
          checkIfVersionExistsAndSet();
        }}
      >
        <CheckBox
          accessibleName={`${module.name}  module`}
          className="checkbox"
          checked={isChecked(module.name)}
        />
        <div className="titles">
          <Title level="H6" size="H6">
            {module.name}
          </Title>
          <Text className="bsl-has-color-status-4">
            {findModuleStatus(kymaResource, module.name)?.version
              ? `v${findModuleStatus(kymaResource, module.name)?.version} ${
                  checkIfStatusModuleIsBeta(module.name) ? '(Beta)' : ''
                }`
              : module.channels.find(
                    (channel) =>
                      kymaResource?.spec?.channel === channel.channel,
                  )?.version
                ? `v${
                    module.channels.find(
                      (channel) =>
                        kymaResource?.spec?.channel === channel.channel,
                    )?.version
                  } ${checkIfStatusModuleIsBeta(module.name) ? '(Beta)' : ''}`
                : module?.channels?.[0]?.version
                  ? `v${module?.channels?.[0]?.version}`
                  : t('kyma-modules.no-version')}
          </Text>
        </div>
        {imageSrc !== '' && (
          <img
            className="avatar"
            alt={module.icon.name ? module.icon.name : 'SAP'}
            src={imageSrc}
          />
        )}
      </ListItemStandard>
      <div className="content">
        {module.docsUrl && (
          <ExternalLink
            url={module.docsUrl}
            linkClassName="sap-margin-top-tiny sap-margin-bottom-small"
          >
            {t('kyma-modules.documentation')}
          </ExternalLink>
        )}
      </div>
      <Panel
        className="settings-panel"
        collapsed
        headerText="Advanced"
        noAnimation
        data-testid={`module-settings-panel-${module.name}`}
        accessibleName={t('kyma-modules.accessible-name.advanced')}
      >
        <div className="settings-panel__content sap-margin-y-small">
          <Label>{t('kyma-modules.release-channel') + ':'} </Label>
          <Select
            onChange={(event) => {
              setChannel(
                module,
                event.detail.selectedOption.value,
                index,
                selectedModules,
                setSelectedModules,
              );
            }}
            value={getSelectedValue()}
            className="channel-select"
          >
            {defaultVersion && (
              <Option
                selected={module?.channels?.find(
                  (channel) =>
                    channel.channel ===
                    findModuleSpec(kymaResource, module.name)?.channel,
                )}
                value={'predefined'}
              >
                {`${t(
                  'kyma-modules.predefined-channel',
                )} (${kymaResource?.spec?.channel[0].toUpperCase()}${kymaResource?.spec?.channel.slice(
                  1,
                )} ${getNameForVersion(defaultVersion)})`}
              </Option>
            )}
            {module.channels?.map((channel) => (
              <Option
                selected={
                  channel.channel ===
                  findModuleSpec(kymaResource, module.name)?.channel
                }
                key={`${channel.channel}${
                  channel.isMetaRelease ? '-meta' : ''
                }`}
                value={channel.channel}
                additionalText={channel?.isBeta ? 'Beta' : ''}
              >
                {`${(
                  channel?.channel[0] || ''
                ).toUpperCase()}${channel.channel.slice(
                  1,
                )} (${getNameForVersion(channel.version)})`}{' '}
              </Option>
            ))}
          </Select>
        </div>
      </Panel>
    </Card>
  );
}
