import React from 'react';
import Editor, { monaco } from '@monaco-editor/react';
import { Panel } from 'fundamental-react';

monaco.config({
  paths: { vs: '/vs' },
});

export const ConfigMapsDetails = DefaultRenderer => ({ ...otherParams }) => {
  const options = {
    readOnly: true,
    minimap: {
      enabled: false,
    },
  };

  const ConfigMapEditor = resource => {
    const { data } = resource;
    return Object.keys(data).map(key => (
      <Panel className="fd-has-margin-m">
        <Panel.Header>
          <Panel.Head title={key} />
        </Panel.Header>
        <Panel.Body>
          <Editor
            key={`editor-${key}`}
            theme="vs-light"
            height="20em"
            value={data[key]}
            options={options}
          />
        </Panel.Body>
      </Panel>
    ));
  };

  return (
    <DefaultRenderer customComponents={[ConfigMapEditor]} {...otherParams} />
  );
};
