import { useEffect, useRef, useState, createRef } from 'react';
import { Button, FlexBox } from '@ui5/webcomponents-react';
import classnames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Label } from '../../../shared/ResourceForm/components/Label';

import { ResourceForm } from '..';
import { useCreateResourceDescription } from 'components/Extensibility/helpers';
import { spacing } from '@ui5/webcomponents-react-base';

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
  defaultOpen,
  isEntryLocked = () => false,
  readOnly,
  noEdit,
  newItemAction,
  newItemActionWidth = 1,
  inputInfo,
  disableOnEdit,
  editMode,
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
  const open = defaultOpen ?? false;

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
      tooltipContent={sectionTooltipContent || tooltipContent}
      {...props}
    >
      <div className="form-field multi-input">
        <ul className="bsl-col-md--12">
          {internalValue.map((entry, index) => {
            const fieldWidth =
              isLast(index) && newItemAction
                ? `bsl-col-md--${12 - newItemActionWidth}`
                : 'bsl-col-md--11';

            return (
              <li key={index} style={spacing.sapUiTinyMarginBottom}>
                <FlexBox style={{ gap: '10px' }} alignItems="Center">
                  {noEdit && !isLast(index) && (
                    <span className="readonly-value">{entry}</span>
                  )}

                  {(!noEdit || isLast(index)) && (
                    <div className={fieldWidth}>
                      <FlexBox style={{ gap: '10px' }} alignItems="Center">
                        {inputs.map(
                          (input, inputIndex) =>
                            inputComponents[index][inputIndex],
                        )}
                      </FlexBox>
                    </div>
                  )}

                  {!isLast(index) && (
                    <div className="bsl-col-md--1">
                      <Button
                        disabled={readOnly || (disableOnEdit && editMode)}
                        className={classnames({
                          hidden: isEntryLocked(entry),
                        })}
                        icon="delete"
                        design="Transparent"
                        onClick={() => removeValue(index)}
                        aria-label={t('common.buttons.delete')}
                      />
                    </div>
                  )}

                  {isLast(index) && newItemAction && (
                    <div className={`bsl-col-md--${newItemActionWidth}`}>
                      {newItemAction}
                    </div>
                  )}
                </FlexBox>
              </li>
            );
          })}
          {inputInfo && (
            <Label wrappingType="Normal" style={{ marginTop: '5px' }}>
              {inputInfoLink}
            </Label>
          )}
        </ul>
      </div>
    </ResourceForm.CollapsibleSection>
  );
}
