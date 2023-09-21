import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Button, Switch } from '@ui5/webcomponents-react';
import {
  getExtendedValidateResourceState,
  validateResourcesState,
} from 'state/preferences/validateResourcesAtom';
import { validationSchemasState } from 'state/validationSchemasAtom';
import { useMemo } from 'react';
import { GenericList } from 'shared/components/GenericList/GenericList';

import { useFeature } from 'hooks/useFeature';
import { ValidationFeatureConfig } from 'state/validationEnabledSchemasAtom';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';

import './ResourceValidationSettings.scss';

export default function ResourceValidationSettings() {
  const { t } = useTranslation();
  const [validateResources, setValidateResources] = useRecoilState(
    validateResourcesState,
  );
  const validationFeature = useFeature(
    'RESOURCE_VALIDATION',
  ) as ValidationFeatureConfig;

  const {
    isEnabled,
    choosePolicies,
    policies: selectedPolicies = (validationFeature?.isEnabled &&
      validationFeature?.config?.policies) ||
      [],
  } = getExtendedValidateResourceState(validateResources);

  const validationSchemas = useRecoilValue(validationSchemasState);
  const allOptions = useMemo(
    () =>
      validationSchemas?.policies
        .map(policy => ({ key: policy.name, text: policy.name }))
        .sort((a, b) => (a.key < b.key ? -1 : 1)) ?? [],
    [validationSchemas],
  );

  const policyList = useMemo(() => {
    const selectedPolicySet = selectedPolicies.reduce(
      (agg, name) => agg.add(name),
      new Set(),
    );
    return allOptions.map(option => ({
      ...option,
      selected: selectedPolicySet.has(option.key),
    }));
  }, [allOptions, selectedPolicies]);

  const toggleVisibility = () => {
    setValidateResources({
      isEnabled: !isEnabled,
      choosePolicies,
      policies: selectedPolicies,
    });
  };

  const enablePolicyCustomization = () => {
    setValidateResources({
      isEnabled,
      choosePolicies: true,
      policies:
        (validationFeature?.isEnabled && validationFeature?.config?.policies) ||
        [],
    });
  };

  const disablePolicyCustomization = () => {
    setValidateResources({
      isEnabled,
      choosePolicies: false,
    });
  };

  const deleteSelectedPolicy = (policyToDelete: string) => {
    setValidateResources({
      isEnabled,
      choosePolicies,
      policies: selectedPolicies.filter(policy => policy !== policyToDelete),
    });
  };

  const addSelectedPolicy = (policyToAdd: string) => {
    setValidateResources({
      isEnabled,
      choosePolicies,
      policies: [...selectedPolicies, policyToAdd].sort(),
    });
  };

  return (
    <UI5Panel
      title={t('settings.clusters.resourcesValidation.validateResources')}
      headerActions={
        <Switch
          aria-label={t(
            'settings.clusters.resourcesValidation.validateResources',
          )}
          checked={isEnabled}
          onChange={toggleVisibility}
        />
      }
    >
      {!isEnabled && (
        <div className="no-validation-info">
          <span className="fd-has-color-status-4">
            {t('settings.clusters.resourcesValidation.validation-disabled')}
          </span>
        </div>
      )}
      {isEnabled &&
        (choosePolicies ||
          policyList.filter(policy => policy.selected).length > 0) && (
          <>
            <GenericList
              title={t(
                'settings.clusters.resourcesValidation.enabled-policies',
              )}
              showHeader={false}
              entries={
                choosePolicies
                  ? policyList
                  : policyList.filter(policy => policy.selected)
              }
              headerRenderer={() => ['policies']}
              rowRenderer={entry => [
                <div className="policy-row">
                  <span>{entry.text}</span>
                  {choosePolicies && (
                    <Switch
                      aria-label={t(
                        'settings.clusters.resourcesValidation.select-policy',
                        {
                          name: entry.text,
                        },
                      )}
                      checked={entry.selected}
                      onChange={() => {
                        if (entry.selected) deleteSelectedPolicy(entry.key);
                        else addSelectedPolicy(entry.key);
                      }}
                    />
                  )}
                </div>,
              ]}
              extraHeaderContent={
                <>
                  {!choosePolicies && (
                    <Button
                      design="Transparent"
                      icon="customize"
                      iconEnd
                      className="fd-margin-begin--sm"
                      onClick={enablePolicyCustomization}
                    >
                      {t('settings.clusters.resourcesValidation.customize')}
                    </Button>
                  )}
                  {choosePolicies && (
                    <Button
                      design="Transparent"
                      icon="reset"
                      iconEnd
                      className="fd-margin-begin--sm"
                      onClick={disablePolicyCustomization}
                    >
                      {t('settings.clusters.resourcesValidation.reset')}
                    </Button>
                  )}
                </>
              }
              searchSettings={{
                showSearchSuggestion: false,
                noSearchResultMessage: t(
                  'settings.clusters.resourcesValidation.no-policies-found',
                ),
                textSearchProperties: ['key', 'text'],
              }}
            />
          </>
        )}
    </UI5Panel>
  );
}
