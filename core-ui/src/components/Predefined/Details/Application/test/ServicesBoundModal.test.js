import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import ServicesBoundModal from '../ServicesBoundModal';

jest.mock('react-i18next', () => ({
  // this mock makes sure any components using the translate hook can use it without a warning being shown
  useTranslation: () => {
    return {
      t: str => str,
      i18n: {
        changeLanguage: () => new Promise(() => {}),
        options: {},
      },
    };
  },
}));

describe('ServicesBoundModal', () => {
  const namespace = 'test-namespace';
  const binding = {
    metadata: { namespace },
    spec: {
      services: [
        { id: '1', displayName: 'svc-1' },
        { id: '2', displayName: 'svc-2' },
      ],
    },
  };

  it('Renders link, modal and ', () => {
    const { queryByText } = render(<ServicesBoundModal binding={binding} />);
    const link = queryByText('test-namespace');
    expect(link).toBeInTheDocument();
    fireEvent.click(link);

    expect(queryByText('svc-1')).toBeInTheDocument();
    expect(queryByText('svc-2')).toBeInTheDocument();
  });
});
