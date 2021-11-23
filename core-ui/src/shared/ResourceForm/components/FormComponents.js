import React, {
  useEffect,
  useRef,
  useState,
  createRef,
  useCallback,
} from 'react';
import {
  FormInput,
  FormLabel,
  FormTextarea,
  Button,
  Icon,
  MessageStrip,
} from 'fundamental-react';
import { Tooltip, K8sNameInput } from 'react-shared';
import classnames from 'classnames';
import { useTranslation } from 'react-i18next';

import { base64Decode, base64Encode, readFromFile } from 'shared/helpers';

import { ResourceFormWrapper } from '../ResourceForm';

import './FormComponents.scss';
import * as Inputs from './Inputs';

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
          <ResourceFormWrapper
            resource={resource}
            setResource={setResource}
            isAdvanced={isAdvanced}
          >
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
  return (
    <div className="title">
      {!disabled && canChangeState && (
        <Icon className="control-icon" ariaHidden glyph={iconGlyph} />
      )}
      <span className="title-content">{title}</span>
      {tooltipContent && (
        <Tooltip className="info-tooltip" delay={0} content={tooltipContent}>
          <Icon ariaLabel="Tooltip" glyph="question-mark" />
        </Tooltip>
      )}
    </div>
  );
}

export function Label({ required, tooltipContent, children }) {
  return (
    <>
      <FormLabel required={required}>{children}</FormLabel>
      {tooltipContent && (
        <Tooltip className="info-tooltip" delay={0} content={tooltipContent}>
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
  defaultValue,
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

export function K8sNameField({ kind, value, setValue, className, ...props }) {
  const { t, i18n } = useTranslation();

  const { isAdvanced, propertyPath, ...inputProps } = props;

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
            {...inputProps}
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
    <CollapsibleSection
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
            <Label required={required} tooltipContent={tooltipContent}>
              {title || label}
            </Label>
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
                  onBlur: () => updateValue(internalValue),
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
    </CollapsibleSection>
  );
}

export function TextArrayInput({
  defaultOpen,
  inputProps,
  sectionTooltipContent,
  placeholder,
  toInternal = value => value || [],
  toExternal = value => value.filter(val => !!val),
  readOnly,
  ...props
}) {
  return (
    <MultiInput
      defaultOpen={defaultOpen}
      toInternal={toInternal}
      toExternal={toExternal}
      sectionTooltipContent={sectionTooltipContent}
      readOnly={readOnly}
      inputs={[
        ({ value, setValue, ref, onBlur, focus, index }) => (
          <FormInput
            placeholder={Math.abs(index) === 1 ? placeholder : ''}
            key={index}
            compact
            value={value || ''}
            ref={ref}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => focus(e)}
            onBlur={onBlur}
            readOnly={readOnly}
            {...inputProps}
          />
        ),
      ]}
      {...props}
    />
  );
}

export function KeyValueField({
  actions = [],
  encodable = false,
  defaultOpen,
  isAdvanced,
  input = Inputs.Text,
  keyProps = {
    pattern: '([A-Za-z0-9][-A-Za-z0-9_./]*)?[A-Za-z0-9]',
  },
  readableFromFile = false,
  lockedKeys = [],
  ...props
}) {
  const { t } = useTranslation();

  const [valuesEncoded, setValuesEncoded] = useState(false);
  const [decodeErrors, setDecodeErrors] = useState({});

  const toggleEncoding = () => {
    setDecodeErrors({});
    setValuesEncoded(!valuesEncoded);
  };

  const dataValue = value => {
    if (!encodable || valuesEncoded) {
      return value?.val || '';
    } else {
      try {
        return base64Decode(value?.val || '');
      } catch (e) {
        decodeErrors[value?.key] = e.message;
        setDecodeErrors({ ...decodeErrors });
        setValuesEncoded(true);
        return '';
      }
    }
  };

  if (encodable) {
    actions = [
      ...actions,
      <Button
        compact
        option="transparent"
        glyph={valuesEncoded ? 'show' : 'hide'}
        onClick={toggleEncoding}
      >
        {valuesEncoded
          ? t('secrets.buttons.decode')
          : t('secrets.buttons.encode')}
      </Button>,
    ];
  }

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
            disabled={lockedKeys.includes(value?.key)}
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
        ({ focus, value, setValue, ...props }) =>
          input({
            key: 'value',
            onKeyDown: e => focus(e),
            value: dataValue(value),
            placeholder: t('components.key-value-field.enter-value'),
            setValue: val =>
              setValue({
                ...value,
                val: valuesEncoded || !encodable ? val : base64Encode(val),
              }),
            validationState:
              value?.key && decodeErrors[value.key]
                ? {
                    state: 'error',
                    text: t('secrets.messages.decode-error', {
                      message: decodeErrors[value.key],
                    }),
                  }
                : undefined,
            ...props,
          }),
        ({ value, setValue }) =>
          readableFromFile ? (
            <Tooltip content={t('common.tooltips.read-file')}>
              <Button
                compact
                className="read-from-file"
                onClick={() =>
                  readFromFile().then(result =>
                    setValue({
                      key: value?.key || result.name,
                      val: base64Encode(result.content),
                    }),
                  )
                }
              >
                {t('components.key-value-form.read-value')}
              </Button>
            </Tooltip>
          ) : null,
      ]}
      actions={actions}
      tooltipContent={t('common.tooltips.key-value')}
      {...props}
    />
  );
}

export function DataField({ title, ...props }) {
  const { t } = useTranslation();

  return (
    <KeyValueField
      fullWidth
      readableFromFile
      className="resource-form__data-field"
      title={title || t('common.labels.data')}
      input={({ value, setValue, ...props }) => (
        <FormTextarea
          compact
          key="value"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder={t('components.key-value-field.enter-value')}
          className="value-textarea"
          {...props}
        />
      )}
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
  allowEmpty = false,
  itemRenderer,
  newResourceTemplateFn,
  simple,
  advanced,
  isAdvanced,
  readOnly,
  ...props
}) {
  const { t } = useTranslation();

  values = values || [];

  const remove = index => setValues(values.filter((_, i) => index !== i));

  const renderItem = (item, index) =>
    itemRenderer({ item, values, setValues, index, isAdvanced });

  const renderAllItems = () =>
    values.map((current, i) => {
      const name = typeof entryTitle === 'function' && entryTitle(current, i);
      return (
        <CollapsibleSection
          key={i}
          title={
            <>
              {nameSingular} {name || i + 1}
            </>
          }
          actions={
            <Button
              compact
              glyph="delete"
              type="negative"
              onClick={() => remove(i)}
              disabled={readOnly}
            />
          }
        >
          {renderItem(current, i)}
        </CollapsibleSection>
      );
    });

  const content =
    values.length === 1 && !allowEmpty
      ? renderItem(values[0], 0)
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
          disabled={readOnly}
        >
          {t('common.buttons.add')} {nameSingular}
        </Button>
      )}
      isAdvanced={isAdvanced}
      {...props}
    >
      {content}
      {atLeastOneRequiredMessage && !values.length && (
        <MessageStrip type="warning">{atLeastOneRequiredMessage}</MessageStrip>
      )}
    </CollapsibleSection>
  );
}

export function ComboboxArrayInput({
  title,
  defaultOpen,
  placeholder,
  inputProps,
  isAdvanced,
  tooltipContent,
  sectionTooltipContent,
  options,
  emptyStringKey,
  ...props
}) {
  const { t } = useTranslation();

  placeholder =
    placeholder || t('common.messages.type-to-select', { value: title });

  /*
    as original Combobox (and React's 'input' element) doesn't like '' for a key,
    we replace it with 'emptyStringKey' internal MultiInput state

    {key: '', text: 'empty'} -> {key: emptyStringKey, text: 'empty'}
  */
  const toInternal = values =>
    (values || [])
      .filter(v => v || (emptyStringKey && v === ''))
      .map(v => (emptyStringKey && v === '' ? emptyStringKey : v));

  const toExternal = values =>
    values
      .filter(val => !!val)
      .map(v => (emptyStringKey && v === emptyStringKey ? '' : v));

  return (
    <MultiInput
      title={title}
      defaultOpen={defaultOpen}
      isAdvanced={isAdvanced}
      toInternal={toInternal}
      toExternal={toExternal}
      tooltipContent={tooltipContent}
      sectionTooltipContent={sectionTooltipContent}
      inputs={[
        ({ value, setValue, ref, onBlur, focus, index }) => (
          <Inputs.ComboboxInput
            key={index}
            placeholder={placeholder}
            compact
            _ref={ref}
            selectedKey={value}
            typedValue={value || ''}
            selectionType="manual"
            setValue={setValue}
            options={options}
            onKeyDown={focus}
            onBlur={onBlur}
          />
        ),
      ]}
      {...props}
    />
  );
}

export function SelectArrayInput({
  title,
  defaultOpen,
  placeholder,
  inputProps,
  isAdvanced,
  tooltipContent,
  sectionTooltipContent,
  options,
  ...props
}) {
  const toInternal = values => (values || []).filter(v => v);

  const toExternal = values => values.filter(val => !!val);

  return (
    <MultiInput
      title={title}
      defaultOpen={defaultOpen}
      isAdvanced={isAdvanced}
      toInternal={toInternal}
      toExternal={toExternal}
      tooltipContent={tooltipContent}
      sectionTooltipContent={sectionTooltipContent}
      inputs={[
        ({ value, setValue, ref, onBlur, focus, index }) => (
          <Inputs.Dropdown
            key={index}
            placeholder={placeholder}
            compact
            _ref={ref}
            value={value}
            setValue={setValue}
            options={options}
            onKeyDown={focus}
            onBlur={onBlur}
            className="fd-margin-end--sm"
          />
        ),
      ]}
      {...props}
    />
  );
}
