import {
  Card,
  CheckBox,
  Label,
  Option,
  Panel,
  Select,
  ListItemStandard,
  Text,
  Title,
} from '@ui5/webcomponents-react';
import { ExternalLink } from 'shared/components/ExternalLink/ExternalLink';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

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
  setChannel,
  findStatus,
  findSpec,
  checkIfStatusModuleIsBeta,
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

  return (
    <Card key={module.name} className="addModuleCard">
      <ListItemStandard
        className="moduleCardHeader"
        onClick={e => setCheckbox(module, !isChecked(module.name), index)}
      >
        <CheckBox className="checkbox" checked={isChecked(module.name)} />
        <div className="titles">
          <Title level="H6" size="H6">
            {module.name}
          </Title>
          <Text className="bsl-has-color-status-4">
            {findStatus(module.name)?.version
              ? `v${findStatus(module.name)?.version} ${
                  checkIfStatusModuleIsBeta(module.name) ? '(Beta)' : ''
                }`
              : module.channels.find(
                  channel => kymaResource?.spec?.channel === channel.channel,
                )?.version
              ? `v${
                  module.channels.find(
                    channel => kymaResource?.spec?.channel === channel.channel,
                  )?.version
                } ${checkIfStatusModuleIsBeta(module.name) ? '(Beta)' : ''}`
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
            {t('kyma-modules.module-documentation')}
          </ExternalLink>
        )}
      </div>
      <Panel
        className="settings-panel"
        collapsed
        headerText="Advanced"
        noAnimation
        data-testid={`module-settings-panel-${module.name}`}
      >
        <div className="settings-panel__content sap-margin-y-small">
          <Label>{t('kyma-modules.release-channel') + ':'} </Label>
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
                key={`${channel.channel}${
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
        </div>
      </Panel>
    </Card>
  );
}
