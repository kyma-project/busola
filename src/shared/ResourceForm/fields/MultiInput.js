import { useEffect, useRef, useState, createRef } from 'react';
import { Button, Icon, FlexBox } from '@ui5/webcomponents-react';
import classnames from 'classnames';
import { useTranslation } from 'react-i18next';

import { Tooltip } from 'shared/components/Tooltip/Tooltip';

import { ResourceForm } from '..';
import { useCreateResourceDescription } from 'components/Extensibility/helpers';

import './MultiInput.scss';

export function MultiInput({
  value,
  setValue,
  title,
  label,
  tooltipContent,
  sectionTooltipContent,
  required,
  toInternal,
  toExternal,
  inputs,
  className,
  isAdvanced,
  defaultOpen,
  fullWidth = false,
  isEntryLocked = () => false,
  readOnly,
  noEdit,
  newItemAction,
  inputInfo,
  ...props
}) {
  const { t } = useTranslation();
  const valueRef = useRef(null); // for deep comparison
  const [internalValue, setInternalValue] = useState([]);
  const [keys, setKeys] = useState(1);
  const [refs, setRefs] = useState([]);
  const inputInfoLink = useCreateResourceDescription(inputInfo);

  useEffect(() => {
    setRefs(
      Array(internalValue.length)
        .fill()
        .map((val, index) =>
          inputs.map(
            (input, inputIndex) => refs[index]?.[inputIndex] || createRef(),
          ),
        ),
    );
  }, [internalValue, inputs]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!internalValue.length || internalValue[internalValue.length - 1]) {
      setInternalValue([...internalValue, null]);
    }
  }, [internalValue]);

  // diff by stringify, as useEffect won't fire for the same object ref
  if (
    typeof value === 'object' &&
    JSON.stringify(valueRef.current) !== JSON.stringify(value)
  ) {
    valueRef.current = value
      ? Array.isArray(value)
        ? [...value]
        : { ...value }
      : value;
    setInternalValue([...toInternal(valueRef.current), null]);
  }

  const isLast = index => index === internalValue.length - 1;

  const updateValue = val => {
    setValue(toExternal(val));
  };

  const removeValue = index => {
    /* 
      Removing one of the inputs decreases the next inputs keys by one, so the last input has the previous input value instead of being empty.
      We force rerender by changing keys.
    */
    setKeys(keys * -1);
    internalValue.splice(index, 1);
    updateValue(internalValue);
  };

  const setEntry = (newVal, index) => {
    internalValue[index] = newVal;
    setInternalValue([...internalValue]);
  };

  const focus = ref => {
    if (ref?.current?.focus) {
      ref.current.focus();
    }
  };
  const open = defaultOpen === undefined ? !isAdvanced : defaultOpen;

  const listClasses = classnames({
    'text-array-input__list': true,
    'bsl-col-md--8': !fullWidth && (title || label),
    'bsl-col-md--12': fullWidth && !(title || label),
  });

  useEffect(() => {
    internalValue.forEach((entry, index) => {
      const isValid = child => child.props.validate(entry) ?? true;
      const errorMessage = child => {
        if (!child.props.validateMessage) {
          return t('common.errors.generic');
        } else if (typeof child.props.validateMessage !== 'function') {
          return child.props.validateMessage;
        } else {
          return child.props.validateMessage(entry);
        }
      };

      inputComponents[index].forEach((child, inputIndex) => {
        const inputRef = refs[index]?.[inputIndex];

        if (child?.props?.validate && inputRef?.current) {
          const valid = isValid(child);
          inputRef.current.setCustomValidity(valid ? '' : errorMessage(child));
        }
      });
    });
  }, [inputs, internalValue]); // eslint-disable-line react-hooks/exhaustive-deps

  const inputComponents = internalValue.map((entry, index) =>
    inputs.map((input, inputIndex) =>
      input({
        index: (index + 1) * keys,
        value: entry,
        setValue: entry => setEntry(entry, index),
        ref: refs[index]?.[inputIndex],
        updateValue: () => updateValue(internalValue),
        internalValue,
        setMultiValue: setValue,
        focus: (e, target) => {
          if (e.key === 'Enter') {
            if (typeof target === 'undefined') {
              focus(refs[index + 1]?.[0]);
            } else {
              focus(refs[index][target]);
            }
          } else if (e.key === 'ArrowDown') {
            focus(refs[index + 1]?.[0]);
          } else if (e.key === 'ArrowUp') {
            focus(refs[index - 1]?.[0]);
          }
        },
      }),
    ),
  );

  return (
    <ResourceForm.CollapsibleSection
      title={title}
      className={className}
      required={required}
      defaultOpen={open}
      tooltipContent={sectionTooltipContent}
      {...props}
    >
      <FlexBox className="form-field multi-input">
        {!fullWidth && (title || label) && (
          <div className="bsl-col-md--3 form-field__label">
            <ResourceForm.Label
              required={required}
              tooltipContent={tooltipContent}
            >
              {title || label}
            </ResourceForm.Label>
          </div>
        )}
        <ul className={listClasses}>
          {internalValue.map((entry, index) => (
            <li key={index} className="text-array-entry">
              <FlexBox alignItems="Baseline" style={{ gap: '10px' }}>
                <div className="bsl-col-md--11">
                  <FlexBox wrap="Wrap" style={{ gap: '10px' }}>
                    {noEdit && !isLast(index) && (
                      <span className="readonly-value">{entry}</span>
                    )}
                    {(!noEdit || isLast(index)) &&
                      inputs.map(
                        (input, inputIndex) =>
                          inputComponents[index][inputIndex],
                      )}
                  </FlexBox>
                </div>
                <div className="bsl-col-md--1">
                  {!isLast(index) && (
                    <Button
                      disabled={readOnly}
                      className={classnames({
                        hidden: isEntryLocked(entry),
                      })}
                      icon="delete"
                      design="Negative"
                      onClick={() => removeValue(index)}
                      aria-label={t('common.buttons.delete')}
                    />
                  )}
                  {isLast(index) && newItemAction}
                </div>
              </FlexBox>
            </li>
          ))}
          {inputInfo && (
            <p style={{ color: 'var(--sapNeutralTextColor)' }}>
              {inputInfoLink}
            </p>
          )}
        </ul>
        <div className="bsl-col-md--1 tooltip-column tooltip-column--with-padding">
          {tooltipContent && (
            <Tooltip className="has-tooltip" delay={0} content={tooltipContent}>
              <Icon
                aria-label=""
                className="bsl-icon-m"
                name="message-information"
              />
            </Tooltip>
          )}
        </div>
      </FlexBox>
    </ResourceForm.CollapsibleSection>
  );
}
