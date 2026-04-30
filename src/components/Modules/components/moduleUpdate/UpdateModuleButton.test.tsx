import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('react-i18next', async () => {
  const actual: any = await vi.importActual('react-i18next');
  return {
    ...actual,
    Trans: ({ i18nKey, values }: any) => `${i18nKey}:${JSON.stringify(values)}`,
  };
});

const notifySuccessMock = vi.fn();
const notifyErrorMock = vi.fn();
vi.mock('shared/contexts/NotificationContext', () => ({
  useNotification: () => ({
    notifySuccess: notifySuccessMock,
    notifyError: notifyErrorMock,
  }),
}));

vi.mock('jotai', async () => {
  const actual: any = await vi.importActual('jotai');
  return { ...actual, useAtomValue: () => [] };
});

const uploadResourcesMock = vi.fn();
vi.mock('resources/Namespaces/YamlUpload/useUploadResources', () => ({
  useUploadResources: () => uploadResourcesMock,
}));

vi.mock('../../community/communityModulesHelpers', () => ({
  fetchResourcesToApply: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('./DeleteOldModulesCheck', async () => {
  const { useState } = await import('react');
  return {
    useDeleteOldModuleTemplates: (_tpls: any[]) => {
      const [del, setDel] = useState(true);
      return {
        deleteOldTemplate: del,
        setDeleteOldTemplate: setDel,
        deleteOldTemplates: vi.fn().mockResolvedValue(undefined),
      };
    },
    DeleteOldModulesCheck: ({ oldModuleTemplates }: any) =>
      oldModuleTemplates.length > 0 ? (
        <div data-testid="delete-old-check" />
      ) : null,
  };
});

import { UpdateModuleButton } from './UpdateModuleButton';
import type { ModuleTemplateType } from 'components/Modules/support';

const makeTpl = (name: string, version = '2.0.0'): ModuleTemplateType =>
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
    spec: { version } as any,
  }) as ModuleTemplateType;

const defaultProps = {
  moduleName: 'busola',
  currentVersion: '1.0.0',
  newVersion: '2.0.0',
  moduleTpl: makeTpl('busola'),
};

describe('UpdateModuleButton', () => {
  beforeEach(() => {
    notifySuccessMock.mockReset();
    notifyErrorMock.mockReset();
    uploadResourcesMock.mockReset();
  });

  it('renders the Update button', () => {
    render(<UpdateModuleButton {...defaultProps} />);
    expect(screen.getByText('kyma-modules.update')).toBeInTheDocument();
  });

  it('does not show the dialog initially', () => {
    render(<UpdateModuleButton {...defaultProps} />);
    expect(screen.queryByText('modules.community.update.title')).toBeNull();
  });

  it('opens the confirmation dialog when the button is clicked', () => {
    render(<UpdateModuleButton {...defaultProps} />);
    fireEvent.click(screen.getByText('kyma-modules.update'));
    expect(
      screen.getByText('modules.community.update.title'),
    ).toBeInTheDocument();
  });

  it('shows current and new version in the dialog', () => {
    render(<UpdateModuleButton {...defaultProps} />);
    fireEvent.click(screen.getByText('kyma-modules.update'));
    expect(screen.getByText('1.0.0')).toBeInTheDocument();
    expect(screen.getByText('2.0.0')).toBeInTheDocument();
  });

  it('closes the dialog when Cancel is clicked', () => {
    render(<UpdateModuleButton {...defaultProps} />);
    fireEvent.click(screen.getByText('kyma-modules.update'));
    fireEvent.click(screen.getByText('common.buttons.cancel'));
    expect(screen.queryByText('modules.community.update.title')).toBeNull();
  });

  it('does not render DeleteOldModulesCheck when no old templates are provided', () => {
    render(<UpdateModuleButton {...defaultProps} />);
    fireEvent.click(screen.getByText('kyma-modules.update'));
    expect(screen.queryByTestId('delete-old-check')).toBeNull();
  });

  it('renders DeleteOldModulesCheck when old templates are provided', () => {
    render(
      <UpdateModuleButton
        {...defaultProps}
        oldModuleTemplates={[makeTpl('busola', '1.0.0')]}
      />,
    );
    fireEvent.click(screen.getByText('kyma-modules.update'));
    expect(screen.getByTestId('delete-old-check')).toBeInTheDocument();
  });

  it('notifies update-started and closes dialog on confirm', async () => {
    render(<UpdateModuleButton {...defaultProps} />);
    fireEvent.click(screen.getByText('kyma-modules.update'));

    // click the Update action inside the dialog (second "kyma-modules.update" text)
    const buttons = screen.getAllByText('kyma-modules.update');
    fireEvent.click(buttons[buttons.length - 1]);

    expect(notifySuccessMock).toHaveBeenCalledWith(
      expect.objectContaining({
        content: 'modules.community.messages.module-update-started',
      }),
    );
    expect(screen.queryByText('modules.community.update.title')).toBeNull();
  });
});
