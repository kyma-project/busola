import React from 'react';
import { ModalWithForm, MonacoEditor } from 'react-shared';
import { Button, LayoutPanel } from 'fundamental-react';
import { EditConfigMapForm } from './EditConfigMapForm';

export const ConfigMapsDetails = ({ DefaultRenderer, ...otherParams }) => {
  const options = {
    readOnly: true,
    minimap: {
      enabled: false,
    },
  };

  const ConfigMapEditor = resource => {
    const { data } = resource;
    return Object.keys(data || {}).map(key => (
      <LayoutPanel key={key} className="fd-margin--md">
        <LayoutPanel.Header>
          <LayoutPanel.Head title={key} />
        </LayoutPanel.Header>
        <LayoutPanel.Body>
          <MonacoEditor
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

  const headerActions = [
    configMap => (
      <ModalWithForm
        key="edit-config-map-modal"
        title="Update Config Map"
        modalOpeningComponent={
          <Button className="fd-margin-end--tiny" option="transparent">
            Edit
          </Button>
        }
        confirmText="Update"
        className="fd-dialog--xl-size modal-width--m"
        renderForm={props => (
          <EditConfigMapForm
            configMap={configMap}
            resourceUrl={otherParams.resourceUrl}
            readonlyName={true}
            {...props}
          />
        )}
      />
    ),
  ];

  return (
    <DefaultRenderer
      customComponents={[ConfigMapEditor]}
      resourceHeaderActions={headerActions}
      {...otherParams}
    />
  );
};
