import { useTranslation } from 'react-i18next';
import jsyaml from 'js-yaml';
import { saveAs } from 'file-saver';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Button, LayoutPanel, Switch } from 'fundamental-react';
import {
  getExtendedValidateResourceState,
  validateResourcesState,
} from 'state/preferences/validateResourcesAtom';
import { validationSchemasState } from 'state/validationSchemasAtom';
import { useCallback, useMemo } from 'react';
import { GenericList } from 'shared/components/GenericList/GenericList';

import './ResourceValidationSettings.scss';
import { useFeature } from 'hooks/useFeature';
import {
  convertPoliciesForDatree,
  usePolicySet,
  ValidationFeatureConfig,
} from 'state/validationEnabledSchemasAtom';
import { useNotification } from 'shared/contexts/NotificationContext';

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

  const policySet = usePolicySet();
  const notification = useNotification();

  const download = useCallback(() => {
    if (validationSchemas) {
      try {
        const customPolicyDefinition = convertPoliciesForDatree(
          validationSchemas,
          policySet,
        );
        const kubeconfigYaml = jsyaml.dump(customPolicyDefinition);
        const blob = new Blob([kubeconfigYaml], {
          type: 'application/yaml;charset=utf-8',
        });
        saveAs(blob, `customPolicies.yaml`);
      } catch (e) {
        console.error(e);
        notification.notifyError({
          content: t('settings.clusters.resourcesValidation.download-error'),
        });
      }
    } else {
      notification.notifyError({
        content: t('settings.clusters.resourcesValidation.rule-set-missing'),
      });
    }
  }, [validationSchemas, policySet, notification, t]);

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
    <LayoutPanel>
      <LayoutPanel.Header>
        <LayoutPanel.Head
          title={t('settings.clusters.resourcesValidation.validateResources')}
        />
        <LayoutPanel.Actions>
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
        </LayoutPanel.Actions>
      </LayoutPanel.Header>
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
              extraHeaderContent={
                <>
                  {!choosePolicies && (
                    <Button
                      option="transparent"
                      glyph="customize"
                      className="fd-margin-begin--sm"
                      onClick={enablePolicyCustomization}
                    >
                      {t('settings.clusters.resourcesValidation.customize')}
                    </Button>
                  )}
                  {choosePolicies && (
                    <Button
                      option="transparent"
                      glyph="reset"
                      className="fd-margin-begin--sm"
                      onClick={disablePolicyCustomization}
                    >
                      {t('settings.clusters.resourcesValidation.reset')}
                    </Button>
                  )}
                  <Button
                    option="transparent"
                    glyph="download"
                    className="fd-margin-begin--sm"
                    onClick={download}
                  >
                    {t('common.buttons.download')}
                  </Button>
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
    </LayoutPanel>
  );
}
