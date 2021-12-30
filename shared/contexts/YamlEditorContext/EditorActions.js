import React from 'react';
import { Tooltip } from '../../components/Tooltip/Tooltip';
import { Button } from 'fundamental-react';
import copyToCliboard from 'copy-to-clipboard';
import { saveAs } from 'file-saver';
import './EditorActions.scss';
import { useTranslation } from 'react-i18next';

const ButtonWithTooltip = ({
  tooltipContent,
  glyph,
  onClick,
  className,
  disabled = false,
}) => {
  return (
    <Tooltip className={className} content={tooltipContent} position="top">
      <Button
        option="transparent"
        glyph={glyph}
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
  i18n,
  readOnly,
}) {
  const openSearch = () => {
    // focus is required for search control to appear
    editor.focus();
    editor.trigger('', 'actions.find');
  };

  const getReadOnlyFieldsPosition = () => {
    const READONLY_FIELDS = ['managedFields:', 'status:'];
    let arrayOfPositions = [];
    READONLY_FIELDS.forEach(fieldName => {
      arrayOfPositions = arrayOfPositions.contains(
        editor.getModel().findMatches(fieldName, true, false, true, null, true),
      );
    });
    return arrayOfPositions;
  };
  const hideNonEditable = () => {
    console.log(editor.getSupportedActions());
    const matches = editor
      .getModel()
      .findMatches('managedFields:', true, false, true, null, true)
      .concat(
        ...editor
          .getModel()
          .findMatches('status:', true, false, true, null, true),
      );
    constreadOnlyFields = getReadOnlyFieldsPosition();
    matches.forEach(match => {
      setTimeout(() => {
        console.log(
          'startColumn',
          match.range.startColumn,
          'startLineNumber',
          match.range.startLineNumber,
          matches,
        );
        editor.setPosition({
          column: match.range.startColumn,
          lineNumber: match.range.startLineNumber,
        });
        editor.trigger('fold', 'editor.fold');
      });
    });
    const matches2 = editor
      .getModel()
      .findMatches('status:', true, false, true, null, true);
    matches2.forEach(match => {
      setTimeout(() => {
        console.log(
          'startColumn',
          match.range.startColumn,
          'startLineNumber',
          match.range.startLineNumber,
          matches,
        );
        editor.setPosition({
          column: match.range.startColumn,
          lineNumber: match.range.startLineNumber,
        });
        editor.trigger('fold', 'editor.fold');
      });
    });
  };

  const download = () => {
    const blob = new Blob([val], {
      type: 'application/yaml;charset=utf-8',
    });
    saveAs(blob, title || 'spec.yaml');
  };

  const { t } = useTranslation(null, { i18n });

  return (
    <section className="editor-actions fd-margin-bottom--sm">
      <ButtonWithTooltip
        tooltipContent={'Show managed fields'}
        glyph="hide"
        onClick={hideNonEditable}
        disabled={!editor}
      />
      <ButtonWithTooltip
        tooltipContent={t('common.tooltips.search')}
        glyph="filter"
        onClick={openSearch}
        disabled={!editor}
      />
      {!saveHidden && (
        <ButtonWithTooltip
          tooltipContent={t('common.tooltips.save')}
          glyph="save"
          onClick={onSave}
          disabled={saveDisabled || !editor}
        />
      )}
      <ButtonWithTooltip
        tooltipContent={t('common.tooltips.copy-to-clipboard')}
        glyph="copy"
        onClick={() => copyToCliboard(val)}
        disabled={!editor}
      />
      <ButtonWithTooltip
        tooltipContent={t('common.tooltips.download')}
        glyph="download"
        onClick={download}
        disabled={!editor}
      />
      {readOnly && (
        <span className={t('fd-object-status--critical')}>
          {t('common.labels.read-only')}
        </span>
      )}
    </section>
  );
}
