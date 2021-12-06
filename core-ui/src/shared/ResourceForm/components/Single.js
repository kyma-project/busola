import React, { useEffect, useRef } from 'react';
import classnames from 'classnames';

import { ResourceFormWrapper } from './Wrapper';

export function SingleForm({
  formElementRef,
  createResource,
  children,
  resource,
  setResource,
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
      <form ref={formElementRef} onSubmit={createResource} {...props}>
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
