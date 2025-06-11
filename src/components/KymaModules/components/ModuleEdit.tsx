import { FlexBox, Label, Option, Select } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

type ModuleInfoProps = {
  module: ModuleInfo;
  onChange: any;
};

type ModuleInfo = {
  name: string;
  versions: VersionInfo[];
};

type VersionInfo = {
  key: string;
  version: string;
  channel: string;
  installed?: boolean; //TODO: Implement it
  predefined?: boolean;
};

// TODO: this component should only display Module Edit -> Channel, optional -> ManagedBox, it shouldn't do any filtration and so on, it should be prepared earlier.

export default function CommunityModuleEdit({
  module,
  onChange,
}: ModuleInfoProps) {
  const { t } = useTranslation();

  const [versionChanged, setVersionChanged] = useState(false);

  // const predefinedChannel = module.channels.find(channel => channel.predefined);
  return (
    <FlexBox direction="Column" style={{ gap: '0.5rem' }} key={module?.name}>
      <Label>{`${module.name}:`}</Label>
      <Select
        accessibleName={`${module.name} channel select`}
        onChange={event => {
          onChange(module.name, event.detail.selectedOption.value);
        }}
        // => {
        // onChange(module, event.detail.selectedOption.value, moduleIndex);
        // }}
        value={
          // TODO: it's look like a default value, which should point to option
          // findModuleSpec(kymaResource, module.name)?.channel ||
          // findModuleStatus(kymaResource, module.name)?.channel ||
          'predefined'
        }
        className="channel-select"
      >
        {/*<Option*/}
        {/*  selected={*/}
        {/*    !module.channels?.filter(*/}
        {/*      channel =>*/}
        {/*        channel.channel ===*/}
        {/*        findModuleSpec(kymaResource, module.name)?.channel,*/}
        {/*    )*/}
        {/*  }*/}
        {/*  value={'predefined'}*/}
        {/*  key={`predefined-${module.name}`}*/}
        {/*>*/}
        {/*  {`${t(*/}
        {/*    'kyma-modules.predefined-channel',*/}
        {/*  )} (${kymaResource?.spec?.channel[0].toUpperCase()}${kymaResource?.spec?.channel.slice(*/}
        {/*    1,*/}
        {/*  )} v${*/}
        {/*    module.channels?.filter(*/}
        {/*      channel => channel.channel === kymaResource?.spec?.channel,*/}
        {/*    )[0]?.version*/}
        {/*  })`}*/}
        {/*</Option>*/}
        {module.versions?.map(version => (
          <Option
            selected={false}
            key={version.key}
            value={`${version.key}`}
            // additionalText={channel?.isBeta ? 'Beta' : ''}
          >
            {`${version.channel ?? ''} ${version.version}`}
          </Option>
        ))}
      </Select>
      {/*TODO: this shouldn't be with community modules*/}
      {/*<CheckBox*/}
      {/*  accessibleName={`${module.name} managed checkbox`}*/}
      {/*  text={t('kyma-modules.managed')}*/}
      {/*  checked={findModuleSpec(kymaResource, module.name)?.managed}*/}
      {/*  onChange={event => {*/}
      {/*    setManaged(event.target.checked, index);*/}
      {/*  }}*/}
      {/*/>*/}
    </FlexBox>
  );
}
