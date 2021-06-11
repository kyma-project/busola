import React from 'react';
import {
  K8sNameInput,
  useMicrofrontendContext,
  LabelSelectorInput,
  KeyValueForm,
} from 'react-shared';
import { Tab, TabGroup } from 'fundamental-react';
import { createConfigMapInput } from './createConfigMapInput';

export function ConfigMapForm({
  formElementRef,
  onChange,
  setCustomValid,
  configMap,
  onSubmit,
  readonlyName,
}) {
  const { namespaceId } = useMicrofrontendContext();

  const [name, setName] = React.useState(configMap.metadata.name);
  const [labels, setLabels] = React.useState(configMap.metadata.labels);
  const [data, setData] = React.useState(configMap.data || {});

  const handleFormSubmit = e => {
    e.preventDefault();
    const configMapInput = createConfigMapInput(
      name,
      namespaceId,
      labels,
      data,
    );
    onSubmit(configMapInput);
  };

  return (
    <form onSubmit={handleFormSubmit} onChange={onChange} ref={formElementRef}>
      <TabGroup style={{ padding: 0 }}>
        <Tab title="Metadata">
          <K8sNameInput
            onChange={e => setName(e.target.value)}
            kind="Config Map"
            className="fd-margin-bottom--sm"
            defaultValue={name}
            readOnly={readonlyName}
          />
          <LabelSelectorInput labels={labels} onChange={setLabels} />
        </Tab>
        <Tab title="Data">
          <KeyValueForm
            data={data}
            setData={setData}
            setValid={setCustomValid}
          />
        </Tab>
      </TabGroup>
    </form>
  );
}
