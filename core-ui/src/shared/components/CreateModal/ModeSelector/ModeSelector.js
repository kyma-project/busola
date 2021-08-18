import React from 'react';
import { Button, ButtonSegmented } from 'fundamental-react';
import './ModeSelector.scss';

export const MODE_SIMPLE = 'MODE_SIMPLE';
export const MODE_ADVANCED = 'MODE_ADVANCED';
export const MODE_YAML = 'MODE_YAML';

export function ModeSelector({ mode, setMode }) {
  const modeButtons = [
    { mode: MODE_SIMPLE, label: 'Simple' },
    { mode: MODE_ADVANCED, label: 'Advanced' },
    { mode: MODE_YAML, label: 'YAML' },
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
