import React from 'react';
import { Button, ButtonSegmented } from 'fundamental-react';
import './ModeSelector.scss';

export function ModeSelector({ mode, setMode }) {
  const modeButtons = [
    { mode: ModeSelector.MODE_SIMPLE, label: 'Simple' },
    { mode: ModeSelector.MODE_ADVANCED, label: 'Advanced' },
    { mode: ModeSelector.MODE_YAML, label: 'YAML' },
  ];

  return (
    <div className="mode-selector">
      <ButtonSegmented>
        {modeButtons.map(button => (
          <Button
            compact
            key={button.mode}
            selected={mode === button.mode}
            onClick={() => setMode(button.mode)}
          >
            {button.label}
          </Button>
        ))}
      </ButtonSegmented>
    </div>
  );
}

ModeSelector.MODE_SIMPLE = 'MODE_SIMPLE';
ModeSelector.MODE_ADVANCED = 'MODE_ADVANCED';
ModeSelector.MODE_YAML = 'MODE_YAML';
