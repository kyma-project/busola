import {
  ShellBarItem,
  type ShellBarItemPropTypes,
} from '@ui5/webcomponents-react';

export function ShellBarAction({ onClick, ...props }: ShellBarItemPropTypes) {
  const handleClick: ShellBarItemPropTypes['onClick'] = (event) => {
    // Overflow items also bubble their underlying MouseEvent in UI5 2.24.
    if (!(event instanceof CustomEvent)) return;
    onClick?.(event);
  };

  return <ShellBarItem {...props} onClick={handleClick} />;
}
