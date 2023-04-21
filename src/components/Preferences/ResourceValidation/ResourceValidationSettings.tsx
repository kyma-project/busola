import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Switch } from 'fundamental-react';
import {
  getExtendedValidateResourceState,
  validateResourcesState,
} from 'state/preferences/validateResourcesAtom';
import { validationSchemasState } from 'state/validationSchemasAtom';
import { useMemo } from 'react';
import { GenericList } from 'shared/components/GenericList/GenericList';

import './ResourceValidationSettings.scss';
import { useFeature } from 'hooks/useFeature';
import { ValidationFeatureConfig } from 'state/validationEnabledSchemasAtom';

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

  const toggleCustomPolicyValidation = () => {
    if (choosePolicies) {
      // deactivate
      setValidateResources({
        isEnabled,
        choosePolicies: false,
      });
    } else {
      setValidateResources({
        isEnabled,
        choosePolicies: true,
        policies:
          (validationFeature?.isEnabled &&
            validationFeature?.config?.policies) ||
          [],
      });
    }
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
    <>
      <div className="preferences-row">
        <span className="fd-has-color-status-4">
          {t('settings.clusters.resourcesValidation.validateResources')}
        </span>
        <div>
          <Switch
            // TypeScript definitions are out of sync here
            // @ts-ignore
            localizedText={{
              switchLabel: t(
                'settings.clusters.resourcesValidation.validateResources',
              ),
            }}
            className="fd-has-display-inline-block fd-margin-begin--tiny"
            checked={isEnabled}
            onChange={toggleVisibility}
            compact
          />
        </div>
      </div>
      {isEnabled && (
        <div className="preferences-row">
          <span className="fd-has-color-status-4">
            {t('settings.clusters.resourcesValidation.choose-policies')}
          </span>
          <div>
            <Switch
              // TypeScript definitions are out of sync here
              // @ts-ignore
              localizedText={{
                switchLabel: t(
                  'settings.clusters.resourcesValidation.choose-policies',
                ),
              }}
              className="fd-has-display-inline-block fd-margin-begin--tiny"
              checked={choosePolicies}
              onChange={toggleCustomPolicyValidation}
              compact
            />
          </div>
        </div>
      )}
      {isEnabled &&
        (choosePolicies ||
          policyList.filter(policy => policy.selected).length > 0) && (
          <>
            <GenericList
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
                      // TypeScript definitions are out of sync here
                      // @ts-ignore
                      localizedText={{
                        switchLabel: t(
                          'settings.clusters.resourcesValidation.select-policy',
                          {
                            name: entry.text,
                          },
                        ),
                      }}
                      compact
                      checked={entry.selected}
                      onChange={() => {
                        if (entry.selected) deleteSelectedPolicy(entry.key);
                        else addSelectedPolicy(entry.key);
                      }}
                    />
                  )}
                </div>,
              ]}
              searchSettings={{
                showSearchSuggestion: false,
                noSearchResultMessage: t('clusters.list.no-policies-found'),
                textSearchProperties: ['key', 'text'],
              }}
            />
          </>
        )}
    </>
  );
}
