import React from 'react';
import { render } from '@testing-library/react';

import ApiRuleStatus from '../ApiRuleStatus';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: key => key,
  }),
}));

describe('ApiRuleStatus', () => {
  it('Renders Unknown status if status is null', () => {
    const apiRule = { status: null };
    const { queryByRole } = render(<ApiRuleStatus apiRule={apiRule} />);

    const statusText = queryByRole('status');
    expect(statusText).toBeInTheDocument();
    expect(statusText).toHaveTextContent('common.statuses.unknown');
  });

  it('Renders Unknown status if status.APIRuleStatus is null', () => {
    const apiRule = {
      status: { APIRuleStatus: null },
    };
    const { queryByRole } = render(<ApiRuleStatus apiRule={apiRule} />);

    const statusText = queryByRole('status');
    expect(statusText).toBeInTheDocument();
    expect(statusText).toHaveTextContent('common.statuses.unknown');
  });

  it('Renders with minimal props', () => {
    const apiRule = {
      status: {
        APIRuleStatus: {
          code: 'OK',
          desc: '',
        },
      },
    };
    const { queryByRole } = render(<ApiRuleStatus apiRule={apiRule} />);

    const statusText = queryByRole('status');
    expect(statusText).toBeInTheDocument();
    expect(statusText).toHaveTextContent('OK');
  });
});
