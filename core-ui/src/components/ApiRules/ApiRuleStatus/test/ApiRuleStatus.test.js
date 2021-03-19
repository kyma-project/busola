import React from 'react';
import { render } from '@testing-library/react';

import ApiRuleStatus from '../ApiRuleStatus';

describe('ApiRuleStatus', () => {
  it('Renders nothing if status is none', () => {
    const apiRule = { status: null };
    const { queryByRole } = render(<ApiRuleStatus apiRule={apiRule} />);
    expect(queryByRole('status')).not.toBeInTheDocument();
  });

  it('Renders nothing if status.APIRuleStatus is none', () => {
    const apiRule = {
      status: { APIRuleStatus: null },
    };
    const { queryByRole } = render(<ApiRuleStatus apiRule={apiRule} />);
    expect(queryByRole('status')).not.toBeInTheDocument();
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
