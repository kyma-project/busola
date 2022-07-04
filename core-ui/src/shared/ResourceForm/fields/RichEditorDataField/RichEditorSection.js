import React, { useCallback } from 'react';
import { Button, ComboboxInput } from 'fundamental-react';
import { isNil } from 'lodash';
import { languages } from 'monaco-editor';
import { useTranslation } from 'react-i18next';
import * as Inputs from 'shared/ResourceForm/inputs';
import { FormField } from '../../components/FormField';
import { Editor } from 'shared/components/MonacoEditorESM/Editor';
import { ResourceForm } from 'shared/ResourceForm/components/ResourceForm';
import './RichEditorSection.scss';

function getAvailableLanguages() {
  return languages.getLanguages().sort((a, b) => a.id.localeCompare(b.id));
}

export function RichEditorSection({ item, onChange, onDelete, pushValue }) {
  const { t } = useTranslation();
  const { key, value, language } = item || {};

  const languageDropdown = (
    <ComboboxInput
      id="choose-language-input"
      ariaLabel="choose-language"
      disabled={!item}
      compact
      showAllEntries
      searchFullString
      selectionType="manual"
      options={getAvailableLanguages()
        .map(l => ({
          key: l.id,
          text: l.aliases?.[0] || l.id,
        }))
        // remove duplicates
        .filter(
          (l, index, arr) => arr.findIndex(e => e.key === l.key) === index,
        )}
      selectedKey={typeof language === 'string' ? language : undefined}
      onSelectionChange={(e, { key: language }) => {
        e?.stopPropagation(); // don't collapse the section
        onChange({ language });
      }}
      placeholder={t('components.rich-editor-data-field.language-placeholder')}
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
  const handleChange = useCallback(
    value => onChange({ key: key || '', value }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key, language],
  );

  const valueInput = (
    <Editor
      language={language || ''}
      height="120px"
      autocompletionDisabled
      value={isNil(value) ? '' : value.toString()}
      onChange={handleChange}
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
      actions={deleteButton}
      defaultOpen
    >
      {keyInput}
      <div className="rich-editor__dropdown-wrapper">{languageDropdown}</div>
      {valueInput}
    </ResourceForm.CollapsibleSection>
  );
}
