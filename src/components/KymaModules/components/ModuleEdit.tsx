import { FlexBox, Label, Option, Select } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';

export type ModuleInfoProps = {
  module: ModuleInfo;
  onChange: any;
};

export type ModuleInfo = {
  name: string;
  versions: VersionInfo[];
};

export type VersionInfo = {
  key: string;
  version: string;
  channel: string;
  installed: boolean;
  textToDisplay: string;
};

export default function CommunityModuleEdit({
  module,
  onChange,
}: ModuleInfoProps) {
  const { t } = useTranslation();

  const installedModule = module.versions.find(v => v.installed);
  if (!installedModule) {
    return <></>;
  }

  // console.log('MODULE', module);

  return (
    <FlexBox direction="Column" style={{ gap: '0.5rem' }} key={module?.name}>
      <Label>{`${module.name}:`}</Label>
      <Select
        accessibleName={`${module.name} channel select`}
        onChange={event => {
          onChange(module.name, event.detail.selectedOption.value);
        }}
        value={
          installedModule?.key
          // TODO: it's look like a default value, which should point to option
          // findModuleSpec(kymaResource, module.name)?.channel ||
          // findModuleStatus(kymaResource, module.name)?.channel ||
        }
        className="channel-select"
      >
        {module.versions?.map(version => (
          <Option
            selected={version.installed}
            key={version.key}
            value={`${version.key}`}
          >
            {version.textToDisplay}
          </Option>
        ))}
      </Select>
    </FlexBox>
  );
}
