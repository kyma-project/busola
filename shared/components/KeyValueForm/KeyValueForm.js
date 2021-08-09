import React from 'react';
import PropTypes from 'prop-types';
import { Button, FormLabel, FormInput, Icon } from 'fundamental-react';
import { Tooltip } from '../..';
import { fromEntries, toEntries, readFromFile } from './helpers';
import { v4 as uuid } from 'uuid';
import './KeyValueForm.scss';
import { useTranslation } from 'react-i18next';

KeyValueForm.propTypes = {
  data: PropTypes.object.isRequired,
  setData: PropTypes.func.isRequired,
  setValid: PropTypes.func.isRequired,
  customHeaderAction: PropTypes.any,
  keyPatternInfo: PropTypes.string,
  keyPattern: PropTypes.string,
};

export function KeyValueForm({
  data,
  setData,
  setValid,
  customHeaderAction,
  keyPattern = '[a-zA-z0-9_.-]+',
  i18n,
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

  const deleteEntry = entry =>
    setEntries(entries.filter(e => e.renderId !== entry.renderId));

  const { t } = useTranslation(null, { i18n });
  return (
    <section className="key-value-form">
      <span className="fd-has-color-text-4">
        {t('common.tooltips.k8s-name-input')}
      </span>
      <header className="fd-margin-top--sm fd-margin-bottom--sm">
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
          <li role="row" className="fd-margin-top--tiny" key={entry.renderId}>
            <div className="grid-wrapper">
              <FormLabel htmlFor="key" required>
                Key
                {keyCounter[entry.key] > 1 && (
                  <Tooltip
                    className="fd-margin-end--tiny"
                    position="right"
                    content={t('common.tooltips.duplicate-key')}
                  >
                    <Icon ariaLabel="Duplicate key" glyph="alert" />
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
              <textarea
                className="value-textarea"
                name="value"
                placeholder="Value"
                onChange={e => {
                  entry.value = e.target.value;
                  setEntries([...entries]);
                }}
                value={entry.value}
              />
              <Tooltip content={t('common.tooltips.read-file')}>
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
                  Read value from file
                </Button>
              </Tooltip>
              <Button
                type="negative"
                typeAttr="button"
                glyph="delete"
                aria-label="Delete entry"
                onClick={() => deleteEntry(entry)}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
