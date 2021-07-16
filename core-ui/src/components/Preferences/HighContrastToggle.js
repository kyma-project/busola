import React from 'react';
import { useTheme } from 'react-shared';
import { LayoutPanel, Switch } from 'fundamental-react';

export default function HighContrastToggle() {
  const { theme, setTheme } = useTheme();
  function handleToggleChange(e) {
    const isChecked = e.target?.checked;
    setTheme(isChecked ? 'hcb' : 'default'); // 'hcb' stands for High Contrast Black, as named in Fiori
  }

  return (
    <LayoutPanel className="fd-margin--tiny fd-margin-top--md">
      <LayoutPanel.Header>
        <LayoutPanel.Head title="High contrast theme" />
        <LayoutPanel.Actions>
          Use high contrast theme
          <Switch
            // inputProps={{ 'aria-label': 'toggle-hidden-namespaces' }}
            className="fd-has-display-inline-block fd-margin-begin--tiny"
            checked={theme === 'hcb'}
            onChange={handleToggleChange}
          />
        </LayoutPanel.Actions>
      </LayoutPanel.Header>
    </LayoutPanel>
  );
}
