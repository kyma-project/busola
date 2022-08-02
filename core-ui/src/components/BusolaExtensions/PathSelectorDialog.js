import React, { useState } from 'react';
import { FormInput, Dialog, Button, Icon } from 'fundamental-react';

import './PathSelectorDialog.scss';

export function PathSelectorDialog({
  schema,
  show,
  onCancel,
  onAdd,
  allowCustom = false,
  expandArrays = true,
}) {
  const [path, setPath] = useState('');

  const Child = ({ name, parentPath, def }) => {
    const [expanded, setExpanded] = useState(false);
    const path = [...parentPath, name];
    const pathString = path.join('.').replace(/\.\[]/g, '[]');

    if (def.type === 'object') {
      return (
        <>
          <div>
            <Icon
              className="control-icon"
              ariaHidden
              glyph={
                expanded ? 'navigation-down-arrow' : 'navigation-right-arrow'
              }
              onClick={() => setExpanded(!expanded)}
            />
            <span onClick={() => setExpanded(!expanded)}>{pathString}</span>
            <Button
              compact
              glyph="add"
              onClick={() => onAdd(pathString, name)}
              option="transparent"
            ></Button>
          </div>
          {expanded && <Children parentPath={path} parent={def} />}
        </>
      );
    } else if (def.type === 'array') {
      return (
        <>
          <div className="name">
            {pathString}
            <Button
              compact
              glyph="add"
              onClick={() => onAdd(pathString, name)}
              option="transparent"
            ></Button>
          </div>
          {expandArrays && (
            <Child parentPath={path} name={`[]`} def={def.items} />
          )}
        </>
      );
    } else {
      return (
        <div className="name">
          {pathString}
          <Button
            compact
            glyph="add"
            onClick={() => onAdd(pathString, name)}
            option="transparent"
          ></Button>
        </div>
      );
    }
  };

  const Children = ({ parentPath = [], parent }) => {
    if (!parent.properties) return '';
    return (
      <ul className="children">
        {Object.entries(parent.properties).map(([name, def]) => (
          <li>
            <Child name={name} def={def} parentPath={parentPath} />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Dialog
      show={show}
      title={'«Select path»'}
      className="path-selection-dialog"
      actions={[
        <Button option="emphasized" onClick={() => onAdd(path)}>
          «add»
        </Button>,
        <Button option="transparent" onClick={onCancel}>
          «cancel»
        </Button>,
      ]}
    >
      <FormInput value={path} onChange={e => setPath(e.target.value)} />
      <div className="schema-selector">
        <Children parent={schema} />
      </div>
      {/*
      <pre style={{ fontFamily: 'monospace', fontSize: '.7rem' }}>
        {JSON.stringify(schema, null, 4)}
      </pre>
      */}
    </Dialog>
  );
}
