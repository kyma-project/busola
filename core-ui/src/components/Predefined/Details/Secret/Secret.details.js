import React from 'react';
import { ModalWithForm } from 'react-shared';
import { Button } from 'fundamental-react';
import SecretData from 'shared/components/Secret/SecretData';
import { EditSecretForm } from './EditSecretForm';

export const SecretsDetails = ({ DefaultRenderer, ...otherParams }) => {
  const Secret = resource => <SecretData key="secret-data" secret={resource} />;

  const headerActions = [
    secret => (
      <ModalWithForm
        key="edit-secret-modal"
        title="Update secret"
        modalOpeningComponent={
          <Button className="fd-margin-end--tiny" option="transparent">
            Edit
          </Button>
        }
        confirmText="Update"
        className="fd-dialog--xl-size modal-width--m"
        renderForm={props => (
          <EditSecretForm
            secret={secret}
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
      customComponents={[Secret]}
      resourceHeaderActions={headerActions}
      {...otherParams}
    />
  );
};
