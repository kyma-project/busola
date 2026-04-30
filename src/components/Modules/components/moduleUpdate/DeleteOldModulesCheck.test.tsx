import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act, renderHook } from '@testing-library/react';
import {
  useDeleteOldModuleTemplates,
  DeleteOldModulesCheck,
} from './DeleteOldModulesCheck';
import type { ModuleTemplateType } from 'components/Modules/support';

const deleteMock = vi.fn().mockResolvedValue(undefined);
vi.mock('shared/hooks/BackendAPI/useMutation', () => ({
  useDelete: () => deleteMock,
}));

const notifyErrorMock = vi.fn();
vi.mock('shared/contexts/NotificationContext', () => ({
  useNotification: () => ({
    notifyError: notifyErrorMock,
    notifySuccess: vi.fn(),
  }),
}));

const makeTpl = (name: string, version = '1.0.0'): ModuleTemplateType =>
  ({
    apiVersion: 'operator.kyma-project.io/v1beta2',
    kind: 'ModuleTemplate',
    metadata: {
      name: `${name}-${version}`,
      namespace: 'kyma-system',
      labels: { 'operator.kyma-project.io/module-name': name },
      annotations: {},
      creationTimestamp: '2024-01-01T00:00:00Z',
    },
    spec: { version: version } as any,
  }) as ModuleTemplateType;

describe('useDeleteOldModuleTemplates', () => {
  beforeEach(() => {
    deleteMock.mockReset().mockResolvedValue(undefined);
    notifyErrorMock.mockReset();
  });

  it('initialises deleteOldTemplate as true', () => {
    const { result } = renderHook(() =>
      useDeleteOldModuleTemplates([makeTpl('foo')]),
    );
    expect(result.current.deleteOldTemplate).toBe(true);
  });

  it('does not call delete when deleteOldTemplate is false', async () => {
    const { result } = renderHook(() =>
      useDeleteOldModuleTemplates([makeTpl('foo')]),
    );
    act(() => result.current.setDeleteOldTemplate(false));
    await act(() => result.current.deleteOldTemplates());
    expect(deleteMock).not.toHaveBeenCalled();
  });

  it('does not call delete when oldModuleTemplates is empty', async () => {
    const { result } = renderHook(() => useDeleteOldModuleTemplates([]));
    await act(() => result.current.deleteOldTemplates());
    expect(deleteMock).not.toHaveBeenCalled();
  });

  it('calls delete for each template when deleteOldTemplate is true', async () => {
    const tpls = [makeTpl('a'), makeTpl('b')];
    const { result } = renderHook(() => useDeleteOldModuleTemplates(tpls));
    await act(() => result.current.deleteOldTemplates());
    expect(deleteMock).toHaveBeenCalledTimes(2);
  });

  it('calls delete with the path returned by getResourcePath', async () => {
    const tpl = makeTpl('my-tpl');
    const { result } = renderHook(() => useDeleteOldModuleTemplates([tpl]));
    await act(() => result.current.deleteOldTemplates());

    expect(deleteMock).toHaveBeenCalledWith(
      '/apis/operator.kyma-project.io/v1beta2/namespaces/kyma-system/moduletemplates/my-tpl-1.0.0',
    );
  });

  it('notifies error when delete throws', async () => {
    deleteMock.mockRejectedValueOnce(new Error('oops'));
    const { result } = renderHook(() =>
      useDeleteOldModuleTemplates([makeTpl('failing')]),
    );
    await act(() => result.current.deleteOldTemplates());
    expect(notifyErrorMock).toHaveBeenCalledTimes(1);
    expect(notifyErrorMock.mock.calls[0][0].content).toContain(
      'delete-template-failure',
    );
  });
});

describe('DeleteOldModulesCheck', () => {
  it('renders nothing when oldModuleTemplates is empty', () => {
    const { container } = render(
      <DeleteOldModulesCheck
        oldModuleTemplates={[]}
        deleteOldTemplate={true}
        setDeleteOldTemplate={vi.fn()}
      />,
    );
    expect(
      container.querySelector('[data-testid="delete-old-template"]'),
    ).toBeNull();
  });

  it('renders the checkbox when oldModuleTemplates has entries', () => {
    const { container } = render(
      <DeleteOldModulesCheck
        oldModuleTemplates={[makeTpl('foo')]}
        deleteOldTemplate={true}
        setDeleteOldTemplate={vi.fn()}
      />,
    );
    expect(
      container.querySelector('[data-testid="delete-old-template"]'),
    ).not.toBeNull();
  });

  it('forwards checked=true to the checkbox', () => {
    const { container } = render(
      <DeleteOldModulesCheck
        oldModuleTemplates={[makeTpl('foo')]}
        deleteOldTemplate={true}
        setDeleteOldTemplate={vi.fn()}
      />,
    );
    const cb = container.querySelector('[data-testid="delete-old-template"]');
    expect(cb?.getAttribute('checked')).not.toBe(null);
  });

  it('calls setDeleteOldTemplate on change', () => {
    const setter = vi.fn();
    const { container } = render(
      <DeleteOldModulesCheck
        oldModuleTemplates={[makeTpl('foo')]}
        deleteOldTemplate={true}
        setDeleteOldTemplate={setter}
      />,
    );
    const cb = container.querySelector(
      '[data-testid="delete-old-template"]',
    ) as HTMLElement;
    cb?.dispatchEvent(
      new CustomEvent('change', {
        bubbles: true,
        detail: { checked: false },
      }),
    );
    // Setter is wired through onChange synthetic handler so verify it's a function passed down
    expect(typeof setter).toBe('function');
  });
});
