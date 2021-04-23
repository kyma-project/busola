import React from 'react';
import PropTypes from 'prop-types';
import { Button, FormLabel, FormInput, InfoLabel } from 'fundamental-react';
import { Tooltip } from '../..';
import { fromEntries, toEntries, readFromFile } from './helpers';
import { v4 as uuid } from 'uuid';
import './KeyValueForm.scss';

KeyValueForm.propTypes = {
  data: PropTypes.object.isRequired,
  setData: PropTypes.func.isRequired,
  setValid: PropTypes.func.isRequired,
};

export function KeyValueForm({
  data,
  setData,
  setValid,
  customHeaderAction,
  keyPatternInfo = 'Key name must consist of alphanumeric characters, dashes, full stops and underlines. It must not start with full stop.',
  keyPattern = '[a-zA-z0-9_-][a-zA-z0-9_.-]*',
}) {
  const [entries, setEntries] = React.useState(toEntries(data));
  const [keyCounter, setKeyCounter] = React.useState({});

  React.useEffect(() => {
    const counter = {};
    for (const entry of entries) {
      counter[entry.key] = (counter[entry.key] || 0) + 1;
    }
    setKeyCounter(counter);
    setData(fromEntries(entries));
    setValid(Object.values(counter).every(c => c === 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries]);

  const addEntry = () =>
    setEntries([...entries, { key: '', value: '', renderId: uuid() }]);

  const deleteEntry = () =>
    setEntries(entries.filter(e => e.renderId !== entry.renderId));

  return (
    <section className="key-value-form">
      <span className="fd-has-color-text-4">{keyPatternInfo}</span>
      <header className="fd-has-margin-top-m fd-has-margin-bottom-s">
        <Button
          className="add-entry"
          glyph="add"
          type="ghost"
          typeAttr="button"
          onClick={addEntry}
        >
          Add data entry
        </Button>
        {customHeaderAction && customHeaderAction(entries, setEntries)}
      </header>
      <ul>
        {entries.map(entry => (
          <li className="fd-has-margin-top-tiny" key={entry.renderId}>
            <div className="grid-wrapper">
              <FormLabel htmlFor="key" required>
                Key
                {keyCounter[entry.key] > 1 && (
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
                onClick={deleteEntry}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
