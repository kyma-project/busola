import { ITheme } from '@xterm/xterm';

function getSapToken(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

export function getXtermTheme(): ITheme {
  // All colors are resolved from the active SAP design tokens at call time.
  // This covers all themes (light, dark, high-contrast) without hardcoded hex values.
  const background = getSapToken('--sapField_Background');
  return {
    background,
    foreground: getSapToken('--sapTextColor'),
    cursor: getSapToken('--sapField_Active_BorderColor'),
    cursorAccent: background,
    selectionBackground: `${getSapToken('--sapSelectedColor')}80`,
    red: getSapToken('--sapNegativeTextColor'),
    green: getSapToken('--sapPositiveTextColor'),
    yellow: getSapToken('--sapCriticalTextColor'),
    blue: getSapToken('--sapInformativeTextColor'),
    brightRed: getSapToken('--sapNegativeElementColor'),
    brightGreen: getSapToken('--sapPositiveElementColor'),
    brightYellow: getSapToken('--sapCriticalElementColor'),
    brightBlue: getSapToken('--sapInformativeElementColor'),
  };
}

export const TERMINAL_MIN_HEIGHT = 100;
