import React from 'react';

import { FormLabel } from 'fundamental-react';
import { LabelSelectorInput } from 'shared/components/LabelSelectorInput/LabelSelectorInput';
import { useTranslation } from 'react-i18next';

import './LabelsInput.scss';

export function LabelsInput({ showFormLabel = true, ...otherProps }) {
  const { t, i18n } = useTranslation();
  return (
    <div className="resource-labels-input">
      {showFormLabel && (
        <FormLabel className="resource-labels-input__label">
          {t('common.headers.labels')}
        </FormLabel>
      )}
      <LabelSelectorInput i18n={i18n} {...otherProps} />
    </div>
  );
}
