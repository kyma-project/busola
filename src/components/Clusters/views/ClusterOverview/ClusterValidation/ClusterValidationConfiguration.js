import { Button, Dialog, FormFieldset } from 'fundamental-react';
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
    [next]: setNested(obj[next], newVal, ...path),
  };
};

const useNested = (obj, setObj, ...path) => {
  const val = useMemo(() => getNested(obj, ...path), [obj, path]);
  const setter = newVal => setObj(setNested(obj, newVal, ...path));
  return [val, setter];
};

const ConfigurationForm = ({
  configuration,
  setConfiguration,
  namespaces,
  resources,
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
  const [selectedResources, setSelectedResources] = useNested(
    configuration,
    setConfiguration,
    'resources',
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
  const [parallelWorkerThreads, setParallelWorkerThreads] = useNested(
    configuration,
    setConfiguration,
    'scanParameters',
    'parallelWorkerThreads',
  );

  const namespaceOptions = namespaces?.map(name => ({ key: name, text: name }));
  const resourceOptions = resources?.map(({ kind }) => ({
    key: kind,
    text: kind,
  }));
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
      <FormFieldset>
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
      </FormFieldset>

      <CollapsibleSection
        title={t('cluster-validation.scan.configuration.namespaces')}
        defaultOpen={true}
      >
        <FormFieldset>
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
        </FormFieldset>
      </CollapsibleSection>

      {/* <CollapsibleSection title="Resources To Scan">
        <FormFieldset>
          <FormField
            simple
            advanced
            label={'Resources'}
            input={Inputs.Checkboxes}
            options={resourceOptions ?? []}
            isAdvanced={true}
            setValue={val => setSelectedResources(val)}
            value={selectedResources}
          ></FormField>
        </FormFieldset>
      </CollapsibleSection> */}

      <CollapsibleSection title={t('common.headers.policies')}>
        <FormFieldset>
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
        </FormFieldset>
      </CollapsibleSection>

      <CollapsibleSection
        title={t('cluster-validation.scan.configuration.parameters')}
      >
        <FormFieldset>
          <FormField
            simple
            advanced
            label={t('cluster-validation.scan.configuration.parallel-requests')}
            input={Inputs.Number}
            isAdvanced={true}
            setValue={val => setParallelRequests(val)}
            value={parallelRequests}
          />
          {/* <FormField
            simple
            advanced
            label={'Parallel Worker Threads'}
            input={Inputs.Number}
            isAdvanced={true}
            setValue={val => setParallelWorkerThreads(val)}
            value={parallelWorkerThreads}
          /> */}
        </FormFieldset>
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
  resources,
  policies,
}) {
  const { t } = useTranslation();

  const [tempConfiguration, setTempConfiguration] = useState(configuration);

  useEffect(() => {
    if (show) {
      setTempConfiguration(configuration);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, configuration]);

  return (
    <Dialog
      show={show}
      className="yaml-upload-modal"
      title={t('cluster-validation.scan.configuration.title')}
      actions={[
        <Button
          onClick={() => {
            onCancel();
          }}
          option="transparent"
        >
          {t('common.buttons.cancel')}
        </Button>,
        <Button
          onClick={() => {
            onSubmit(tempConfiguration);
          }}
          option="emphasized"
        >
          {t('common.buttons.submit')}
        </Button>,
      ]}
    >
      <ErrorBoundary>
        <ConfigurationForm
          {...{
            configuration: tempConfiguration,
            setConfiguration: setTempConfiguration,
            namespaces,
            resources,
            policies,
          }}
        />
      </ErrorBoundary>
    </Dialog>
  );
}
