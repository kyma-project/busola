import React from 'react';
import { Tooltip } from '../../components/Tooltip/Tooltip';
import { Button } from 'fundamental-react';
import copyToCliboard from 'copy-to-clipboard';
import { saveAs } from 'file-saver';
import './EditorActions.scss';

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

export function EditorActions({ val, editor, title, onSave, saveDisabled }) {
  const openSearch = () => {
    // focus is required for search control to appear
    editor.focus();
    editor.trigger('', 'actions.find');
  };

  const download = () => {
    const blob = new Blob([val], {
      type: 'application/yaml;charset=utf-8',
    });
    saveAs(blob, title || 'spec.yaml');
  };

  return (
    <section className="editor-actions fd-margin-bottom--sm">
      <ButtonWithTooltip
        tooltipContent="Search"
        glyph="filter"
        onClick={openSearch}
        className="fd-margin-end--sm"
        disabled={!editor}
      />
      <ButtonWithTooltip
        tooltipContent="Save"
        glyph="save"
        onClick={onSave}
        disabled={saveDisabled || !editor}
      />
      <ButtonWithTooltip
        tooltipContent="Copy to clipboard"
        glyph="copy"
        onClick={() => copyToCliboard(val)}
        disabled={!editor}
      />
      <ButtonWithTooltip
        tooltipContent="Download"
        glyph="download"
        onClick={download}
        disabled={!editor}
      />
    </section>
  );
}
