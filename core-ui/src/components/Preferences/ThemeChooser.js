import React from 'react';
import { useTheme } from 'react-shared';
import { TileButton } from './ThemePreview/TileButton';
import { ThemePreview } from './ThemePreview/ThemePreview';

const THEMES = [
  {
    key: 'light_dark',
    text: 'Light / Dark',
    description: 'Depends on system settings',
  },
  {
    key: 'light',
    text: 'Light',
    description: 'Use in a default office environment',
  },
  {
    key: 'dark',
    text: 'Dark',
    description: 'Use in dimmed environments',
  },
  {
    key: 'hcw',
    text: 'High-Contrast White',
    description: 'Optimized contrast and accessibility for dark environments',
  },
  {
    key: 'hcb',
    text: 'High-Contrast Black',
    description: 'Optimized contrast and accessibility for bright environments',
  },
];

export default function ThemeChooser() {
  const { theme, setTheme } = useTheme();

  return (
    <ul>
      {THEMES.map(t => (
        <TileButton
          key={t.key}
          id={t.key}
          title={t.text}
          description={t.description}
          icon={<ThemePreview theme={t.key} />}
          isActive={t.key === theme}
          handleClick={() => setTheme(t.key)}
        />
      ))}
    </ul>
  );
}
