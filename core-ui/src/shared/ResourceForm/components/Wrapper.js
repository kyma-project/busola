import React, { useState, useEffect, createRef } from 'react';
import * as jp from 'jsonpath';
import { useTranslation } from 'react-i18next';

export function ResourceFormWrapper({
  resource,
  setResource,
  children,
  isAdvanced,
  setCustomValid,
  validationRef,
  ...props
}) {
  const { t } = useTranslation();
  const [inputRefs, setInputRefs] = useState([]);

  useEffect(() => {
    setInputRefs(
      React.Children.map(
        children,
        (child, i) => inputRefs[i] || createRef(null),
      ),
    );
  }, [children]); // eslint-disable-line react-hooks/exhaustive-deps

  const isValid = child => {
    if (!child.props.validate) {
      return true;
    } else if (child.props.propertyPath) {
      const value = jp.value(resource, child.props.propertyPath);
      return child.props.validate(value);
    } else {
      return child.props.validate(resource);
    }
  };

  const errorMessage = child => {
    if (!child.props.validateMessage) {
      return t('common.error.generic');
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
    React.Children.toArray(children).forEach((child, index) => {
      const inputRef = inputRefs[index];
      if (child.props.validate) {
        const valid = isValid(child);
        if (inputRef?.current) {
          if (!valid) {
            inputRef.current.setCustomValidity(errorMessage(child));
          } else {
            inputRef.current.setCustomValidity('');
          }
        } else if (validationRef) {
          validationRef.current = validationRef.current && valid;
        }
      }
    });
  }, [resource, children]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!resource) {
    return children;
  }

  return (
    React.Children.map(children, (child, index) => {
      if (!child) {
        return null;
      } else if (child.type === React.Fragment) {
        return (
          <ResourceFormWrapper
            resource={resource}
            setResource={setResource}
            isAdvanced={isAdvanced}
            validationRef={validationRef}
          >
            {child.props.children}
          </ResourceFormWrapper>
        );
      } else if (child.props.simple && isAdvanced) {
        return null;
      } else if (child.props.advanced && !isAdvanced) {
        return null;
      } else if (!child.props.propertyPath) {
        if (typeof child.type === 'function') {
          return React.cloneElement(child, {
            resource: child.props.resource || resource,
            setResource: child.props.setResource || setResource,
            validationRef,
            isAdvanced,
            inputRef: inputRefs[index],
            ...props,
          });
        } else {
          return child;
        }
      } else {
        const valueSetter = value => {
          jp.value(resource, child.props.propertyPath, value);
          setResource({ ...resource });
        };

        const value =
          typeof child.props.value !== 'undefined'
            ? child.props.value
            : jp.value(resource, child.props.propertyPath) ??
              child.props.defaultValue;

        const setValue = child.props.setValue
          ? value => child.props.setValue(value, valueSetter)
          : valueSetter;

        return React.cloneElement(child, {
          isAdvanced,
          value,
          setValue,
          inputRef: inputRefs[index],
        });
      }
    }) || null
  );
}
