import React from 'react';
import { SimpleForm } from './SimpleForm';
import './AdvancedForm.scss';
import { useTranslation } from 'react-i18next';

export function AdvancedForm({ secret, setSecret }) {
  const { t } = useTranslation();

  return (
    <>
      <SimpleForm secret={secret} setSecret={setSecret} />
    </>
  );
}
