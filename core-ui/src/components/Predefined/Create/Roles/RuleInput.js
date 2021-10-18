import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMicrofrontendContext } from 'react-shared';
import {
  ResourceForm,
  ResourceFormWrapper,
} from 'shared/ResourceForm/ResourceForm';

export function RuleInput({ rule, rules, setRules, isAdvanced }) {
  const { namespaceId, permissionSet } = useMicrofrontendContext();
  const { t } = useTranslation();

  const isNamespaced = !!namespaceId;

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
        placeholder={t('roles.headers.api-groups')}
        propertyPath="$.apiGroups"
      />
      <ResourceForm.TextArrayInput
        title={t('roles.headers.resources')}
        placeholder={t('roles.headers.resources')}
        propertyPath="$.resources"
      />
      <ResourceForm.TextArrayInput
        title={t('roles.headers.verbs')}
        placeholder={t('roles.headers.verbs')}
        propertyPath="$.verbs"
      />
      {isAdvanced && (
        <ResourceForm.TextArrayInput
          title={t('roles.headers.resource-names')}
          placeholder={t('roles.headers.resource-names')}
          propertyPath="$.resourceNames"
        />
      )}
      {isAdvanced && !isNamespaced && (
        <ResourceForm.TextArrayInput
          title={t('roles.headers.non-resource-urls')}
          placeholder={t('roles.headers.non-resource-urls')}
          propertyPath="$.nonResourceURLs"
        />
      )}
    </ResourceFormWrapper>
  );
}
