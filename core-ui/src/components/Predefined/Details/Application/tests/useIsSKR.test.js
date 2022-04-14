import React from 'react';

import { render } from '@testing-library/react';
import { useIsSKR } from '../useIsSKR';

let mockUseSingleGet;
jest.mock('shared/hooks/BackendAPI/useGet', () => ({
  useSingleGet: () => () => ({ json: () => Promise.resolve(mockUseSingleGet) }),
}));

function Testbed() {
  const isSkr = useIsSKR();
  switch (isSkr) {
    case true:
      return 'SKR';
    case false:
      return 'OS';
    default:
      return 'FETCHING';
  }
}

describe('useIsSKR', () => {
  it('Configmap not found', () => {
    mockUseSingleGet = { error: 'not found', data: null };
    const { getByText } = render(<Testbed />);

    expect(getByText('FETCHING')).toBeInTheDocument();
  });

  it('Configmap found, value not set to true', async () => {
    mockUseSingleGet = { data: { 'is-managed-kyma-runtime': 'false' } };
    const { findByText } = render(<Testbed />);
    expect(await findByText('OS')).toBeInTheDocument();
  });

  it('Configmap found, value set to true', async () => {
    mockUseSingleGet = { data: { 'is-managed-kyma-runtime': 'true' } };
    const { findByText } = render(<Testbed />);
    expect(await findByText('SKR')).toBeInTheDocument();
  });
});
