import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMicrofrontendContext } from 'react-shared';
import {
  ResourceForm,
  ResourceFormWrapper,
} from 'shared/ResourceForm/ResourceForm';
import { InvalidRoleError } from './InvalidRoleError';

export function RuleInput({ rule, rules, setRules, isAdvanced }) {
  const { namespaceId, permissionSet } = useMicrofrontendContext();
  const { t } = useTranslation();

  const isNamespaced = !!namespaceId;

  console.log(permissionSet);

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
      <ResourceForm.TextArrayInput
        title={t('roles.headers.api-groups')}
        propertyPath="$.apiGroups"
        inputProps={{
          placeholder: t('roles.headers.api-groups'),
        }}
      />
      <ResourceForm.TextArrayInput
        title={t('roles.headers.resources')}
        propertyPath="$.resources"
        inputProps={{
          placeholder: t('roles.headers.resources'),
        }}
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
        <ResourceForm.TextArrayInput
          title={t('roles.headers.non-resource-urls')}
          placeholder={t('roles.headers.non-resource-urls')}
          propertyPath="$.nonResourceURLs"
          inputProps={{
            placeholder: t('roles.headers.non-resource-urls'),
          }}
        />
      )}
      <InvalidRoleError rule={rule} />
    </ResourceFormWrapper>
  );
}
