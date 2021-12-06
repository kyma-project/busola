import React, { useEffect, useRef } from 'react';
import classnames from 'classnames';

import { ResourceFormWrapper } from './Wrapper';

export function SingleForm({
  formElementRef,
  createResource,
  children,
  resource,
  setResource,
  onValid,
  className,
  setCustomValid,
  ...props
}) {
  const validationRef = useRef(true);

  useEffect(() => {
    if (setCustomValid) {
      setCustomValid(validationRef.current);
    }
    validationRef.current = true;
  }, [resource, children, setCustomValid]);

  return (
    <section className={classnames('resource-form', className)}>
      <form
        ref={formElementRef}
        onSubmit={createResource}
        onChange={() => {
          if (onValid) {
            setTimeout(() => {
              onValid(formElementRef.current?.checkValidity());
            });
          }
        }}
        {...props}
      >
        <ResourceFormWrapper
          resource={resource}
          setResource={setResource}
          validationRef={validationRef}
        >
          {children}
        </ResourceFormWrapper>
      </form>
    </section>
  );
}
