import LuigiClient from '@luigi-project/client';
import { showHiddenNamespacesState } from 'state/preferences/showHiddenNamespacesAtom';
import { render, fireEvent } from 'testing/reactTestingUtils';
import NamespaceSettings from '../NamespaceSettings';

describe('NamespaceSettings', () => {
  it('Sends custom message on toggle', () => {
    const spy = jest.spyOn(LuigiClient, 'sendCustomMessage');
    const { getByLabelText } = render(<NamespaceSettings />, {
      initializeState: snapshot =>
        snapshot.set(showHiddenNamespacesState, true),
    });

    const toggleElement = getByLabelText(
      'settings.clusters.showHiddenNamespaces',
    );

    expect(toggleElement).toBeChecked();
    fireEvent.click(toggleElement);

    expect(spy).toHaveBeenCalledWith({
      id: 'busola.showHiddenNamespaces',
      showHiddenNamespaces: false,
    });
    spy.mockRestore();

    expect(toggleElement).not.toBeChecked();
  });
});
