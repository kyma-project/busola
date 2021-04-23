import React from 'react';
import PropTypes from 'prop-types';
import { Button, FormLabel, FormInput, InfoLabel } from 'fundamental-react';
import { Tooltip } from '../..';
import { v4 as uuid } from 'uuid';
import './KeyValueForm.scss';

KeyValueForm.propTypes = {
  data: PropTypes.object.isRequired,
  setData: PropTypes.func.isRequired,
  setValid: PropTypes.func.isRequired,
};

function fromEntries(entries) {
  return Object.fromEntries(entries.map(e => [e.key, e.value]));
}

function toEntries(object) {
  return Object.entries(object).map(([key, value]) => ({
    renderId: uuid(),
    key,
    value,
  }));
}

function readFromFile() {
  return new Promise(resolve => {
    const input = document.createElement('input');
    input.type = 'file';
    input.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) resolve(null);
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = e =>
        resolve({ name: file.name, content: e.target.result });
    });
    input.click();
  });
}

export function KeyValueForm({ data, setData, setValid, customHeaderAction }) {
  // "field must consist of alphanumeric characters, -, _ or ." and not start with '.'
  const keyPattern = '[a-zA-z0-9_-][a-zA-z0-9_.-]*';
  const [entries, setEntries] = React.useState(toEntries(data));
  const [duplicateCounter, setDuplicateCounter] = React.useState({});

  React.useEffect(() => {
    const counter = {};
    for (const entry of entries) {
      counter[entry.key] = (counter[entry.key] || 0) + 1;
    }
    setDuplicateCounter(counter);
    setData(fromEntries(entries));
    setValid(Object.values(counter).every(c => c === 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries]);

  return (
    <section className="key-value-form">
      <header className="fd-has-margin-top-m">
        <Button
          className="add-entry"
          glyph="add"
          type="ghost"
          typeAttr="button"
          onClick={() =>
            setEntries([...entries, { key: '', value: '', renderId: uuid() }])
          }
        >
          Add data entry
        </Button>
        {customHeaderAction && customHeaderAction(entries, setEntries)}
      </header>
      <ul>
        {entries.map(entry => (
          <li key={entry.renderId}>
            <div className="grid-wrapper">
              <FormLabel htmlFor="key" required>
                Key
                {duplicateCounter[entry.key] > 1 && (
                  <Tooltip
                    className="fd-has-margin-left-tiny"
                    position="right"
                    content="Duplicate key"
                  >
                    <InfoLabel color={2} glyph="alert" />
                  </Tooltip>
                )}
              </FormLabel>
              <FormLabel htmlFor="value">Value</FormLabel>
            </div>
            <div className="grid-wrapper">
              <FormInput
                required
                name="key"
                placeholder="Key"
                pattern={keyPattern}
                onChange={e => {
                  entry.key = e.target.value;
                  setEntries([...entries]);
                }}
                value={entry.key}
              />
              <FormInput
                name="value"
                placeholder="Value"
                onChange={e => {
                  entry.value = e.target.value;
                  setEntries([...entries]);
                }}
                value={entry.value}
              />
              <Button
                typeAttr="button"
                onClick={() =>
                  readFromFile().then(result => {
                    if (result) {
                      entry.key = result.name;
                      entry.value = result.content;
                      setEntries([...entries]);
                    }
                  })
                }
              >
                Read from file
              </Button>
              <Button
                type="negative"
                typeAttr="button"
                glyph="delete"
                onClick={() =>
                  setEntries(entries.filter(e => e.renderId !== entry.renderId))
                }
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
