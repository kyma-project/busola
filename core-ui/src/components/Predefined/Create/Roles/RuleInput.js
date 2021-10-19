import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMicrofrontendContext } from 'react-shared';
import {
  ResourceForm,
  ResourceFormWrapper,
} from 'shared/ResourceForm/ResourceForm';
import { InvalidRoleError } from './InvalidRoleError';
import { MultiInput } from 'shared/ResourceForm/components/FormComponents';
import { FormInput } from 'fundamental-react';

function ComboboxArrayInput({
  defaultOpen,
  inputProps,
  isAdvanced,
  tooltipContent,
  sectionTooltipContent,
  options,
  ...props
}) {
  return (
    <MultiInput
      defaultOpen={defaultOpen}
      isAdvanced={isAdvanced}
      toInternal={value => value || []}
      toExternal={value => value.filter(val => !!val)}
      tooltipContent={tooltipContent}
      sectionTooltipContent={sectionTooltipContent}
      inputs={[
        ({ value, setValue, ref, onBlur, focus }) => (
          <ResourceForm.ComboboxInput
            key={`form-${props.title}`}
            compact
            value={value || ''}
            defaultKey={value || ''}
            ref={ref}
            setValue={setValue}
            options={options}
            onKeyDown={focus}
            onBlur={onBlur}
          />
        ),
      ]}
      {...props}
    />
  );
}

export function RuleInput({ rule, rules, setRules, isAdvanced }) {
  const { namespaceId, ssrrStatus } = useMicrofrontendContext();
  const { t } = useTranslation();

  const isNamespaced = !!namespaceId;
  const { resourceRules, nonResourceRules } = ssrrStatus;

  const flatUnique = (arr, property) => [
    ...new Set(arr.flatMap(r => r[property])),
  ];

  const nonResourceUrls = flatUnique(nonResourceRules, 'nonResourceURLs');
  let apiGroups = flatUnique(resourceRules, 'apiGroups');

  let resources = flatUnique(resourceRules, 'resources');
  if (rule.apiGroups?.length && !rule.apiGroups.includes('*')) {
    const t = resourceRules.filter(r =>
      r.apiGroups.find(r2 => rule.apiGroups.includes(r2)),
    );
    resources = flatUnique(t, 'resources');

    console.log(t, resources);
  }

  return (
    <ResourceFormWrapper
      isAdvanced={isAdvanced}
      resource={rule}
      setResource={r => {
        rule.verbs = r.verbs;
        rule.apiGroups = r.apiGroups;
        rule.resources = r.resources;
        setRules([...rules]);
      }}
    >
      <ComboboxArrayInput
        title={t('roles.headers.api-groups')}
        propertyPath="$.apiGroups"
        inputProps={{
          placeholder: t('roles.headers.api-groups'),
        }}
        options={apiGroups.map(i => ({ key: i, text: i }))}
        isAdvanced={isAdvanced}
      />
      <ComboboxArrayInput
        title={t('roles.headers.resources')}
        propertyPath="$.resources"
        inputProps={{
          placeholder: t('roles.headers.resources'),
        }}
        options={resources.map(i => ({ key: i, text: i }))}
      />
      <ResourceForm.TextArrayInput
        title={t('roles.headers.verbs')}
        propertyPath="$.verbs"
        inputProps={{
          placeholder: t('roles.headers.verbs'),
        }}
      />
      {isAdvanced && (
        <ResourceForm.TextArrayInput
          title={t('roles.headers.resource-names')}
          propertyPath="$.resourceNames"
          inputProps={{
            placeholder: t('roles.headers.resource-names'),
          }}
        />
      )}
      {isAdvanced && !isNamespaced && (
        <ComboboxArrayInput
          title={t('roles.headers.non-resource-urls')}
          placeholder={t('roles.headers.non-resource-urls')}
          propertyPath="$.nonResourceURLs"
          inputProps={{
            placeholder: t('roles.headers.non-resource-urls'),
          }}
          options={nonResourceUrls.map(i => ({ key: i, text: i }))}
        />
      )}
      <InvalidRoleError rule={rule} />
    </ResourceFormWrapper>
  );
}
