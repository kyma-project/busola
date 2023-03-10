import { useTranslation } from 'react-i18next';
import { atom, useRecoilState, useRecoilValue } from 'recoil';
import { Switch, ComboboxInput } from 'fundamental-react';
import { validateResourcesState } from 'state/preferences/validateResourcesAtom';
import { validationSchemasState } from 'state/validationSchemasAtom';
import { useMemo } from 'react';
import { GenericList } from 'shared/components/GenericList/GenericList';

type PolicyPreferences = Array<string>;

const policyState = atom<PolicyPreferences>({
  key: 'validation-policies-state',
  default: ['Default'],
});

const validateCustomPoliciesState = atom<boolean>({
  key: 'validate-custom-resources',
  default: false,
});

export default function ResourcesValidationSettings() {
  const { t } = useTranslation();
  const [validateResources, setValidateResources] = useRecoilState(
    validateResourcesState,
  );

  const [validateCustomPolicies, setValidateCustomPolicies] = useRecoilState(
    validateCustomPoliciesState,
  );

  const validationSchemas = useRecoilValue(validationSchemasState);
  const allOptions = useMemo(
    () =>
      validationSchemas?.policies
        .map(policy => ({ key: policy.name, text: policy.name }))
        .sort((a, b) => (a.key < b.key ? -1 : 1)) ?? [],
    [validationSchemas],
  );

  const [config, setConfig] = useRecoilState(policyState);

  const remainingOptions = useMemo(
    () => allOptions.filter(option => !config.includes(option.key)),
    [allOptions, config],
  );

  const toggleVisibility = () => {
    setValidateResources(!validateResources);
  };

  const toggleCustomPolicyValidation = () => {
    setValidateCustomPolicies(!validateCustomPolicies);
  };

  return (
    <>
      <div className="preferences-row">
        <span className="fd-has-color-status-4">
          {t('settings.clusters.resourcesValidation')}
        </span>
        <div>
          <Switch
            // TypeScript definitions are out of sync here
            // @ts-ignore
            localizedText={{
              switchLabel: t('settings.clusters.resourcesValidation'),
            }}
            className="fd-has-display-inline-block fd-margin-begin--tiny"
            checked={validateResources}
            onChange={toggleVisibility}
            compact
          />
        </div>
      </div>
      {validateResources && (
        <div className="preferences-row">
          <span className="fd-has-color-status-4">Use custom policies</span>
          <div>
            <Switch
              // TypeScript definitions are out of sync here
              // @ts-ignore
              localizedText={{
                switchLabel: t('settings.clusters.resourcesValidation'),
              }}
              className="fd-has-display-inline-block fd-margin-begin--tiny"
              checked={validateCustomPolicies}
              onChange={toggleCustomPolicyValidation}
              compact
            />
          </div>
        </div>
      )}
      {validateResources && validateCustomPolicies && (
        <GenericList
          actions={[
            {
              name: 'Delete',
              handler: (entry: string) => {
                setConfig(config.filter(c => c !== entry));
              },
            },
          ]}
          entries={config}
          showHeader={false}
          headerRenderer={() => ['policies']}
          rowRenderer={entry => [entry]}
          extraHeaderContent={
            remainingOptions.length > 0 && (
              //@ts-ignore
              <ComboboxInput
                options={remainingOptions}
                placeholder="Add a policy"
                searchFullString
                compact
                onSelectionChange={(
                  _: any,
                  selected: { key: string | number; text: string },
                ) => {
                  if (selected.key === -1) return;
                  setConfig(currVal => {
                    return [...currVal, selected.text].sort();
                  });
                }}
              />
            )
          }
          searchSettings={{
            showSearchSuggestion: false,
            noSearchResultMessage: t('clusters.list.no-clusters-found'),
          }}
        />
      )}
    </>
  );
}
