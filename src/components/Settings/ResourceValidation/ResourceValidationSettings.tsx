import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { FlexBox, Form, Switch } from '@ui5/webcomponents-react';
import { useMemo } from 'react';
import { FormField } from 'shared/ResourceForm/components/FormField';
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
    setValidateResources((prev) => {
      const ext =
        typeof prev === 'object' ? prev : { isEnabled: prev as boolean };
      return { ...ext, isEnabled: !ext.isEnabled };
    });
  };

  const deleteSelectedPolicy = (policyToDelete: string) => {
    setValidateResources({
      isEnabled,
      policies: selectedPolicies.filter(
        (policy: string) => policy !== policyToDelete,
      ),
      userModified: true,
    });
  };

  const addSelectedPolicy = (policyToAdd: string) => {
    setValidateResources({
      isEnabled,
      policies: [...selectedPolicies, policyToAdd].sort(),
      userModified: true,
    });
  };

  return (
    <>
      <Form
        className="sap-margin-small"
        labelSpan="S12 M4 L4 XL4"
        layout="S1 M1 L1 XL1"
      >
        <FormField
          className="resources-validation-switch"
          label={t('settings.general.resourcesValidation.validateResources')}
          input={(props) => (
            <Switch
              {...props}
              checked={isEnabled}
              onChange={toggleVisibility}
            />
          )}
        />

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
              className="resource-validation-table sap-margin-small"
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
      </Form>
    </>
  );
}
