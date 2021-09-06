import React from 'react';

import { FormLabel } from 'fundamental-react';
import { LabelSelectorInput } from 'react-shared';
import { useTranslation } from 'react-i18next';

import './GatewaySelectorInput.scss';

export function GatewaySelectorInput({ showFormLabel = true, ...otherProps }) {
  const { t } = useTranslation();
  return (
    <div className="resource-labels-input">
      {showFormLabel && (
        <FormLabel className="resource-labels-input__label">
          {t('common.headers.labels')}
        </FormLabel>
      )}
      <LabelSelectorInput {...otherProps} />
    </div>
  );
}
