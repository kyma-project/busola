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

  namespaces = namespaces?.map(name => ({ key: name, text: name }));
  resources = resources?.map(({ kind }) => ({ key: kind, text: kind }));

  return (
    <ResourceForm
      pluralKind="tests"
      singularName="test"
      resource={configuration}
      setResource={val => {
        setConfiguration(val);
      }}
      onPresetSelected={presetValue => {}}
      onReset={() => {}}
      formElementRef={null}
      createUrl={() => {}}
      setCustomValid={() => {}}
      onlyYaml={false}
      presets={false}
      initialResource={{}}
      afterCreatedFn={() => {}}
      handleNameChange={() => {}}
      urlPath=""
      disableDefaultFields
    >
      <FormFieldset>
        <FormField
          simple
          advanced
          propertyPath={undefined}
          label={'Description'}
          input={Inputs.Text}
          className={undefined}
          required={false}
          disabled={false}
          tooltipContent={undefined}
          isAdvanced={true}
          value={description}
          defaultValue={description}
          setValue={val => setDescription(val)}
          messageStrip={undefined}
          inputInfo={undefined}
        ></FormField>
      </FormFieldset>

      <CollapsibleSection title="Namespaces To Scan">
        <FormFieldset>
          <FormField
            simple
            advanced
            label={'Namespaces'}
            input={Inputs.Checkboxes}
            options={namespaces ?? []}
            isAdvanced={true}
            setValue={val => setSelectedNamespaces(val)}
            value={selectedNamespaces}
          ></FormField>
        </FormFieldset>
      </CollapsibleSection>

      <CollapsibleSection title="Resources To Scan">
        <FormFieldset>
          <FormField
            simple
            advanced
            label={'Resources'}
            input={Inputs.Checkboxes}
            options={resources ?? []}
            isAdvanced={true}
            setValue={val => setSelectedResources(val)}
            value={selectedResources}
          ></FormField>
        </FormFieldset>
      </CollapsibleSection>

      <CollapsibleSection title="Policies">
        <FormFieldset>
          <FormField
            simple
            advanced
            label={'Policies'}
            input={Inputs.Checkboxes}
            options={policies ?? []}
            isAdvanced={true}
            setValue={val => setSelectedPolicies(val)}
            value={selectedPolicies}
          ></FormField>
        </FormFieldset>
      </CollapsibleSection>

      <CollapsibleSection title="Scan Parameters">
        <FormFieldset>
          <FormField
            simple
            advanced
            label={'Parallel Requests'}
            input={Inputs.Number}
            isAdvanced={true}
            setValue={val => setParallelRequests(val)}
            value={parallelRequests}
          />
          <FormField
            simple
            advanced
            label={'Parallel Worker Threads'}
            input={Inputs.Number}
            isAdvanced={true}
            setValue={val => setParallelWorkerThreads(val)}
            value={parallelWorkerThreads}
          />
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
      title={'Scan Configuration for Cluster Validation'}
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
