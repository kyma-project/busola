import React from 'react';
import { ModalWithForm } from 'react-shared';
import { Button } from 'fundamental-react';
import { EditConfigMapForm } from './EditConfigMapForm';
import { ReadonlyEditorPanel } from '../../../../shared/components/ReadonlyEditorPanel';

export const ConfigMapsDetails = ({ DefaultRenderer, ...otherParams }) => {
  const ConfigMapEditor = resource => {
    const { data } = resource;
    return Object.keys(data || {}).map(key => (
      <ReadonlyEditorPanel title={key} value={data[key]} key={key} />
    ));
  };

  const headerActions = [
    configMap => (
      <ModalWithForm
        key="edit-config-map-modal"
        title="Edit Config Map"
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
