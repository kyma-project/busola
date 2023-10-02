import { showHiddenNamespacesState } from 'state/preferences/showHiddenNamespacesAtom';
import { render, fireEvent, waitFor } from 'testing/reactTestingUtils';
import NamespaceSettings from '../NamespaceSettings';

describe('NamespaceSettings', () => {
  it('Sends custom message on toggle', async () => {
    const { container } = render(<NamespaceSettings />, {
      initializeState: snapshot =>
        snapshot.set(showHiddenNamespacesState, true),
    });

    const toggle = container.querySelector('ui5-switch');
    const toggleSwitch = toggle?.shadowRoot?.querySelector('[role="switch"]');

    expect(toggleSwitch).toHaveAttribute('aria-checked', 'true');

    if (toggleSwitch) fireEvent.click(toggleSwitch);

    await waitFor(() => {
      expect(toggleSwitch).toHaveAttribute('aria-checked', 'false');
    });
  });
});
