import { useEffect, useRef } from 'react';
import classnames from 'classnames';

import { ResourceFormWrapper } from './Wrapper';
import { createPortal } from 'react-dom';
import { UnsavedMessageBox } from 'shared/components/UnsavedMessageBox/UnsavedMessageBox';
import { useFormEditTracking } from 'shared/hooks/useFormEditTracking';

export function SingleForm({
  formElementRef,
  createResource,
  children,
  resource,
  setResource,
  className,
  setCustomValid,
  initialResource,
  ...props
}) {
  const validationRef = useRef(true);

  useEffect(() => {
    if (setCustomValid) {
      setCustomValid(validationRef.current);
    }
    validationRef.current = true;
  }, [resource, children, setCustomValid]);

  useFormEditTracking(resource, initialResource);

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
      {createPortal(<UnsavedMessageBox />, document.body)}
    </section>
  );
}
