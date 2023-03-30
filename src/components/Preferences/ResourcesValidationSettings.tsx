import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Switch, ComboboxInput } from 'fundamental-react';
import {
  getExtendedValidateResourceState,
  validateResourcesState,
} from 'state/preferences/validateResourcesAtom';
import { validationSchemasState } from 'state/validationSchemasAtom';
import { useMemo } from 'react';
import { GenericList } from 'shared/components/GenericList/GenericList';

export default function ResourcesValidationSettings() {
  const { t } = useTranslation();
  const [validateResources, setValidateResources] = useRecoilState(
    validateResourcesState,
  );

  const {
    enabled,
    choosePolicies,
    policies: selectedPolicies = [],
  } = getExtendedValidateResourceState(validateResources);

  const validationSchemas = useRecoilValue(validationSchemasState);
  const allOptions = useMemo(
    () =>
      validationSchemas?.policies
        .map(policy => ({ key: policy.name, text: policy.name }))
        .sort((a, b) => (a.key < b.key ? -1 : 1)) ?? [],
    [validationSchemas],
  );

  const remainingOptions = useMemo(
    () => allOptions.filter(option => !selectedPolicies.includes(option.key)),
    [allOptions, selectedPolicies],
  );

  const toggleVisibility = () => {
    setValidateResources({
      enabled: !enabled,
      choosePolicies,
      policies: selectedPolicies,
    });
  };

  const toggleCustomPolicyValidation = () => {
    setValidateResources({
      enabled,
      choosePolicies: !choosePolicies,
      policies: selectedPolicies,
    });
  };

  const deleteSelectedPolicy = (policyToDelete: string) => {
    setValidateResources({
      enabled,
      choosePolicies,
      policies: selectedPolicies.filter(policy => policy !== policyToDelete),
    });
  };

  const addSelectedPolicy = (policyToAdd: string) => {
    setValidateResources({
      enabled,
      choosePolicies,
      policies: [...selectedPolicies, policyToAdd].sort(),
    });
  };

  // This gets newly generated whenever the props change, removing the typed value
  const PolicyComboBox = ({ ...props }) => (
    // @ts-ignore
    <ComboboxInput
      {...props}
      placeholder={t('settings.clusters.resourcesValidation.add-policy')}
    />
  );

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
            checked={enabled}
            onChange={toggleVisibility}
            compact
          />
        </div>
      </div>
      {enabled && (
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
      {enabled && choosePolicies && (
        <GenericList
          actions={[
            {
              name: 'Delete', //t('settings.clusters.resourcesValidation.remove-policy'),
              handler: deleteSelectedPolicy,
            },
          ]}
          showHeader={false}
          entries={selectedPolicies}
          headerRenderer={() => ['policies']}
          rowRenderer={entry => [entry]}
          extraHeaderContent={
            remainingOptions.length > 0 && (
              //@ts-ignore
              <PolicyComboBox
                options={remainingOptions}
                searchFullString
                compact
                onSelectionChange={(
                  _: any,
                  selected: { key: string | number; text: string },
                ) => {
                  if (selected.key === -1) return;
                  addSelectedPolicy(selected.text);
                }}
              />
            )
          }
          searchSettings={{
            showSearchSuggestion: false,
            noSearchResultMessage: t('clusters.list.no-policies-found'),
          }}
        />
      )}
    </>
  );
}
