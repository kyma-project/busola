import React from 'react';
import { Dropdown as BusolaDropown } from 'react-shared';
import { useTranslation } from 'react-i18next';

export function Dropdown({ value, setValue, error, loading, ...props }) {
  const { t, i18n } = useTranslation();

  const getValidationState = () => {
    if (error) {
      return {
        state: 'error',
        text: t('common.messages.error', { error: error.message }),
      };
    } else if (loading) {
      return {
        state: 'information',
        text: t('common.headers.loading'),
      };
    } else {
      return null;
    }
  };

  const {
    inputRef,
    validate,
    validationRef,
    setResource,
    ...dropdownProps
  } = props;
  return (
    <BusolaDropown
      compact
      fullWidth
      selectedKey={value}
      onSelect={(_, selected) => setValue(selected.key, selected)}
      i18n={i18n}
      validationState={getValidationState()}
      {...dropdownProps}
    />
  );
}
