import { RefObject } from 'react';
import type { ShellBarDomRef } from '@ui5/webcomponents-react';

/**
 * We need to discover if feedback feedbackOpener is in three dot menu or not.
 * If the feedbackOpener is in three dot menu, the Shellbar will hide it after clicking on the feedbackOpener and will clean elements below the feedbackOpener
 * If the feedbackOpener is in three dot menu we need to pin Popover to something visible after collapse of three dot menu.
 * If it is in three dot menu, we need to pin the Popover to something which won't close after opening, for example three dot menu button.   */
export const resolveOpener = (
  defaultOpenerID: string,
  shellbarRef: RefObject<ShellBarDomRef | null>,
): HTMLElement | undefined => {
  const feedbackAction = document.getElementById(defaultOpenerID);
  if (feedbackAction && !feedbackAction.hasAttribute('in-overflow')) {
    return feedbackAction;
  }
  const overflowButton = shellbarRef?.current?.shadowRoot?.getElementById(
    'ui5-shellbar-overflow-button',
  );
  return overflowButton ?? feedbackAction ?? undefined;
};
