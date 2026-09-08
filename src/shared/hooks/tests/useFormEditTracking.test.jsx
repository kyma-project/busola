import { renderHook } from '@testing-library/react';
import { Provider, useAtomValue } from 'jotai';
import { JotaiHydrator } from 'testing/reactTestingUtils';
import { isFormOpenAtom } from 'state/formOpenAtom';
import { isResourceEditedAtom } from 'state/resourceEditedAtom';
import { useFormEditTracking } from '../useFormEditTracking';

function makeWrapper(formOpen = true) {
  return ({ children }) => (
    <Provider>
      <JotaiHydrator
        initialValues={[[isFormOpenAtom, { formOpen, leavingForm: false }]]}
      >
        {children}
      </JotaiHydrator>
    </Provider>
  );
}

function renderTracking({
  resource,
  initialResource,
  editorError = false,
  formOpen = true,
} = {}) {
  return renderHook(
    () => {
      useFormEditTracking(resource, initialResource, editorError);
      return useAtomValue(isResourceEditedAtom);
    },
    { wrapper: makeWrapper(formOpen) },
  );
}

const base = {
  kind: 'ConfigMap',
  metadata: { name: 'cm' },
  data: { a: '1' },
};

describe('useFormEditTracking', () => {
  it('marks the resource as edited when it differs from the initial one', () => {
    const { result } = renderTracking({
      resource: { ...base, data: { a: '2' } },
      initialResource: base,
    });

    expect(result.current.isEdited).toBe(true);
  });

  it('ignores status, resourceVersion, managedFields and generation when diffing', () => {
    const { result } = renderTracking({
      resource: {
        ...base,
        status: { phase: 'Running' },
        metadata: {
          name: 'cm',
          resourceVersion: '999',
          managedFields: [{ manager: 'kubectl' }],
          generation: 5,
        },
      },
      initialResource: {
        ...base,
        metadata: { name: 'cm', resourceVersion: '1' },
      },
    });

    expect(result.current.isEdited).toBe(false);
  });

  it('treats an editor error as an edit even if the resources match', () => {
    const { result } = renderTracking({
      resource: base,
      initialResource: base,
      editorError: true,
    });

    expect(result.current.isEdited).toBe(true);
  });

  it('does not mark as edited while the form is closed', () => {
    const { result } = renderTracking({
      resource: { ...base, data: { a: '2' } },
      initialResource: base,
      formOpen: false,
    });

    expect(result.current.isEdited).toBe(false);
  });

  it('is not edited when either resource is missing', () => {
    const { result } = renderTracking({
      resource: null,
      initialResource: base,
    });

    expect(result.current.isEdited).toBe(false);
  });
});
