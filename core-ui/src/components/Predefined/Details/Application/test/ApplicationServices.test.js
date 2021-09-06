import React from 'react';
import { render } from '@testing-library/react';
import ApplicationServices from '../ApplicationServices';

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

describe('ApplicationServices', () => {
  it('Renders list', () => {
    const spec = {
      services: [
        {
          displayName: 'service-1',
          entries: [{ type: 'Events', type: 'Events' }],
        },
        {
          displayName: 'service-2',
          entries: [{ type: 'APIs', type: 'Events' }],
        },
      ],
    };
    const { queryByText } = render(<ApplicationServices spec={spec} />);
    expect(queryByText('service-101')); // (service-1, 0, 1) cells
    expect(queryByText('service-211')); // (service-2, 1, 1) cells
  });
});
