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
  moduleTemplate: {
    name: string;
    namespace: string;
  };
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

  const installedVersion = module.versions.find(v => v.installed);
  if (!installedVersion) {
    return <></>;
  }

  console.log('MODULE', module);
  console.log('Installed Version', installedVersion);

  return (
    <FlexBox direction="Column" style={{ gap: '0.5rem' }} key={module?.name}>
      <Label>{`${module.name}:`}</Label>
      <Select
        accessibleName={`${module.name} channel select`}
        onChange={event => {
          onChange(module.name, event.detail.selectedOption.value);
        }}
        value={`${installedVersion.moduleTemplate.name}|${installedVersion.moduleTemplate.namespace}`}
        className="channel-select"
      >
        {module.versions?.map((version, idx) => (
          <Option
            selected={version.installed}
            key={`${idx}-${installedVersion.moduleTemplate.name}|${installedVersion.moduleTemplate.namespace}`}
            value={`${version.moduleTemplate.name}|${version.moduleTemplate.namespace}`}
          >
            {version.textToDisplay}
          </Option>
        ))}
      </Select>
    </FlexBox>
  );
}
