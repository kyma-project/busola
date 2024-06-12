import { render, fireEvent } from '@testing-library/react';
import { ModalWithForm } from 'shared/components/ModalWithForm/ModalWithForm';
import { RecoilRoot } from 'recoil';

describe('ModalWithForm', () => {
  it('Renders child component', () => {
    const child = <span>test</span>;
    const { getByText, queryByText } = render(
      <RecoilRoot>
        <div>
          <ModalWithForm
            title=""
            performRefetch={() => {}}
            sendNotification={() => {}}
            confirmText="Create"
            button={{ text: 'Open' }}
            renderForm={() => child}
          />
        </div>
      </RecoilRoot>,
    );

    fireEvent.click(getByText('Open'));

    expect(queryByText('test')).toBeInTheDocument();
  });
});
