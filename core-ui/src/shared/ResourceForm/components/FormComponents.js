import React, { useEffect, useRef, useState, createRef } from 'react';
import { FormInput, FormLabel, Button, Icon } from 'fundamental-react';
import { Tooltip, K8sNameInput } from 'react-shared';
import classnames from 'classnames';
import * as jp from 'jsonpath';
import './FormComponents.scss';
import { useTranslation } from 'react-i18next';

export function CollapsibleSection({
  disabled = false,
  defaultOpen,
  canChangeState = true,
  title,
  actions,
  children,
  resource,
  setResource,
  className,
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const actionsRef = React.useRef();
  const iconGlyph = open ? 'navigation-down-arrow' : 'navigation-right-arrow';

  const toggle = e => {
    // ignore events from actions
    if (!canChangeState) return;
    if (disabled) return;
    if (!actionsRef.current?.contains(e.target)) setOpen(!open);
  };

  const classNames = classnames(
    'resource-form__collapsible-section',
    className,
    {
      collapsed: !open,
    },
  );

  return (
    <div className={classNames}>
      <header onClick={toggle} aria-label={`expand ${title}`}>
        <div>
          {!disabled && canChangeState && (
            <Icon className="control-icon" ariaHidden glyph={iconGlyph} />
          )}
          {title}
        </div>
        <div ref={actionsRef}>{actions}</div>
      </header>
      {open && (
        <div className="content">
          {React.Children.map(children, child => {
            if (!child.props.propertyPath) {
              return child;
            }
            return React.cloneElement(child, {
              value: jp.value(resource, child.props.propertyPath),
              setValue: value => {
                jp.value(resource, child.props.propertyPath, value);
                setResource({ ...resource });
              },
            });
          })}
        </div>
      )}
    </div>
  );
}

export function Label({ required, tooltipContent, children }) {
  const label = <FormLabel required={required}>{children}</FormLabel>;

  if (tooltipContent) {
    return <Tooltip content={tooltipContent}>{label}</Tooltip>;
  } else {
    return label;
  }
}

export function FormField({
  simple,
  advanced,
  propertyPath,
  label,
  input,
  className,
  required,
  disabled,
  tooltipContent,
  ...props
}) {
  return (
    <div className={classnames('fd-row form-field', className)}>
      <div className="fd-col fd-col-md--4 form-field__label">
        <Label required={required && !disabled} tooltipContent={tooltipContent}>
          {label}
        </Label>
      </div>
      <div className="fd-col fd-col-md--7">
        {input({ required, disabled, ...props })}
      </div>
    </div>
  );
}

export function K8sNameField({
  kind,
  value,
  setValue,
  customSetValue,
  className,
}) {
  const { t, i18n } = useTranslation();

  const onChange = value =>
    customSetValue ? customSetValue(value) : setValue(value);

  return (
    <FormField
      required
      className={className}
      propertyPath="$.metadata.name"
      label={t('common.labels.name')}
      input={() => {
        return (
          <K8sNameInput
            kind={kind}
            compact
            required
            showLabel={false}
            onChange={e => onChange(e.target.value)}
            value={value}
            i18n={i18n}
          />
        );
      }}
    />
  );
}

export function MultiInput({
  value,
  setValue,
  label,
  tooltipContent,
  required,
  toInternal,
  toExternal,
  inputs,
  className,
  ...props
}) {
  const valueRef = useRef(null); // for deep comparison
  const [internalValue, setInternalValue] = useState([]);
  const refs = Array(internalValue.length)
    .fill()
    .map(() => inputs.map(() => createRef()));

  useEffect(() => {
    if (!internalValue.length || internalValue[internalValue.length - 1]) {
      setInternalValue([...internalValue, null]);
    }
  }, [internalValue]);

  useEffect(() => {
    setInternalValue([...toInternal(value), null]);
  }, [value, toInternal]);

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
    internalValue.splice(index, 1);
    updateValue(internalValue);
  };

  const setEntry = (newVal, index) => {
    internalValue[index] = newVal;
    setInternalValue([...internalValue]);
  };

  const focus = ref => {
    if (ref) {
      ref.current.focus();
    }
  };

  return (
    <CollapsibleSection title={label} className={className} {...props}>
      <ul className="text-array-input__list">
        {internalValue.map((entry, index) => (
          <li key={index}>
            {inputs.map((input, inputIndex) =>
              input({
                index,
                value: entry,
                setValue: entry => setEntry(entry, index),
                ref: refs[index]?.[inputIndex],
                onBlur: () => updateValue(internalValue),
                focus: (e, target) => {
                  if (e.key === 'Enter') {
                    if (typeof target === 'undefined') {
                      focus(refs[index + 1][0]);
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
              className={classnames({ hidden: isLast(index) })}
              glyph="delete"
              type="negative"
              onClick={() => removeValue(index)}
            />
          </li>
        ))}
      </ul>
    </CollapsibleSection>
  );
}

export function TextArrayInput({ inputProps, ...props }) {
  return (
    <MultiInput
      toInternal={value => value || []}
      toExternal={value => value.filter(val => !!val)}
      inputs={[
        ({ value, setValue, ref, onBlur, focus }) => (
          <FormInput
            value={value || ''}
            ref={ref}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => focus(e)}
            onBlur={onBlur}
            {...inputProps}
          />
        ),
      ]}
      {...props}
    />
  );
}

export function KeyValueField({
  keyProps = {
    pattern: '([A-Za-z0-9][-A-Za-z0-9_./]*)?[A-Za-z0-9]',
  },
  ...props
}) {
  const { t } = useTranslation();
  return (
    <MultiInput
      toInternal={value =>
        Object.entries(value || {}).map(([key, val]) => ({ key, val }))
      }
      toExternal={value =>
        value
          .filter(entry => !!entry?.key)
          .reduce((acc, entry) => ({ ...acc, [entry.key]: entry.val }), {})
      }
      inputs={[
        ({ value, setValue, ref, onBlur, focus }) => (
          <FormInput
            key="key"
            value={value?.key || ''}
            ref={ref}
            onChange={e =>
              setValue({ val: value?.val || '', key: e.target.value })
            }
            onKeyDown={e => focus(e, 1)}
            onBlur={onBlur}
            {...keyProps}
            placeholder={t('components.key-value-field.enter-key')}
          />
        ),
        ({ value, setValue, ref, onBlur, focus }) => (
          <FormInput
            key="value"
            value={value?.val || ''}
            ref={ref}
            onChange={e => setValue({ ...value, val: e.target.value })}
            onKeyDown={e => focus(e)}
            onBlur={onBlur}
            placeholder={t('components.key-value-field.enter-value')}
          />
        ),
      ]}
      {...props}
    />
  );
}
