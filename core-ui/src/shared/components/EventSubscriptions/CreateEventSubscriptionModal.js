import React from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from 'fundamental-react';
import { ModalWithForm } from 'react-shared';

import CreateEventSubscriptionForm from './CreateEventSubscriptionForm';

export default function CreateEventSubscriptionModal({
  isLambda = false,
  onSubmit,
  i18n,
}) {
  const { t } = useTranslation();
  const button = (
    <Button glyph="add" option="transparent">
      {t('event-subscription.create.title')}
    </Button>
  );

  return (
    <ModalWithForm
      title={t('event-subscription.create.title')}
      modalOpeningComponent={button}
      confirmText={t('common.buttons.add')}
      invalidPopupMessage={t('event-subscription.errors.invalid')}
      id="add-event-trigger-modal"
      renderForm={props => (
        <CreateEventSubscriptionForm
          {...props}
          isLambda={isLambda}
          onSubmit={onSubmit}
        />
      )}
      i18n={i18n}
    />
  );
}
