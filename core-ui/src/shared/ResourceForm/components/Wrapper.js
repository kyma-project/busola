import React, { useEffect } from 'react';
import * as jp from 'jsonpath';

export function ResourceFormWrapper({
  resource,
  setResource,
  children,
  isAdvanced,
  setCustomValid,
  validationRef,
  ...props
}) {
  useEffect(() => {
    if (validationRef) {
      const valid = React.Children.toArray(children)
        .filter(child => child.props.validate)
        .every(child => {
          if (child.props.propertyPath) {
            const value = jp.value(resource, child.props.propertyPath);
            return child.props.validate(value);
          } else {
            return child.props.validate(resource);
          }
        });
      validationRef.current = validationRef.current && valid;
    }
  }, [resource, children, validationRef]);

  if (!resource) {
    return children;
  }

  return (
    React.Children.map(children, child => {
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
            {child.props.children || 12}
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

        return React.cloneElement(child, { isAdvanced, value, setValue });
      }
    }) || null
  );
}
