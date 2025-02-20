import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import { Icon, Input, InputDomRef } from '@ui5/webcomponents-react';
import { K8sResource } from 'types';
import { useObjectState } from 'shared/useObjectState';
import { CommandPaletteUI } from './CommandPaletteUI';
import './CommandPaletteSearchBar.scss';

export function CommandPaletteSearchBar({ slot }: { slot?: string }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const inputRef = useRef<InputDomRef | null>(null);
  const commandPaletteRef = useRef<HTMLDivElement | null>(null);
  const [resourceCache, updateResourceCache] = useObjectState<
    Record<string, K8sResource[]>
  >();

  useEffect(() => {
    if (!open || !inputRef.current || !commandPaletteRef.current) return;

    const shellbarRect = inputRef.current.getBoundingClientRect();
    const paletteContent = commandPaletteRef.current.querySelector(
      '.command-palette-ui__content',
    ) as HTMLElement;

    if (!paletteContent) return;

    const paletteWrapper = commandPaletteRef.current.querySelector(
      '.command-palette-ui__wrapper',
    ) as HTMLElement;

    if (paletteWrapper) {
      paletteWrapper.style.left = `${shellbarRect.left +
        shellbarRect.width / 2 -
        paletteContent.offsetWidth / 2}px`;
    }
  }, [open]);

  const setShowDialog = (value: boolean) => {
    const modalPresent = document.querySelector('ui5-dialog[open]');
    // disable opening palette if other modal is present
    if (!modalPresent || !value) {
      setOpen(value);
    }
  };

  return (
    <>
      <Input
        accessibleName="command-palette-search-bar"
        onClick={() => setOpen(true)}
        showClearIcon
        className="search-with-display-more command-palette-search-bar"
        icon={<Icon name="slim-arrow-right" />}
        slot={slot}
        placeholder={t('command-palette.search.quick-navigation')}
        ref={inputRef}
      />
      {open &&
        createPortal(
          <div ref={commandPaletteRef}>
            <CommandPaletteUI
              showCommandPalette={open}
              hide={() => setShowDialog(false)}
              resourceCache={resourceCache}
              updateResourceCache={updateResourceCache}
            />
          </div>,
          document.body,
        )}
    </>
  );
}
