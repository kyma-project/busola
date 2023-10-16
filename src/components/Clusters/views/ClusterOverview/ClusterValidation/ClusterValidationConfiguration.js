import { Dialog, Button, Bar } from '@ui5/webcomponents-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';
import { ResourceForm } from 'shared/ResourceForm';
import { CollapsibleSection } from 'shared/ResourceForm/components/CollapsibleSection';
import { FormField } from 'shared/ResourceForm/components/FormField';
import * as Inputs from 'shared/ResourceForm/inputs';

const getNested = (obj, next, ...path) => {
  if (!next || !obj) return obj;
  return getNested(obj[next], ...path);
};

const setNested = (obj, newVal, next, ...path) => {
  if (!next) return newVal;
  return {
    ...obj,
    [next]: setNested(obj[next] ?? {}, newVal, ...path),
  };
};

const useNested = (obj, setObj, ...path) => {
  const val = useMemo(() => getNested(obj, ...path), [obj, path]);
  const setter = newVal => setObj(setNested(obj, newVal, ...path));
  return [val, setter];
};

const ListActions = ({ options, setSelected }) => {
  const { t } = useTranslation();
  return (
    <>
      <Button
        icon="add"
        onClick={() => setSelected(options.map(({ key }) => key))}
        design="Transparent"
      >
        {t('common.buttons.add-all')}
      </Button>
      <Button icon="less" onClick={() => setSelected([])} desgin="Transparent">
        {t('common.buttons.remove-all')}
      </Button>
    </>
  );
};

const ConfigurationForm = ({
  configuration,
  setConfiguration,
  namespaces,
  policies,
}) => {
  const { t } = useTranslation();
  const [description, setDescription] = useNested(
    configuration,
    setConfiguration,
    'description',
  );
  const [selectedNamespaces, setSelectedNamespaces] = useNested(
    configuration,
    setConfiguration,
    'namespaces',
  );
  const [selectedPolicies, setSelectedPolicies] = useNested(
    configuration,
    setConfiguration,
    'policies',
  );
  const [parallelRequests, setParallelRequests] = useNested(
    configuration,
    setConfiguration,
    'scanParameters',
    'parallelRequests',
  );

  const namespaceOptions = namespaces?.map(name => ({ key: name, text: name }));
  const policyOptions = policies?.map(name => ({ key: name, text: name }));

  return (
    <ResourceForm
      resource={configuration}
      setResource={val => {
        setConfiguration(val);
      }}
      initialResource={{}}
      disableDefaultFields
    >
      <div>
        <FormField
          simple
          advanced
          label={t('common.headers.description')}
          input={Inputs.Text}
          isAdvanced={true}
          value={description}
          defaultValue={description}
          setValue={val => setDescription(val)}
        ></FormField>
      </div>

      <CollapsibleSection
        title={t('cluster-validation.scan.configuration.namespaces')}
        defaultOpen={true}
        actions={
          <ListActions
            options={namespaceOptions}
            setSelected={setSelectedNamespaces}
          />
        }
      >
        <div>
          <FormField
            simple
            advanced
            label={t('common.headers.namespaces')}
            input={Inputs.Checkboxes}
            options={namespaceOptions ?? []}
            isAdvanced={true}
            setValue={val => setSelectedNamespaces(val)}
            value={selectedNamespaces}
          ></FormField>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title={t('common.headers.policies')}
        actions={
          <ListActions
            options={policyOptions}
            setSelected={setSelectedPolicies}
          />
        }
      >
        <div>
          <FormField
            simple
            advanced
            label={t('common.headers.policies')}
            input={Inputs.Checkboxes}
            options={policyOptions ?? []}
            isAdvanced={true}
            setValue={val => setSelectedPolicies(val)}
            value={selectedPolicies}
          ></FormField>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title={t('cluster-validation.scan.configuration.parameters')}
      >
        <div>
          <FormField
            simple
            advanced
            label={t('cluster-validation.scan.configuration.parallel-requests')}
            input={Inputs.Number}
            isAdvanced={true}
            setValue={val =>
              setParallelRequests(Number.isInteger(val) ? val : undefined)
            }
            value={parallelRequests ?? ''}
            validationState={
              parallelRequests < 1
                ? {
                    state: 'error',
                    text: t(
                      'cluster-validation.scan.configuration.invalid-parallel-requests',
                    ),
                  }
                : {}
            }
          />
        </div>
      </CollapsibleSection>
    </ResourceForm>
  );
};

export function ClusterValidationConfigurationDialog({
  show,
  onCancel,
  onSubmit,
  configuration,
  namespaces,
  policies,
}) {
  const { t } = useTranslation();

  const [tempConfiguration, setTempConfiguration] = useState(configuration);

  // Load configuration when the dialog is shown, but don't change it while open
  useEffect(() => {
    if (show) {
      setTempConfiguration(configuration);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  return (
    <Dialog
      onAfterClose={onCancel}
      open={show}
      headerText={t('cluster-validation.scan.configuration.title')}
      footer={
        <Bar
          design="Footer"
          endContent={
            <>
              <Button
                desgin="Emphasized"
                onClick={() => {
                  onSubmit(tempConfiguration);
                }}
                aria-label="cluster-validation-submit"
              >
                {t('common.buttons.submit')}
              </Button>
              <Button
                design="Transparent"
                onClick={() => {
                  onCancel();
                }}
              >
                {t('common.buttons.cancel')}
              </Button>
            </>
          }
        />
      }
      style={{ height: '90vh', width: '125vh' }}
    >
      <ErrorBoundary>
        <ConfigurationForm
          {...{
            configuration: tempConfiguration,
            setConfiguration: setTempConfiguration,
            namespaces,
            policies,
          }}
        />
      </ErrorBoundary>
    </Dialog>
  );
}
