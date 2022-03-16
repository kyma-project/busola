import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';
import './LabelSelectorInput.scss';
import { Token, FormItem, FormLabel } from 'fundamental-react';
import { Tooltip } from './../Tooltip/Tooltip';
import { useTranslation } from 'react-i18next';

const domainSegmentRegexp = '([a-z0-9]([a-z0-9-_]{0,61}[a-z0-9])?)';

// Dot needs to be escaped for regexp
const domainRegexp = `(${domainSegmentRegexp}\\.)*${domainSegmentRegexp}`;
const nameAndValueRegexp = '[a-z0-9A-Z]([a-z0-9A-Z-_\\.]{0,61}[a-z0-9A-Z])?';
const pattern = `^((${domainRegexp})/)?${nameAndValueRegexp}=(${nameAndValueRegexp})?$`;
export const labelRegexp = new RegExp(pattern);

export const Label = ({ text, onClick, i18n }) => {
  const { t } = useTranslation(null, { i18n });

  return (
    <Token
      title={t('components.label-selector-input.click-to-delete')}
      className="label-selector__label"
      onClick={onClick}
      buttonLabel={t('common.buttons.delete')}
    >
      {text}
    </Token>
  );
};

export const NonRemovableLabel = ({ text }) => (
  <Token readOnly buttonLabel="" className="label-selector__label">
    {text}
  </Token>
);

export const LabelSelectorInput = ({
  labels = {},
  readonlyLabels = {},
  onChange,
  type = 'Labels',
  className,
  i18n,
  compact,
}) => {
  const [isValid, setValid] = useState(true);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!inputRef.current) return;
    if (typeof inputRef.current.reportValidity === 'function')
      inputRef.current.reportValidity();
  }, [isValid]);

  function handleKeyDown(e) {
    if (!isValid) {
      setValid(true);
    }
    if (e.key !== 'Enter' && e.key !== ',') return;
    handleLabelEntered(e);
  }

  function handleOutOfFocus(e) {
    handleLabelEntered(e);
  }

  function handleLabelEntered(sourceEvent) {
    const inputValue = sourceEvent.target.value;
    if (!labelRegexp.test(inputValue)) {
      if (inputValue) setValid(false);
      return;
    }
    sourceEvent.preventDefault();
    sourceEvent.target.value = '';

    const key = inputValue.split('=')[0];
    const value = inputValue.split('=')[1];
    const newLabels = { ...labels };
    newLabels[key] = value;
    onChange(newLabels);
  }

  function createLabelsToDisplay(labels) {
    const labelsArray = [];
    for (const key in labels) {
      const value = labels[key];
      const labelToDisplay = `${key}=${value}`;
      labelsArray.push(labelToDisplay);
    }
    return labelsArray;
  }

  function deleteLabel(labelToDisplay) {
    const key = labelToDisplay.split('=')[0];
    const newLabels = { ...labels };
    delete newLabels[key];
    onChange(newLabels);
  }

  const { t } = useTranslation(null, { i18n });

  const inputClassNames = classNames('fd-input label-selector__input', {
    'fd-input--compact': compact,
  });

  return (
    <FormItem className={className}>
      <FormLabel>{type}</FormLabel>

      <Tooltip content={t('common.tooltips.key-value')}>
        <div className="fd-form-group">
          <div
            className={classNames([
              'label-selector',
              { 'is-invalid': !isValid },
              { compact: compact },
            ])}
          >
            {createLabelsToDisplay(readonlyLabels).map(l => (
              <NonRemovableLabel key={l} text={l} />
            ))}

            {createLabelsToDisplay(labels).map(l => (
              <Label
                key={l}
                text={l}
                onClick={() => deleteLabel(l)}
                i18n={i18n}
              />
            ))}
            <input
              ref={inputRef}
              className={inputClassNames}
              type="text"
              placeholder={t(
                'components.label-selector-input.enter-key-value',
                { type },
              )}
              onKeyDown={handleKeyDown}
              onBlur={handleOutOfFocus}
              data-ignore-visual-validation
            />
          </div>
        </div>
      </Tooltip>
    </FormItem>
  );
};
