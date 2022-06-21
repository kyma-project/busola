import React from 'react';
import { Button } from 'fundamental-react';
import { isNil } from 'lodash';
import { useTranslation } from 'react-i18next';
import * as Inputs from 'shared/ResourceForm/inputs';
import { FormField } from '../../components/FormField';
import { Editor } from 'shared/components/MonacoEditorESM/Editor';
import { ResourceForm } from 'shared/ResourceForm/components/ResourceForm';
import { Dropdown } from 'shared/components/Dropdown/Dropdown';
import { getAvailableLanguages } from './languages';

export function RichEditorSection({ item, onChange, onDelete, pushValue }) {
  const { t } = useTranslation();
  const { key, value, language } = item || {};

  const languageDropdown = (
    <Dropdown
      disabled={!item}
      compact
      options={getAvailableLanguages().map(l => ({
        key: l.id,
        text: l.aliases?.[0] || l.id,
      }))}
      selectedKey={language || ''}
      onSelect={(e, { key: language }) => {
        e.stopPropagation(); // don't collapse the section
        onChange({ language });
      }}
      placeholder={t('common.statuses.unknown')}
    />
  );

  const deleteButton = (
    <Button
      glyph="delete"
      disabled={!item}
      compact
      type="negative"
      onClick={onDelete}
    />
  );

  const keyInput = (
    <FormField
      value={key || ''}
      setValue={key => onChange({ key })}
      input={Inputs.Text}
      label={t('components.key-value-form.key')}
      className="fd-margin-bottom--sm"
      placeholder={t('components.key-value-field.enter-key')}
      onBlur={pushValue}
      pattern={'[-._a-zA-Z0-9]+'}
    />
  );

  const valueInput = (
    <Editor
      language={language || ''}
      height="120px"
      autocompletionDisabled
      value={isNil(value) ? '' : value.toString()}
      onChange={value => onChange({ key: key || '', value })}
      onBlur={pushValue}
    />
  );

  const title = isNil(key) ? (
    <em className="is-emphasized">{t('common.labels.new-entry')}</em>
  ) : (
    key
  );

  return (
    <ResourceForm.CollapsibleSection
      title={title}
      language={language || ''}
      actions={
        <>
          {languageDropdown} {deleteButton}
        </>
      }
      defaultOpen
    >
      {keyInput}
      {valueInput}
    </ResourceForm.CollapsibleSection>
  );
}
