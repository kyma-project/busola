import React from 'react';
import { useTheme, Dropdown } from 'react-shared';
import { LayoutPanel } from 'fundamental-react';

const THEMES = [
  {
    key: 'default',
    text: 'Light (default)',
  },
  // {
  //   key: 'light_dark',
  //   text: 'Light Dark',
  // },
  // I cannot see any difference from "dark"
  {
    key: 'dark',
    text: 'Dark',
  },
  {
    key: 'hcw',
    text: 'High Contrast White',
  },
  {
    key: 'hcb',
    text: 'High Contrast Black',
  },
];

export default function ThemeChooser() {
  const { theme, setTheme } = useTheme();

  return (
    <LayoutPanel className="fd-margin--tiny fd-margin-top--md">
      <LayoutPanel.Header>
        <LayoutPanel.Head title="Theme" />
        <LayoutPanel.Actions>
          {/* Choose the theme of the app */}
          <Dropdown
            id="access-strategies-dropdown"
            options={THEMES}
            selectedKey={theme}
            onSelect={(_, option) => setTheme(option.key)}
          />
        </LayoutPanel.Actions>
      </LayoutPanel.Header>
    </LayoutPanel>
  );
}
