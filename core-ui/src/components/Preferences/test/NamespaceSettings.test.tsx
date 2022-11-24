import LuigiClient from '@luigi-project/client';
import { RecoilRoot } from 'recoil';
import { showHiddenNamespacesState } from 'state/preferences/showHiddenNamespacesAtom';
import { render, fireEvent } from 'testing/reactTestingUtils';
import NamespaceSettings from '../NamespaceSettings';

jest.mock('shared/contexts/MicrofrontendContext', () => ({
  useFeatureToggle: () => [true, () => null],
}));

describe('NamespaceSettings', () => {
  it('Sends custom message on toggle', () => {
    const spy = jest.spyOn(LuigiClient, 'sendCustomMessage');
    const { getByLabelText } = render(
      <RecoilRoot
        initializeState={state => state.set(showHiddenNamespacesState, true)}
      >
        <NamespaceSettings />
      </RecoilRoot>,
    );

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
