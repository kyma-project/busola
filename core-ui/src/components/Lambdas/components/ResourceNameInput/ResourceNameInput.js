import React from 'react';

import { FormItem, FormLabel, MessageStrip } from 'fundamental-react';
import { K8sNameInput, Tooltip } from 'react-shared';

import { FORMS } from '../../constants';

import './ResourceNameInput.scss';

export function ResourceNameInput({ nameStatus, kind, ...otherProps }) {
  const validationMessage = nameStatus ? (
    <MessageStrip type="error">{nameStatus}</MessageStrip>
  ) : null;

  return (
    <div className="resource-name-input">
      <FormItem>
        <FormLabel className="resource-name-input__label" required={true}>
          {FORMS.RESOURCE_NAME.LABEL}
        </FormLabel>
        <K8sNameInput {...otherProps} kind={kind} />
        {validationMessage}
      </FormItem>
    </div>
  );
}
