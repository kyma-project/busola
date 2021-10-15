import React, {
  useEffect,
  useRef,
  useState,
  createRef,
  useCallback,
} from 'react';
import {
  ComboboxInput as FdComboboxInput,
  FormInput,
  FormLabel,
  Button,
  Icon,
  MessageStrip,
} from 'fundamental-react';
import { Select as WrappedSelect } from 'shared/components/Select/Select';
import { Tooltip, K8sNameInput } from 'react-shared';
import classnames from 'classnames';
import './FormComponents.scss';
import { useTranslation } from 'react-i18next';
import { ResourceFormWrapper } from '../ResourceForm';

export function CollapsibleSection({
  disabled = false,
  defaultOpen = undefined,
  isAdvanced,
  canChangeState = true,
  title,
  actions,
  children,
  resource,
  setResource,
  className,
  required,
  tooltipContent,
}) {
  const [open, setOpen] = useState(
    defaultOpen === undefined ? !isAdvanced : defaultOpen,
  );
  const actionsRef = useRef();
  const iconGlyph = open ? 'navigation-down-arrow' : 'navigation-right-arrow';

  useEffect(() => setOpen(defaultOpen), [defaultOpen]);

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
      required,
      disabled,
    },
  );

  return (
    <div className={classNames}>
      <header onClick={toggle} aria-label={`expand ${title}`}>
        {
          <Title
            tooltipContent={tooltipContent}
            title={title}
            disabled={disabled}
            canChangeState={canChangeState}
            iconGlyph={iconGlyph}
          />
        }
        <div ref={actionsRef}>
          {typeof actions === 'function' ? actions(setOpen) : actions}
        </div>
      </header>
      {open && (
        <div className="content">
          <ResourceFormWrapper resource={resource} setResource={setResource}>
            {children}
          </ResourceFormWrapper>
        </div>
      )}
    </div>
  );
}

export function Title({
  tooltipContent,
  title,
  disabled,
  canChangeState,
  iconGlyph,
}) {
  const classNames = classnames('title', {
    'tooltip-cursor': tooltipContent,
  });
  const component = (
    <div className={classNames}>
      {!disabled && canChangeState && (
        <Icon className="control-icon" ariaHidden glyph={iconGlyph} />
      )}
      {title}
    </div>
  );

  if (tooltipContent) {
    return <Tooltip content={tooltipContent}>{component}</Tooltip>;
  } else {
    return component;
  }
}
export function Label({ required, tooltipContent, children }) {
  return (
    <>
      <FormLabel required={required}>{children}</FormLabel>
      {tooltipContent && (
        <Tooltip delay={0} content={tooltipContent}>
          <Icon ariaLabel="Tooltip" glyph="question-mark" />
        </Tooltip>
      )}
    </>
  );
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
  isAdvanced,
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

export function K8sNameField({ kind, value, setValue, className }) {
  const { t, i18n } = useTranslation();

  return (
    <FormField
      required
      className={className}
      propertyPath="$.metadata.name"
      label={t('common.labels.name')}
      tooltipContent={t('common.tooltips.k8s-name-input')}
      input={() => {
        return (
          <K8sNameInput
            kind={kind}
            compact
            required
            showHelp={false}
            showLabel={false}
            onChange={e => setValue(e.target.value)}
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
  const open = defaultOpen === undefined ? !isAdvanced : defaultOpen;

  return (
    <CollapsibleSection
      title={title}
      className={className}
      required={required}
      defaultOpen={open}
      tooltipContent={sectionTooltipContent}
      {...props}
    >
      <div className="fd-row form-field multi-input">
        <div className="fd-col fd-col-md--4">
          <Label required={required} tooltipContent={tooltipContent}>
            {title || label}
          </Label>
        </div>
        <ul className="text-array-input__list fd-col fd-col-md--7">
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
                compact
                className={classnames({ hidden: isLast(index) })}
                glyph="delete"
                type="negative"
                onClick={() => removeValue(index)}
              />
            </li>
          ))}
        </ul>
      </div>
    </CollapsibleSection>
  );
}

export function TextArrayInput({
  defaultOpen,
  inputProps,
  isAdvanced,
  tooltipContent,
  sectionTooltipContent,
  ...props
}) {
  return (
    <MultiInput
      defaultOpen={defaultOpen}
      isAdvanced={isAdvanced}
      toInternal={value => value || []}
      toExternal={value => value.filter(val => !!val)}
      tooltipContent={tooltipContent}
      sectionTooltipContent={sectionTooltipContent}
      inputs={[
        ({ value, setValue, ref, onBlur, focus }) => (
          <FormInput
            key={`form-${props.title}`}
            compact
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
  defaultOpen,
  isAdvanced,
  keyProps = {
    pattern: '([A-Za-z0-9][-A-Za-z0-9_./]*)?[A-Za-z0-9]',
  },
  ...props
}) {
  const { t } = useTranslation();
  return (
    <MultiInput
      defaultOpen={defaultOpen}
      isAdvanced={isAdvanced}
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
            compact
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
            compact
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
      tooltipContent={t('common.tooltips.key-value')}
      {...props}
    />
  );
}

export function ItemArray({
  value: values,
  setValue: setValues,
  listTitle,
  entryTitle,
  nameSingular,
  atLeastOneRequiredMessage,
  itemRenderer,
  newResourceTemplateFn,
}) {
  const { t } = useTranslation();

  values = values || [];

  const remove = index => setValues(values.filter((_, i) => index !== i));

  const renderAllItems = () =>
    values.map((current, i) => {
      const name = typeof entryTitle === 'function' && entryTitle(current);
      return (
        <CollapsibleSection
          key={i}
          title={`${nameSingular} ${name || i + 1}`}
          actions={
            <Button
              compact
              glyph="delete"
              type="negative"
              onClick={() => remove(i)}
            />
          }
        >
          {itemRenderer(current, values, setValues)}
        </CollapsibleSection>
      );
    });

  const content =
    values.length === 1
      ? itemRenderer(values[0], values, setValues)
      : renderAllItems();

  return (
    <CollapsibleSection
      title={listTitle}
      actions={setOpen => (
        <Button
          glyph="add"
          compact
          onClick={() => {
            setValues([...values, newResourceTemplateFn()]);
            setOpen(true);
          }}
        >
          {t('common.buttons.add')} {nameSingular}
        </Button>
      )}
    >
      {content}
      {!values.length && (
        <MessageStrip type="warning">{atLeastOneRequiredMessage}</MessageStrip>
      )}
    </CollapsibleSection>
  );
}

export function Select({ value, setValue, defaultKey, options, ...props }) {
  return (
    <WrappedSelect
      compact
      onSelect={(_, selected) => setValue(selected.key)}
      selectedKey={value || defaultKey}
      options={options}
      fullWidth
      {...props}
    />
  );
}

export function ComboboxInput({
  value,
  setValue,
  defaultKey,
  options,
  id,
  placeholder,
  ...props
}) {
  return (
    <FdComboboxInput
      ariaLabel="Combobox input"
      arrowLabel="Combobox input arrow"
      id={id || 'combobox-input'}
      compact
      showAllEntries
      searchFullString
      selectionType="auto-inline"
      onSelectionChange={(_, selected) =>
        setValue(selected?.key !== -1 ? selected?.key : selected?.text)
      }
      selectedKey={defaultKey}
      placeholder={defaultKey || placeholder}
      options={options}
      {...props}
    />
  );
}
