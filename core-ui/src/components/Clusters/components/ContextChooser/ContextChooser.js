import React from 'react';
import { FormLabel, Select } from 'fundamental-react';
import './ContextChooser.scss';

export function ContextChooser({ kubeconfig, setContextName }) {
  const contexts =
    kubeconfig.contexts?.map(({ name }) => ({
      key: name,
      text: name,
    })) || [];
  const selectedKey = kubeconfig['current-context'];

  return (
    <div className="context-chooser fd-margin-top--sm">
      <FormLabel htmlFor="context-chooser">Context:</FormLabel>
      <Select
        id="context-chooser"
        selectedKey={selectedKey}
        options={contexts}
        onSelect={(_, { text }) => setContextName(text)}
      />
    </div>
  );
}
