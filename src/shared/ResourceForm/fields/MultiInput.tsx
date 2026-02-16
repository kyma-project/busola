import {
  useEffect,
  useRef,
  useState,
  createRef,
  Dispatch,
  SetStateAction,
} from 'react';
import { Button, FlexBox } from '@ui5/webcomponents-react';
import classnames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Label } from '../components/Label';

import { ResourceForm } from '..';
import { useCreateResourceDescription } from 'components/Extensibility/helpers';

import './MultiInput.scss';

type MultiInputProps = {
  value?: any;
  setValue?: (val: any) => void;
  title?: string;
  tooltipContent?: React.ReactNode;
  sectionTooltipContent?: React.ReactNode;
  required?: boolean;
  toInternal: (val: any) => any;
  toExternal: (val: any) => any;
  inputs: ((props: {
    index: number;
    value: any;
    setValue: (val: any) => void;
    ref?: React.RefObject<HTMLInputElement>;
    updateValue: () => void;
    internalValue: any[];
    setMultiValue: (val: any) => void;
    focus: (e: React.KeyboardEvent, target?: number) => void;
  }) => JSX.Element)[];
  className?: string;
  defaultOpen?: boolean;
  isEntryLocked?: (entry: any) => boolean;
  readOnly?: boolean;
  noEdit?: boolean;
  newItemAction?: JSX.Element;
  newItemActionWidth?: number;
  inputInfo?: string | JSX.Element;
  disableOnEdit?: boolean;
  editMode?: boolean;
  disabled?: boolean;
  canChangeState?: boolean;
  defaultTitleType?: boolean;
  actions?:
    | React.ReactNode[]
    | JSX.Element
    | ((setOpen: Dispatch<SetStateAction<boolean | undefined>>) => JSX.Element);
  resource?: Record<string, any> | string;
  setResource?: (resource: Record<string, any> | string) => void;
  nestingLevel?: number;
};

export function MultiInput({
  value,
  setValue = () => {},
  title,
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
  disabled,
  canChangeState,
  defaultTitleType,
  actions,
  resource,
  setResource,
  nestingLevel,
}: MultiInputProps) {
  const { t } = useTranslation();
  const valueRef = useRef(null); // for deep comparison
  const [internalValue, setInternalValue] = useState<any[]>([]);
  const [keys, setKeys] = useState(1);
  const [refs, setRefs] = useState<any[]>([]);
  const inputInfoLink = useCreateResourceDescription(inputInfo);

  useEffect(() => {
    setRefs(
      new Array(internalValue.length)
        .fill(undefined)
        .map((_, index) =>
          inputs.map(
            (_, inputIndex) => refs[index]?.[inputIndex] || createRef(),
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

  const isLast = (index: number) => index === internalValue.length - 1;

  const updateValue = (val: any[]) => {
    setValue(toExternal(val));
  };

  const removeValue = (index: number) => {
    /* 
      Removing one of the inputs decreases the next inputs keys by one, so the last input has the previous input value instead of being empty.
      We force rerender by changing keys.
    */
    setKeys(keys * -1);
    internalValue.splice(index, 1);
    updateValue(internalValue);
  };

  const setEntry = (newVal: any, index: number) => {
    // eslint-disable-next-line react-hooks/immutability
    internalValue[index] = newVal;
    setInternalValue([...internalValue]);
  };

  const focus = (ref?: React.RefObject<HTMLInputElement>) => {
    if (ref?.current?.focus) {
      ref.current.focus();
    }
  };
  const open = defaultOpen ?? false;

  const inputComponents = internalValue.map((entry, index) =>
    inputs.map((input, inputIndex) =>
      input({
        index: (index + 1) * keys,
        value: entry,
        setValue: (entry) => setEntry(entry, index),
        ref: refs[index]?.[inputIndex],
        updateValue: () => updateValue(internalValue),
        internalValue,
        setMultiValue: setValue,
        focus: (e, target) => handleFocusMove(e, target, index),
      }),
    ),
  );

  useEffect(() => {
    internalValue.forEach((entry, index) => {
      const isValid = (child: JSX.Element) =>
        child.props.validate(entry) ?? true;
      const errorMessage = (child: JSX.Element) => {
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

  const handleFocusMove = (
    e: React.KeyboardEvent,
    target: number | undefined,
    index: number,
  ) => {
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
  };

  return (
    <ResourceForm.CollapsibleSection
      title={title ?? ''}
      className={className}
      required={required}
      defaultOpen={open}
      tooltipContent={sectionTooltipContent || tooltipContent}
      disabled={disabled}
      canChangeState={canChangeState}
      defaultTitleType={defaultTitleType}
      actions={actions}
      resource={resource}
      setResource={setResource}
      nestingLevel={nestingLevel}
    >
      <ul className="full-width form-field multi-input">
        {internalValue.map((entry, index) => {
          const fieldWidth =
            isLast(index) && newItemAction
              ? `bsl-col-md--${12 - newItemActionWidth}`
              : 'bsl-col-md--11';

          return (
            <li key={index} className="sap-margin-bottom-tiny">
              <FlexBox style={{ gap: '10px' }} alignItems="Center">
                {noEdit && !isLast(index) && (
                  <span className="readonly-value">{entry}</span>
                )}

                {(!noEdit || isLast(index)) && (
                  <FlexBox
                    style={{ gap: '10px' }}
                    alignItems="Center"
                    className={fieldWidth}
                  >
                    {inputs.map(
                      (input, inputIndex) => inputComponents[index][inputIndex],
                    )}
                  </FlexBox>
                )}

                {!isLast(index) && (
                  <Button
                    disabled={readOnly || (disableOnEdit && editMode)}
                    className={classnames({
                      hidden: isEntryLocked(entry),
                    })}
                    icon="delete"
                    design="Transparent"
                    onClick={() => removeValue(index)}
                    accessibleName={t('common.buttons.delete')}
                  />
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
    </ResourceForm.CollapsibleSection>
  );
}
