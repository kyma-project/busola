import React, { useEffect, useState } from 'react';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import { Button } from '@ui5/webcomponents-react';
import copyToCliboard from 'copy-to-clipboard';
import { saveAs } from 'file-saver';
import 'shared/contexts/YamlEditorContext/EditorActions.scss';
import { useTranslation } from 'react-i18next';

const EDITOR_VISIBILITY = 'editor-visibility';
const READONLY_FIELDS = ['^ *managedFields:$', '^status:$'];

const ButtonWithTooltip = ({
  tooltipContent,
  icon,
  onClick,
  className,
  disabled = false,
}) => {
  return (
    <Tooltip className={className} content={tooltipContent} position="top">
      <Button
        design="Transparent"
        icon={icon}
        onClick={onClick}
        disabled={disabled}
        className="circle-button"
      />
    </Tooltip>
  );
};

export function EditorActions({
  val,
  editor,
  title,
  onSave,
  saveDisabled,
  saveHidden,
  isProtected,
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
    <section className="editor-actions bsl-margin-bottom--sm">
      <ButtonWithTooltip
        tooltipContent={
          visible ? t('common.tooltips.hide') : t('common.tooltips.show')
        }
        icon={visible ? 'hide' : 'show'}
        onClick={visible ? hideReadOnlyLines : showReadOnlyLines}
        disabled={!editor}
      />
      <ButtonWithTooltip
        tooltipContent={t('common.tooltips.search')}
        icon="search"
        onClick={openSearch}
        disabled={!editor}
      />
      {!saveHidden && (
        <ButtonWithTooltip
          tooltipContent={
            isProtected
              ? t('common.tooltips.protected-resources-info')
              : t('common.tooltips.save')
          }
          icon="save"
          onClick={onSave}
          disabled={saveDisabled || !editor}
        />
      )}
      <ButtonWithTooltip
        tooltipContent={t('common.tooltips.copy-to-clipboard')}
        icon="copy"
        onClick={() => copyToCliboard(val)}
        disabled={!editor}
      />
      <ButtonWithTooltip
        tooltipContent={t('common.tooltips.download')}
        icon="download"
        onClick={download}
        disabled={!editor}
      />
      {readOnly && (
        <span
          style={{ color: 'var(--sapNeutralTextColor,#6a6d70)' }}
          className={'fd-object-status--critical'}
        >
          {t('common.labels.read-only')}
        </span>
      )}
    </section>
  );
}
