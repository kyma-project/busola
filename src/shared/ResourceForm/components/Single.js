import { useEffect, useRef } from 'react';
import classnames from 'classnames';

import { ResourceFormWrapper } from './Wrapper';
import { excludeStatus } from './ResourceForm';
import { useRecoilState } from 'recoil';
import { isResourceEditedState } from 'state/resourceEditedAtom';
import { isFormOpenState } from 'state/formOpenAtom';
import { createPortal } from 'react-dom';
import { UnsavedMessageBox } from 'shared/components/UnsavedMessageBox/UnsavedMessageBox';

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
  const [isResourceEdited, setIsResourceEdited] = useRecoilState(
    isResourceEditedState,
  );
  const [isFormOpen, setIsFormOpen] = useRecoilState(isFormOpenState);
  const { leavingForm } = isFormOpen;

  useEffect(() => {
    if (setCustomValid) {
      setCustomValid(validationRef.current);
    }
    validationRef.current = true;
  }, [resource, children, setCustomValid]);

  useEffect(() => {
    if (initialResource && leavingForm) {
      if (
        JSON.stringify(excludeStatus(resource)) !==
        JSON.stringify(excludeStatus(initialResource))
      ) {
        setIsResourceEdited({ ...isResourceEdited, isEdited: true });
      }

      if (
        JSON.stringify(excludeStatus(resource)) ===
        JSON.stringify(excludeStatus(initialResource))
      ) {
        setIsResourceEdited({ isEdited: false });
        setIsFormOpen({ formOpen: false });
        if (isResourceEdited.discardAction) isResourceEdited.discardAction();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leavingForm]);

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
