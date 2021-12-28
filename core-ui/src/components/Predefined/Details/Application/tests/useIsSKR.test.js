import React from 'react';

import { render } from '@testing-library/react';
import { useIsSKR } from '../useIsSKR';

let mockUseGet;
jest.mock('react-shared', () => ({
  useGet: () => mockUseGet,
}));

function TestBed() {
  const isSkr = useIsSKR();

  return isSkr ? 'SKR' : 'OS';
}

describe('useIsSKR', () => {
  it('Configmap not found', () => {
    mockUseGet = { error: 'not found', data: null };
    const { getByText } = render(<TestBed />);

    expect(getByText('OS')).toBeInTheDocument();
  });

  it('Configmap found, value not set to true', () => {
    mockUseGet = { data: { data: { 'is-managed-kyma-runtime': 'false' } } };
    const { getByText } = render(<TestBed />);

    expect(getByText('OS')).toBeInTheDocument();
  });

  it('Configmap found, value set to true', () => {
    mockUseGet = { data: { data: { 'is-managed-kyma-runtime': 'true' } } };
    const { getByText } = render(<TestBed />);

    expect(getByText('SKR')).toBeInTheDocument();
  });
});
