import React from 'react';
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

export function Input({ value, setValue, required, ...props }) {
  return (
    <FormInput
      compact
      required={required}
      value={value}
      onChange={e => setValue(e.target.value)}
      {...props}
    />
  );
}

export function FormField({
  label,
  input,
  className,
  required,
  tooltipContent,
  value,
  setValue,
}) {
  return (
    <div className={classnames('fd-row form-field', className)}>
      <div className="fd-col fd-col-md--4 form-field__label">
        <Label required={required} tooltipContent={tooltipContent}>
          {label}
        </Label>
      </div>
      <div className="fd-col fd-col-md--7">{input(value, setValue)}</div>
    </div>
  );
}

export function K8sNameField({
  kind,
  value,
  setValue,
  customOnChange,
  className,
}) {
  const { t, i18n } = useTranslation();

  const onChange = value =>
    customOnChange ? customOnChange(value) : setValue(value);

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

export function TextArrayInput({
  value,
  setValue,
  label,
  tooltipContent,
  required,
  ...props
}) {
  const { t } = useTranslation();

  const addValue = () => setValue([...value, '']);

  const removeValue = index => setValue(value.filter((_, i) => i !== index));

  const onChange = (e, index) => {
    value[index] = e.target.value;
    setValue([...value]);
  };

  return (
    <CollapsibleSection
      canChangeState={false}
      defaultOpen
      title={label}
      actions={
        <Button compact glyph="add" onClick={addValue}>
          {t('common.buttons.add')}
        </Button>
      }
    >
      <ul className="text-array-input__list">
        {(value || []).map((entry, i) => (
          <li key={i}>
            <FormInput
              value={entry}
              onChange={e => onChange(e, i)}
              {...props}
            />
            <Button
              glyph="delete"
              type="negative"
              onClick={() => removeValue(i)}
            />
          </li>
        ))}
      </ul>
    </CollapsibleSection>
  );
}

export function KeyValueField({
  label,
  value,
  setValue,
  keyProps = {
    required: true,
    pattern: '([A-Za-z0-9][-A-Za-z0-9_./]*)?[A-Za-z0-9]',
  },
  className,
}) {
  const { t } = useTranslation();

  const addValue = () => setValue({ ...value, '': '' });

  const removeValue = key => {
    delete value[key];
    setValue({ ...value });
  };

  const onChange = (k, v, prevKey) => {
    if (prevKey !== undefined) delete value[prevKey];
    value[k] = v;
    setValue({ ...value });
  };

  return (
    <CollapsibleSection
      title={label}
      actions={
        <Button compact glyph="add" onClick={addValue}>
          {t('common.buttons.add')}
        </Button>
      }
      className={className}
    >
      <ul className="text-array-input__list">
        {Object.entries(value || {}).map(([key, value]) => (
          <li key={key}>
            <FormInput
              defaultValue={key}
              onBlur={e => onChange(e.target.value, value, key)}
              {...keyProps}
              placeholder="Enter key"
            />
            <FormInput
              value={value}
              onChange={e => onChange(key, e.target.value)}
              placeholder="Enter value"
            />
            <Button
              glyph="delete"
              type="negative"
              onClick={() => removeValue(key)}
            />
          </li>
        ))}
      </ul>
    </CollapsibleSection>
  );
}
