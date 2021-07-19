import React from 'react';

import { FormLabel } from 'fundamental-react';
import { LabelSelectorInput, Tooltip } from 'react-shared';

import { FORMS } from 'components/Lambdas/constants';

import './LabelsInput.scss';

export function LabelsInput({ ...otherProps }) {
  return (
    <div className="resource-labels-input">
      <FormLabel className="resource-labels-input__label">
        {FORMS.LABELS.LABEL}
      </FormLabel>
      <Tooltip content={FORMS.LABELS.INLINE_HELP}>
        <LabelSelectorInput {...otherProps} />
      </Tooltip>
    </div>
  );
}
