import React from 'react';
import { FormLabel, Select } from 'fundamental-react';
import './ContextChooser.scss';

export function ContextChooser({ kubeconfig, setContextName }) {
  const contexts = Array.isArray(kubeconfig.contexts)
    ? kubeconfig.contexts.map(({ name }) => ({
        key: name,
        text: name,
      }))
    : [];
  const selectedKey = kubeconfig['current-context'];

  return (
    <div className="context-chooser">
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
