import React, { useState } from 'react';
// @ts-ignore
import { ObjectStatus, ButtonSegmented, Button, Icon } from 'fundamental-react';
import { isNil } from 'lodash';
import jsyaml from 'js-yaml';

export const isScalar = (value: any) =>
  isNil(value) || (!Array.isArray(value) && typeof value !== 'object');

export function Value({ value, label }: { value: any; label?: string }) {
  const [expanded, setExpanded] = useState(false);
  if (isNil(value)) {
    return (
      <>
        {label && <span className="label">{label}</span>} {/* @ts-ignore */}
        <ObjectStatus>null</ObjectStatus>
      </>
    );
  } else if (Array.isArray(value)) {
    return (
      <>
        <span className="expandable" onClick={() => setExpanded(!expanded)}>
          <Icon
            className="control-icon"
            ariaHidden
            glyph={
              expanded ? 'navigation-down-arrow' : 'navigation-right-arrow'
            }
          />{' '}
          {label && <span className="label">{label}</span>} {/* @ts-ignore */}
          <ObjectStatus inverted>array ({value.length})</ObjectStatus>
        </span>
        {expanded && (
          <ul>
            {value.map((item, idx) => (
              <li key={idx}>
                <Value value={item} />
              </li>
            ))}
          </ul>
        )}
      </>
    );
  } else if (typeof value === 'number') {
    return (
      <>
        {label && <span className="label">{label}</span>} {/* @ts-ignore */}
        <ObjectStatus inverted>number</ObjectStatus> {value}
      </>
    );
  } else if (typeof value === 'string') {
    return (
      <>
        {label && <span className="label">{label}</span>} {/* @ts-ignore */}
        <ObjectStatus inverted>string</ObjectStatus> {value}
      </>
    );
  } else if (typeof value === 'boolean') {
    return (
      <>
        {label && <span className="label">{label}</span>} {/* @ts-ignore */}
        <ObjectStatus inverted>boolean</ObjectStatus> {value ? 'true' : 'false'}
      </>
    );
  } else if (typeof value === 'object') {
    return (
      <>
        <span className="expandable" onClick={() => setExpanded(!expanded)}>
          <Icon
            className="control-icon"
            ariaHidden
            glyph={
              expanded ? 'navigation-down-arrow' : 'navigation-right-arrow'
            }
          />{' '}
          {label && <span className="label">{label}</span>} {/* @ts-ignore */}
          <ObjectStatus inverted>
            object ({Object.keys(value).length})
          </ObjectStatus>
          {}
        </span>
        {expanded && (
          <ul>
            {Object.entries(value).map(([key, item]) => (
              <li key={key}>
                <Value value={item} label={key} />
              </li>
            ))}
          </ul>
        )}
      </>
    );
  } else {
    return (
      <>
        {label && <span className="label">{label}</span>} {/* @ts-ignore */}
        <ObjectStatus inverted status="negative">
          ???
        </ObjectStatus>
      </>
    );
  }
  // return <>TODO {value}</>;
}

export type Mode = 'yaml' | 'json' | 'explorer';
export function ModeToggle({
  mode,
  setMode,
}: {
  mode: Mode;
  setMode: (mode: Mode) => void;
}) {
  return (
    <ButtonSegmented>
      <Button
        compact
        selected={mode === 'explorer'}
        onClick={() => setMode('explorer')}
      >
        explorer
      </Button>
      <Button
        compact
        selected={mode === 'json'}
        onClick={() => setMode('json')}
      >
        JSON
      </Button>
      <Button
        compact
        selected={mode === 'yaml'}
        onClick={() => setMode('yaml')}
      >
        YAML
      </Button>
    </ButtonSegmented>
  );
}

export function ModeView({ mode, value }: { mode: Mode; value: any }) {
  if (mode === 'yaml') {
    return <pre>{jsyaml.dump(value)}</pre>;
  } else if (mode === 'json') {
    return <pre>{JSON.stringify(value, null, 4)}</pre>;
  } else {
    return (
      <div className="explorer">
        <Value value={value} />
      </div>
    );
  }
}

export function Explorer({ value }: { value: any }) {
  const [mode, setMode] = useState<Mode>('explorer');

  console.log('Explorer', value, typeof value, isScalar(value));
  if (isScalar(value)) {
    return <Value value={value} />;
  }

  return (
    <>
      <ModeToggle mode={mode} setMode={setMode} />
      <ModeView mode={mode} value={value} />
    </>
  );

  // if (typeof value

  // if (typeof value === 'explorer') {
  // return 'TODO';
  // } else if
}
