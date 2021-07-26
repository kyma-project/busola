import React from 'react';
import { useTheme, Dropdown } from 'react-shared';
import { LayoutPanel } from 'fundamental-react';

const THEMES = [
  {
    key: 'default',
    text: 'SAP Quartz Light (default)',
  },

  {
    key: 'dark',
    text: 'SAP Quartz Dark',
  },
  {
    key: 'light_dark',
    text: 'SAP Belize Deep',
  },
  {
    key: 'hcw',
    text: 'SAP High-Contrast White',
  },
  {
    key: 'hcb',
    text: 'SAP High-Contrast Black',
  },
];

export default function ThemeChooser() {
  const { theme, setTheme } = useTheme();

  return (
    <LayoutPanel className="fd-margin--tiny fd-margin-top--md">
      <LayoutPanel.Header>
        <LayoutPanel.Head title="Theme" />
        <LayoutPanel.Actions>
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
