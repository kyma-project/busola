import React, {
  useEffect,
  useRef,
  useState,
  createRef,
  useCallback,
} from 'react';
import { Button } from 'fundamental-react';
import classnames from 'classnames';
import { useTranslation } from 'react-i18next';

import { ResourceForm } from '..';

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
  ...props
}) {
  const { t } = useTranslation();
  const valueRef = useRef(null); // for deep comparison
  const [internalValue, setInternalValue] = useState([]);
  const [keys, setKeys] = useState(1);
  const refs = Array(internalValue.length)
    .fill()
    .map(() => inputs.map(() => createRef()));

  useEffect(() => {
    if (!internalValue.length || internalValue[internalValue.length - 1]) {
      setInternalValue([...internalValue, null]);
    }
  }, [internalValue]);

  const toInternalCallback = useCallback(toInternal, []);

  useEffect(() => {
    setInternalValue([...toInternalCallback(value), null]);
  }, [value, toInternalCallback]);

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

  const updateValue = val => setValue(toExternal(val));

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
    'fd-col': true,
    'fd-col-md--7': !fullWidth,
    'fd-col-md--12': fullWidth,
  });

  return (
    <ResourceForm.CollapsibleSection
      title={title}
      className={className}
      required={required}
      defaultOpen={open}
      tooltipContent={sectionTooltipContent}
      {...props}
    >
      <div className="fd-row form-field multi-input">
        {!fullWidth && (
          <div className="fd-col fd-col-md--4">
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
            <li key={index}>
              {inputs.map((input, inputIndex) =>
                input({
                  index: (index + 1) * keys,
                  value: entry,
                  setValue: entry => setEntry(entry, index),
                  ref: refs[index]?.[inputIndex],
                  updateValue: () => updateValue(internalValue),
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
              )}
              <Button
                disabled={readOnly}
                compact
                className={classnames({
                  hidden: isLast(index) || isEntryLocked(entry),
                })}
                glyph="delete"
                type="negative"
                onClick={() => removeValue(index)}
                ariaLabel={t('common.buttons.delete')}
              />
            </li>
          ))}
        </ul>
      </div>
    </ResourceForm.CollapsibleSection>
  );
}
