import React from 'react';
import Editor from '@monaco-editor/react';
import { LayoutPanel } from 'fundamental-react';

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
      <LayoutPanel className="fd-margin--md">
        <LayoutPanel.Header>
          <LayoutPanel.Head title={key} />
        </LayoutPanel.Header>
        <LayoutPanel.Body>
          <Editor
            key={`editor-${key}`}
            theme="vs-light"
            height="20em"
            value={data[key]}
            options={options}
          />
        </LayoutPanel.Body>
      </LayoutPanel>
    ));
  };

  return (
    <DefaultRenderer customComponents={[ConfigMapEditor]} {...otherParams} />
  );
};
