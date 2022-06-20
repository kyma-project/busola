import React from 'react';
import { FormTextarea } from 'fundamental-react';
import { useTranslation } from 'react-i18next';

import { KeyValueField } from './KeyValueField';

import './DataField.scss';

import Editor from './Editor';

export function DataField({ title, ...props }) {
  const { t } = useTranslation();

  return (
    <KeyValueField
      fullWidth
      readableFromFile
      className="resource-form__data-field"
      title={title || t('common.labels.data')}
      input={({ setValue, ...props }) => {
        return (
          <Editor
            language=""
            onChange={e => setValue(e)}
            height="200px"
            {...props}
          />
        );
      }}
      {...props}
    />
  );
}
