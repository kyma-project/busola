import {
  Card,
  CheckBox,
  Label,
  Option,
  Panel,
  Select,
  StandardListItem,
  Title,
} from '@ui5/webcomponents-react';
import { ExternalLink } from 'shared/components/ExternalLink/ExternalLink';
import { useTranslation } from 'react-i18next';
import { spacing } from '@ui5/webcomponents-react-base';

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

  return (
    <Card key={module.name} className="addModuleCard">
      <StandardListItem
        className="moduleCardHeader"
        onClick={e => setCheckbox(module, !isChecked(module.name), index)}
      >
        <CheckBox className="checkbox" checked={isChecked(module.name)} />
        <div className="titles">
          <Title level="H6">{module.name}</Title>
        </div>
        <img className="avatar" alt="SAP" src="\assets\sap-logo.svg" />
      </StandardListItem>
      <div className="content">
        {module.docsUrl && (
          <ExternalLink
            url={module.docsUrl}
            linkStyle={{
              ...spacing.sapUiTinyMarginTop,
              ...spacing.sapUiSmallMarginBottom,
            }}
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
      >
        <div
          className="settings-panel__content"
          style={spacing.sapUiSmallMarginTopBottom}
        >
          <Label>{t('kyma-modules.release-channel') + ':'} </Label>
          <Select
            onChange={event => {
              setChannel(module, event.detail.selectedOption.value, index);
            }}
            value={
              findSpec(module.name)?.channel ||
              findStatus(module.name)?.channel ||
              kymaResource?.spec?.channel
            }
            className="channel-select"
          >
            {module.channels?.map(channel => (
              <Option
                selected={
                  channel.channel === findSpec(module.name)?.channel ||
                  channel.channel === findStatus(module.name)?.channel ||
                  channel.channel === kymaResource?.spec?.channel
                }
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
        </div>
      </Panel>
    </Card>
  );
}
