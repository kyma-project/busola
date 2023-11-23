import { showHiddenNamespacesState } from 'state/preferences/showHiddenNamespacesAtom';
import { render } from 'testing/reactTestingUtils';
import NamespaceSettings from '../NamespaceSettings';

describe('NamespaceSettings', () => {
  it('Check ui5 switch checked', () => {
    const { container } = render(<NamespaceSettings />, {
      initializeState: snapshot =>
        snapshot.set(showHiddenNamespacesState, true),
    });

    const toggle = container.querySelector('ui5-switch');

    expect(toggle).toHaveAttribute('checked', 'true');
  });
});
