import React from 'react';
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
          formElementRef={formElementRef}
          setCustomValid={setCustomValid}
        >
          {children}
        </ResourceFormWrapper>
      </form>
    </section>
  );
}
