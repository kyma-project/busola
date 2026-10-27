import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderFinished } from '@ui5/webcomponents-base';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from 'testing/reactTestingUtils';

import { NotificationContext } from 'shared/contexts/NotificationContext';
import BusolaExtensionCreate from './BusolaExtensionCreate';

const { crd, upsert } = vi.hoisted(() => ({
  crd: {
    metadata: { name: 'potatoes.busola.example.com' },
    spec: {
      group: 'busola.example.com',
      names: { kind: 'Potato', plural: 'potatoes' },
      scope: 'Cluster',
      versions: [{ name: 'v1', storage: true }],
    },
  },
  upsert: vi.fn(),
}));

vi.mock('shared/hooks/BackendAPI/useUpsert', () => ({
  useUpsert: () => upsert,
}));

vi.mock('shared/hooks/BackendAPI/useGet', async (importOriginal) => ({
  ...(await importOriginal<typeof import('shared/hooks/BackendAPI/useGet')>()),
  useGetList: () => () => ({ data: [crd], loading: false, error: null }),
}));

const notifyError = vi.fn();

function renderCreate() {
  const formElementRef = createRef<HTMLFormElement>();
  const { container } = render(
    <NotificationContext.Provider
      value={{ isOpen: false, notifySuccess: vi.fn(), notifyError }}
    >
      <BusolaExtensionCreate
        formElementRef={formElementRef}
        onChange={vi.fn()}
        setCustomValid={vi.fn()}
        layoutNumber="startColumn"
      />
    </NotificationContext.Provider>,
  );
  const combobox = container.querySelector(
    'ui5-combobox#combobox-input',
  ) as HTMLElement & { value: string };

  const selectCrd = async () => {
    combobox.value = crd.metadata.name;
    fireEvent(combobox, new Event('change'));
    await waitFor(() =>
      expect(container.querySelector('ui5-input')).not.toBe(null),
    );
  };
  const submit = () => fireEvent.submit(formElementRef.current!);

  return { container, combobox, selectCrd, submit };
}

describe('BusolaExtensionCreate', () => {
  afterEach(async () => {
    // let UI5 finish rendering its popups before the test ends
    await act(async () => {
      await renderFinished();
      await renderFinished();
    });
  });

  it('sends the same ConfigMap when a failed create is retried', async () => {
    const { selectCrd, submit } = renderCreate();
    await selectCrd();

    upsert.mockImplementationOnce(({ onError }) => onError(new Error()));
    submit();
    submit();

    const [[first], [retried]] = upsert.mock.calls;
    expect(first.resource.metadata.name).toBe(crd.metadata.name);
    expect(retried.resource).toEqual(first.resource);
  });

  it('clears the form on revert', async () => {
    const { container, combobox, selectCrd } = renderCreate();
    await selectCrd();

    // the panel renders its header buttons twice; the last one is visible
    fireEvent.click(screen.getAllByText('common.buttons.revert').at(-1)!);

    await waitFor(() =>
      expect(container.querySelector('ui5-input')).toBe(null),
    );
    expect(combobox.value).toBe('');
  });

  it('does not create an extension without a selected CRD', () => {
    const { submit } = renderCreate();

    submit();

    expect(upsert).not.toHaveBeenCalled();
    expect(notifyError).toHaveBeenCalled();
  });
});
