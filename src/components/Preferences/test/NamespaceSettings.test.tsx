import { showHiddenNamespacesState } from 'state/preferences/showHiddenNamespacesAtom';
import { render, fireEvent, waitFor } from 'testing/reactTestingUtils';
import NamespaceSettings from '../NamespaceSettings';

describe('NamespaceSettings', () => {
  it('Sends custom message on toggle', async () => {
    const { getByLabelText } = render(<NamespaceSettings />, {
      initializeState: snapshot =>
        snapshot.set(showHiddenNamespacesState, true),
    });

    const toggle = getByLabelText('settings.clusters.showHiddenNamespaces');

    const toggleElement = toggle?.shadowRoot?.querySelector('[role="switch"]');
    expect(toggleElement).toBeInTheDocument();

    expect(toggleElement).toHaveAttribute('aria-checked', 'true');

    if (toggleElement) fireEvent.click(toggleElement);

    await waitFor(() => {
      expect(toggleElement).toHaveAttribute('aria-checked', 'false');
    });
  });
});
