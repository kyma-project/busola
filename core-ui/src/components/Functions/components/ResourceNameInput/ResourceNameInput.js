import React from 'react';

import { FormItem, FormLabel, MessageStrip } from 'fundamental-react';
import { K8sNameInput } from 'shared/components/K8sNameInput/K8sNameInput';
import { useTranslation } from 'react-i18next';

import './ResourceNameInput.scss';

export function ResourceNameInput({ nameStatus, kind, ...otherProps }) {
  const validationMessage = nameStatus ? (
    <MessageStrip type="error">{nameStatus}</MessageStrip>
  ) : null;

  const { t, i18n } = useTranslation();

  return (
    <div className="resource-name-input">
      <FormItem>
        <FormLabel className="resource-name-input__label" required={true}>
          {t('common.headers.name')}
        </FormLabel>
        <K8sNameInput {...otherProps} kind={kind} i18n={i18n} />
        {validationMessage}
      </FormItem>
    </div>
  );
}
