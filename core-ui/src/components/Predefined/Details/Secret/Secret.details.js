import React from 'react';
import { ControlledBy, ModalWithForm } from 'react-shared';
import { Button } from 'fundamental-react';
import SecretData from 'shared/components/Secret/SecretData';
import { EditSecretForm } from './EditSecretForm';
import { useTranslation } from 'react-i18next';

export const SecretsDetails = ({ DefaultRenderer, ...otherParams }) => {
  const { t, i18n } = useTranslation();
  const Secret = resource => <SecretData key="secret-data" secret={resource} />;

  const headerActions = [
    secret => (
      <ModalWithForm
        key="edit-secret-modal"
        title={t('secrets.title-edit-secret')}
        modalOpeningComponent={
          <Button className="fd-margin-end--tiny" option="transparent">
            {t('common.buttons.edit')}
          </Button>
        }
        confirmText={t('common.buttons.update')}
        className="modal-size--l"
        renderForm={props => (
          <EditSecretForm
            secret={secret}
            resourceUrl={otherParams.resourceUrl}
            readonlyName={true}
            {...props}
          />
        )}
        i18n={i18n}
      />
    ),
  ];

  const customColumns = [
    {
      header: t('common.headers.owner'),
      value: secret => (
        <ControlledBy ownerReferences={secret.metadata.ownerReferences} />
      ),
    },
  ];

  return (
    <DefaultRenderer
      customComponents={[Secret]}
      customColumns={customColumns}
      resourceHeaderActions={headerActions}
      {...otherParams}
    />
  );
};
