import React from 'react';
import LuigiClient from '@luigi-project/client';
import { render, fireEvent } from '@testing-library/react';
import NamespaceSettings from '../NamespaceSettings';

let mockGroups = [];
jest.mock('shared/contexts/MicrofrontendContext', () => ({
  useMicrofrontendContext: () => ({
    groups: mockGroups,
  }),
  useFeatureToggle: () => [true, () => null],
}));

describe('NamespaceSettings', () => {
  it('Renders nothing if groups are an array missing runtimeAdmin', () => {
    const { queryByText } = render(<NamespaceSettings />);
    expect(queryByText('Namespace Settings')).not.toBeInTheDocument();
  });

  it.skip('Sends custom message on toggle', () => {
    //aria-label can no more be passed to the input element. Thank you fundamental.
    mockGroups = null;
    const spy = jest.spyOn(LuigiClient, 'sendCustomMessage');
    const { getByLabelText } = render(<NamespaceSettings />);

    fireEvent.click(getByLabelText('toggle-hidden-namespaces'));

    expect(spy).toHaveBeenCalledWith({
      id: 'busola.showHiddenNamespaces',
      showHiddenNamespaces: false,
    });

    spy.mockRestore();
  });
});
