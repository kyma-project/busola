import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { FlexBox, Label, Switch } from '@ui5/webcomponents-react';
import { useMemo } from 'react';
import { GenericList } from 'shared/components/GenericList/GenericList';

import { useSyncedValidateResources } from 'state/settings/validateResourcesAtom';
import { validationSchemasAtom } from 'state/validationSchemasAtom';
import './ResourceValidationSettings.scss';

export default function ResourceValidationSettings() {
  const { t } = useTranslation();

  const [{ isEnabled, policies }, setValidateResources] =
    useSyncedValidateResources();

  const selectedPolicies = policies;

  const validationSchemas = useAtomValue(validationSchemasAtom);
  const allOptions = useMemo(
    () =>
      validationSchemas?.policies
        .map((policy) => ({ key: policy.name, text: policy.name }))
        .sort((a, b) => (a.key < b.key ? -1 : 1)) ?? [],
    [validationSchemas],
  );
  const policyList = useMemo(() => {
    const selectedPolicySet = new Set(selectedPolicies);
    return allOptions.map((option) => ({
      ...option,
      selected: selectedPolicySet.has(option.key),
    }));
  }, [allOptions, selectedPolicies]);

  const toggleVisibility = () => {
    setValidateResources({
      isEnabled: !isEnabled,
      policies: selectedPolicies,
    });
  };

  const deleteSelectedPolicy = (policyToDelete: string) => {
    setValidateResources({
      isEnabled,
      policies: selectedPolicies.filter(
        (policy: string) => policy !== policyToDelete,
      ),
    });
  };

  const addSelectedPolicy = (policyToAdd: string) => {
    setValidateResources({
      isEnabled,
      policies: [...selectedPolicies, policyToAdd].sort(),
    });
  };

  return (
    <>
      <FlexBox
        alignItems="Center"
        gap={'0.5rem'}
        className="resource-validation-container sap-margin-small"
      >
        <Label showColon>
          {t('settings.general.resourcesValidation.validateResources')}
        </Label>
        <Switch
          accessibleName={t(
            'settings.general.resourcesValidation.validateResources',
          )}
          checked={isEnabled}
          onChange={toggleVisibility}
        />
      </FlexBox>
      {!isEnabled && (
        <div className="no-validation-info">
          <span className="bsl-has-color-status-4">
            {t('settings.general.resourcesValidation.validation-disabled')}
          </span>
        </div>
      )}
      {isEnabled && policyList.length > 0 && (
        <>
          <GenericList
            className="resource-validation-table"
            title={t(
              'settings.general.resourcesValidation.validation-policies',
            )}
            //@ts-expect-error Type mismatch between js and ts
            entries={policyList}
            headerRenderer={() => ['']} //Throws an error if it's empty - header column is hidden with CSS
            rowRenderer={(entry) => [
              <FlexBox gap="0.5rem" key={entry.text} className="policy-row">
                <Switch
                  accessibleName={t(
                    'settings.general.resourcesValidation.select-policy',
                    {
                      name: entry.text,
                    },
                  )}
                  checked={entry.selected}
                  onChange={() => {
                    if (entry.selected) deleteSelectedPolicy(entry.key);
                    else addSelectedPolicy(entry.key);
                  }}
                  style={{ paddingLeft: '4px' }}
                />
                <span>{entry.text}</span>
              </FlexBox>,
            ]}
            searchSettings={{
              showSearchSuggestion: false,
              noSearchResultTitle: t(
                'settings.general.resourcesValidation.no-policies-found',
              ),
              noSearchResultSubtitle: '',
              textSearchProperties: ['key', 'text'],
              showSearchField: true,
              allowSlashShortcut: true,
            }}
          />
        </>
      )}
    </>
  );
}
