import React, { useState } from 'react';
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
  const [visible, setVisible] = useState(true);
  const openSearch = () => {
    // focus is required for search control to appear
    editor.focus();
    editor.trigger('', 'actions.find');
  };

  const getReadOnlyFieldsPosition = () => {
    // definition of read only fields
    const READONLY_FIELDS = ['managedFields:', 'status:'];
    let arrayOfPositions = [];
    READONLY_FIELDS.forEach(fieldName => {
      arrayOfPositions = arrayOfPositions.concat(
        editor.getModel().findMatches(fieldName, true, false, true, null, true),
      );
    });
    return arrayOfPositions.sort(
      (a, b) => b.range.startLineNumber - a.range.startLineNumber,
    );
  };

  const toggleReadOnlyLines = () => {
    getReadOnlyFieldsPosition().forEach(match => {
      setTimeout(() => {
        editor.setPosition({
          column: match.range.startColumn,
          lineNumber: match.range.startLineNumber,
        });
        visible
          ? editor.trigger('fold', 'editor.fold')
          : editor.trigger('unfold', 'editor.unfold');
      });
    });
  };

  const hideReadOnlyLines = () => {
    toggleReadOnlyLines();
    setVisible(false);
  };

  const showReadOnlyLines = () => {
    toggleReadOnlyLines();
    setVisible(true);
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
        tooltipContent={
          visible ? t('common.tooltips.hide') : t('common.tooltips.show')
        }
        glyph={visible ? 'hide' : 'show'}
        onClick={visible ? hideReadOnlyLines : showReadOnlyLines}
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
