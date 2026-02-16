import {
  Children,
  Fragment,
  cloneElement,
  useState,
  useEffect,
  createRef,
} from 'react';
import jp from 'jsonpath';
import { useTranslation } from 'react-i18next';

export type ResourceFormWrapperProps = {
  resource?: Record<string, any> | string;
  setResource?: (resource: Record<string, any> | string) => void;
  children: React.ReactNode;
  validationRef?: React.MutableRefObject<boolean>;
  nestingLevel?: number;
  required?: boolean;
} & Record<string, any>;

export function ResourceFormWrapper({
  resource,
  setResource,
  children,
  validationRef,
  ...props
}: ResourceFormWrapperProps) {
  const { t } = useTranslation();
  const [inputRefs, setInputRefs] = useState<
    React.RefObject<HTMLInputElement>[] | null | undefined
  >([]);

  useEffect(() => {
    setInputRefs(
      Children.map(children, (_, i) => inputRefs?.[i] || createRef()),
    );
  }, [children]); // eslint-disable-line react-hooks/exhaustive-deps

  const isValid = (child: React.ReactElement) => {
    if (!child.props.validate) {
      return true;
    } else if (child.props.propertyPath) {
      const value = jp.value(resource, child.props.propertyPath);
      return child.props.validate(value);
    } else {
      return child.props.validate(resource);
    }
  };

  const errorMessage = (child: React.ReactElement) => {
    if (!child.props.validateMessage) {
      return t('common.errors.generic');
    } else if (typeof child.props.validateMessage !== 'function') {
      return child.props.validateMessage;
    } else if (child.props.propertyPath) {
      const value = jp.value(resource, child.props.propertyPath);
      return child.props.validateMessage(value);
    } else {
      return child.props.validateMessage(resource);
    }
  };

  useEffect(() => {
    Children.toArray(children).forEach((child, index) => {
      const inputRef = inputRefs?.[index];

      if ((child as React.ReactElement).props?.validate) {
        const valid = isValid(child as React.ReactElement);

        if (inputRef?.current) {
          const input =
            inputRef.current?.shadowRoot?.querySelector('.ui5-input-inner');
          if (!valid) {
            (input as any)?.setCustomValidity(
              errorMessage(child as React.ReactElement),
            );
          } else {
            (input as any)?.setCustomValidity('');
          }
        } else if (validationRef) {
          validationRef.current = validationRef.current && valid;
        }
      }
    });
  }, [resource, children, inputRefs]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!resource) {
    return children;
  }

  const renderWrapper = (child: any, index: number) => {
    if (!child) {
      return null;
    } else if (child.type === Fragment) {
      return (
        <ResourceFormWrapper
          resource={resource}
          setResource={setResource}
          validationRef={validationRef}
        >
          {child.props.children}
        </ResourceFormWrapper>
      );
    } else if (!child.props?.propertyPath) {
      if (typeof child.type === 'function') {
        return cloneElement(child, {
          resource: child.props.resource || resource,
          setResource: child.props.setResource || setResource,
          validationRef,
          inputRef: inputRefs?.[index],
          ...props,
        });
      } else {
        return child;
      }
    } else {
      const valueSetter = (value: any) => {
        jp.value(resource, child.props.propertyPath, value);
        setResource?.({ ...(resource as any) });
      };

      const value =
        typeof child.props.value !== 'undefined'
          ? child.props.value
          : (jp.value(resource, child.props.propertyPath) ??
            child.props.defaultValue);

      const setValue = child.props.setValue
        ? (value: any) => child.props.setValue(value, valueSetter)
        : valueSetter;

      return cloneElement(child, {
        value,
        setValue,
        inputRef: inputRefs?.[index],
      });
    }
  };

  // eslint-disable-next-line react-hooks/refs
  return Children.map(children, renderWrapper) || null;
}
