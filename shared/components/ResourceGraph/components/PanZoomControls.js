import React from 'react';
import { Button, ButtonSegmented } from 'fundamental-react';
import { useTranslation } from 'react-i18next';

export function PanZoomControls({ panZoomRef, i18n }) {
  const { t } = useTranslation(['translation'], { i18n });
  return (
    <div className="controls controls__left">
      <ButtonSegmented>
        <Button
          aria-label="zoom out"
          glyph="zoom-out"
          onClick={() => panZoomRef.current?.zoomOut()}
        />
        <Button onClick={() => panZoomRef.current?.center()}>
          {t('resource-graph.controls.center')}
        </Button>
        <Button
          aria-label="zoom in"
          glyph="zoom-in"
          onClick={() => panZoomRef.current?.zoomIn()}
        />
      </ButtonSegmented>
    </div>
  );
}
