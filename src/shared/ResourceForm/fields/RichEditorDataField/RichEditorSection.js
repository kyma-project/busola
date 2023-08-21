import React, { useCallback } from 'react';
import { Button } from '@ui5/webcomponents-react';
import { ComboboxInput } from 'fundamental-react';
import { isNil } from 'lodash';
import { languages } from 'monaco-editor';
import { useTranslation } from 'react-i18next';
import * as Inputs from 'shared/ResourceForm/inputs';
import { FormField } from '../../components/FormField';
import { Editor } from 'shared/components/MonacoEditorESM/Editor';
import { ResourceForm } from 'shared/ResourceForm/components/ResourceForm';
import './RichEditorSection.scss';

function getAvailableLanguages() {
  return (
    languages
      .getLanguages()
      .sort((a, b) => a.id.localeCompare(b.id))
      // move yaml and json to the top
      .sort((a, _) => (a.id === 'json' || a.id === 'yaml' ? -1 : 1))
      .map(l => ({
        key: l.id,
        text: l.aliases?.[0] || l.id,
      }))
      // remove duplicates
      .filter((l, index, arr) => arr.findIndex(e => e.key === l.key) === index)
  );
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
      options={getAvailableLanguages()}
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
      icon="delete"
      disabled={!item}
      design="Negative"
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
      height="240px"
      autocompletionDisabled
      value={isNil(value) ? '' : value.toString()}
      onChange={handleChange}
      onBlur={pushValue}
      updateValueOnParentChange
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
      nestingLevel={1}
    >
      {keyInput}
      <div className="rich-editor__dropdown-wrapper">
        <div className={'fd-margin--tiny'}>{languageDropdown}</div>
      </div>
      {valueInput}
    </ResourceForm.CollapsibleSection>
  );
}
