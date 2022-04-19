import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  FormLabel,
  FormInput,
  FormTextarea,
  Icon,
} from 'fundamental-react';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import {
  fromEntries,
  toEntries,
  readFromFile,
} from 'shared/components/KeyValueForm/helpers';
import { v4 as uuid } from 'uuid';
import './KeyValueForm.scss';
import { useTranslation } from 'react-i18next';
import * as _ from 'lodash';

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
  const prevData = React.useRef({});

  React.useEffect(() => {
    if (!_.isEqual(data, prevData.current)) {
      setEntries(toEntries(data));
      prevData.current = data;
    }
  }, [data]);

  React.useEffect(() => {
    const counter = {};
    for (const entry of entries) {
      counter[entry.key] = (counter[entry.key] || 0) + 1;
    }
    setKeyCounter(counter);
    const newData = fromEntries(entries);
    prevData.current = newData;
    setData(newData);
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
      <span className="fd-has-color-text-4"></span>
      <header className="fd-margin-top--sm fd-margin-bottom--sm">
        <Button
          className="add-entry"
          glyph="add"
          type="ghost"
          typeAttr="button"
          onClick={addEntry}
        >
          {t('components.key-value-form.add-entry')}
        </Button>
        {customHeaderAction && customHeaderAction(entries, setEntries)}
      </header>
      <ul>
        {entries.map(entry => (
          <li role="row" className="fd-margin-top--tiny" key={entry.renderId}>
            <div className="grid-wrapper">
              <FormLabel htmlFor="key" required>
                {t('components.key-value-form.key')}
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
              <FormLabel htmlFor="value">
                {t('components.key-value-form.value')}
              </FormLabel>
            </div>
            <div className="grid-wrapper">
              <Tooltip
                className="fd-margin-end--tiny"
                position="right"
                content={t('common.tooltips.key')}
              >
                <FormInput
                  required
                  name="key"
                  placeholder={t('components.key-value-form.key')}
                  pattern={keyPattern}
                  onChange={e => {
                    entry.key = e.target.value;
                    setEntries([...entries]);
                  }}
                  value={entry.key}
                />
              </Tooltip>
              <Tooltip
                className="fd-margin-end--tiny"
                position="right"
                content={t('common.tooltips.value')}
              >
                <FormTextarea
                  className="value-textarea"
                  name="value"
                  placeholder={t('components.key-value-form.value')}
                  onChange={e => {
                    entry.value = e.target.value;
                    setEntries([...entries]);
                  }}
                  value={entry.value}
                />
              </Tooltip>
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
                  {t('components.key-value-form.read-value')}
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
