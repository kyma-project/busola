import { useEffect, useState } from 'react';
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
  const iconLink = module.versions[0]?.icon.link;

  if (iconLink && (await isImageAvailable(iconLink))) {
    return iconLink;
  } else {
    return defaultImage;
  }
}

export default function CommunityModuleCard({
  module,
  isChecked,
  onChange,
  selectedModules,
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
    <Card key={`card-${module.name}`} className="addModuleCard">
      <ListItemStandard
        className="moduleCardHeader"
        key={`list-${module.name}`}
        onClick={() => {
          onChange(
            `${module.versions[0].moduleTemplate.name}|${module.versions[0].moduleTemplate.namespace}`,
            isChecked(module.name),
          );
        }}
      >
        <CheckBox className="checkbox" checked={isChecked(module.name)} />
        <div className="titles">
          <Title level="H6" size="H6">
            {module.name}
          </Title>
          <Text className="bsl-has-color-status-4"></Text>
        </div>
        {imageSrc !== '' && (
          <img
            className="avatar"
            alt={
              module.versions[0]?.icon.name
                ? module.versions[0]?.icon.name
                : 'SAP'
            }
            src={imageSrc}
          />
        )}
      </ListItemStandard>
      <div className="content">
        {module.versions[0]?.docsURL && (
          <ExternalLink
            url={module.versions[0]?.docsURL}
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
            accessibleName={`${module.name} channel select`}
            onChange={event => {
              onChange(event.detail.selectedOption.value, false);
            }}
            value={`${module.versions[0].moduleTemplate.name}|${module.versions[0].moduleTemplate.namespace}`}
            className="channel-select"
          >
            {module.versions?.map((version, idx) => (
              <Option
                selected={selectedModules.get(module.name)}
                key={`option-${version.moduleTemplate.name}|${version.moduleTemplate.namespace}`}
                value={`${version.moduleTemplate.name}|${version.moduleTemplate.namespace}`}
                additionalText={version.beta ? 'Beta' : ''}
              >
                {version.textToDisplay}
              </Option>
            ))}
          </Select>
        </div>
      </Panel>
    </Card>
  );
}
