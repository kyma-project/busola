import { FlexBox, Label, Option, Select } from '@ui5/webcomponents-react';

export type ModuleInfoProps = {
  module: ModuleDisplayInfo;
  onChange: Function;
};

export type ModuleDisplayInfo = {
  name: string;
  versions: VersionDisplayInfo[];
};

export type VersionDisplayInfo = {
  moduleTemplate: {
    name: string;
    namespace: string;
  };
  version: string;
  channel: string;
  installed: boolean;
  textToDisplay: string;
  beta?: boolean;
};

export default function CommunityModuleVersionSelect({
  module,
  onChange,
}: ModuleInfoProps) {
  const installedVersion = module.versions.find(v => v.installed);
  if (!installedVersion) {
    return <></>;
  }

  return (
    <FlexBox direction="Column" style={{ gap: '0.5rem' }} key={module?.name}>
      <Label>{`${module.name}:`}</Label>
      <Select
        accessibleName={`${module.name} channel select`}
        onChange={event => {
          onChange(event.detail.selectedOption.value);
        }}
        value={`${installedVersion.moduleTemplate.name}|${installedVersion.moduleTemplate.namespace}`}
        className="channel-select"
      >
        {module.versions?.map((version, idx) => (
          <Option
            selected={version.installed}
            key={`${idx}-${installedVersion.moduleTemplate.name}|${installedVersion.moduleTemplate.namespace}`}
            value={`${version.moduleTemplate.name}|${version.moduleTemplate.namespace}`}
            additionalText={version.beta ? 'Beta' : ''}
          >
            {version.textToDisplay}
          </Option>
        ))}
      </Select>
    </FlexBox>
  );
}
