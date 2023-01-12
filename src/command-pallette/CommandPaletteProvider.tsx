import { ReactNode, useState } from 'react';
import { CommandPaletteUI } from './CommandPalletteUI/CommandPaletteUI';
import { useEventListener } from 'hooks/useEventListener';
import { K8sResource } from 'types';
import { useObjectState } from 'shared/useObjectState';

export const CommandPaletteProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [showDialog, _setShowDialog] = useState(false);
  const hide = () => setShowDialog(false);
  const [resourceCache, updateResourceCache] = useObjectState<
    Record<string, K8sResource[]>
  >();

  const setShowDialog = (value: boolean) => {
    const modalPresent = document.querySelector(
      '[data-focus-lock-disabled=false]',
    );
    // disable opening palette if other modal is present
    if (!modalPresent || !value) {
      _setShowDialog(value);
    }
  };

  const onKeyPress = (e: Event) => {
    const { key, metaKey, ctrlKey } = e as KeyboardEvent;
    // for (Edge, Chrome) || (Firefox, Safari)
    const isMac = (
      (navigator as any).userAgentData?.platform || navigator.platform
    )
      ?.toLowerCase()
      ?.startsWith('mac');
    const modifierKeyPressed = (isMac && metaKey) || (!isMac && ctrlKey);

    if ((key === 'k' || key === 'K') && modifierKeyPressed) {
      setShowDialog(!showDialog);
      // [on Firefox] prevent opening the browser search bar via CMD/CTRL+K
      e.preventDefault();
    } else if (key === 'Escape') {
      hide();
    }
  };

  useEventListener('keydown', onKeyPress, [showDialog]);

  return (
    <>
      {showDialog && (
        <CommandPaletteUI
          hide={hide}
          resourceCache={resourceCache}
          updateResourceCache={updateResourceCache}
        />
      )}
      {children}
    </>
  );
};
