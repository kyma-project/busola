import { useEffect, useState } from 'react';
import { Button } from '@ui5/webcomponents-react';
import copyToCliboard from 'copy-to-clipboard';
import { saveAs } from 'file-saver';
import { useTranslation } from 'react-i18next';

import 'shared/contexts/YamlEditorContext/EditorActions.scss';

const EDITOR_VISIBILITY = 'editor-visibility';
const READONLY_FIELDS = ['^ *managedFields:$', '^status:$'];

export function EditorActions({
  val,
  editor,
  title,
  onSave,
  saveDisabled,
  saveHidden,
  isProtected,
  searchDisabled = false,
  hideDisabled = false,
}) {
  const [visible, setVisible] = useState(
    localStorage.getItem(EDITOR_VISIBILITY) !== 'false',
  );

  const { readOnly } = editor?.getRawOptions() || {};

  useEffect(() => {
    localStorage.setItem(EDITOR_VISIBILITY, visible);
  }, [visible]);

  useEffect(() => {
    if (editor && !visible) {
      setTimeout(() => hideReadOnlyLines(), 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  const openSearch = () => {
    // focus is required for search control to appear
    editor.focus();
    editor.trigger('', 'actions.find');
  };

  const getReadOnlyFieldsPosition = () => {
    // definition of read only fields

    let arrayOfPositions = [];
    READONLY_FIELDS.forEach(fieldName => {
      if (!!editor.getModel()) {
        arrayOfPositions = arrayOfPositions.concat(
          editor
            .getModel()
            .findMatches(fieldName, true, true, true, null, true),
        );
      }
    });
    return arrayOfPositions.sort(
      (a, b) => b.range.startLineNumber - a.range.startLineNumber,
    );
  };

  const toggleReadOnlyLines = (fieldsPosition, hide) => {
    fieldsPosition.forEach(match => {
      setTimeout(() => {
        editor.setPosition({
          column: match.range.startColumn,
          lineNumber: match.range.startLineNumber,
        });

        hide
          ? editor.trigger('fold', 'editor.fold')
          : editor.trigger('unfold', 'editor.unfold');
      });
    });
    setVisible(!hide);
  };

  const hideReadOnlyLines = () => {
    const readOnlyFields = getReadOnlyFieldsPosition();
    toggleReadOnlyLines(readOnlyFields, true);
  };

  const showReadOnlyLines = () => {
    const readOnlyFields = getReadOnlyFieldsPosition();
    toggleReadOnlyLines(readOnlyFields, false);
  };

  const download = () => {
    const blob = new Blob([val], {
      type: 'application/yaml;charset=utf-8',
    });
    saveAs(blob, title || 'spec.yaml');
  };

  const { t } = useTranslation();

  return (
    <section>
      <Button
        design="Transparent"
        icon="download"
        onClick={download}
        className="circle-button"
        tooltip={t('common.tooltips.download')}
      />
      <Button
        design="Transparent"
        icon="copy"
        onClick={() => copyToCliboard(val)}
        className="circle-button"
        tooltip={t('common.tooltips.copy-to-clipboard')}
      />
      <Button
        design="Transparent"
        icon={visible ? 'hide' : 'show'}
        onClick={visible ? hideReadOnlyLines : showReadOnlyLines}
        className="circle-button"
        tooltip={
          visible ? t('common.tooltips.hide') : t('common.tooltips.show')
        }
        disabled={hideDisabled}
      />
      <Button
        design="Transparent"
        icon="search"
        onClick={openSearch}
        className="circle-button"
        tooltip={t('common.tooltips.search')}
        disabled={searchDisabled}
      />
      {!saveHidden && (
        <Button
          design="Transparent"
          icon="save"
          onClick={onSave}
          className="circle-button"
          tooltip={
            isProtected
              ? t('common.tooltips.protected-resources-info')
              : t('common.tooltips.save')
          }
          disabled={saveDisabled || !editor}
        />
      )}
      {readOnly && (
        <span style={{ color: 'var(--sapNeutralTextColor,#6a6d70)' }}>
          {t('common.labels.read-only')}
        </span>
      )}
    </section>
  );
}
