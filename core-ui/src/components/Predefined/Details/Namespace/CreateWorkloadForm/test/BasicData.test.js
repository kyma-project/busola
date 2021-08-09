import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import BasicData from '../BasicData';

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

jest.mock('react-shared', () => ({
  K8sNameInput: () => <input role="name-input" />,
  Tooltip: ({ children }) => children,
}));

jest.mock('components/Lambdas/components', () => ({
  LabelsInput: () => null,
}));

describe('BasicData', () => {
  it('Updates name and docker image', async () => {
    const setDeploymentMock = jest.fn();
    const { getByPlaceholderText, getByRole } = render(
      <BasicData deployment={{}} setDeployment={setDeploymentMock} />,
    );

    fireEvent.change(getByRole('name-input'), {
      target: { value: 'test-name' },
    });
    await wait(() =>
      expect(setDeploymentMock).toHaveBeenCalledWith({ name: 'test-name' }),
    );

    fireEvent.change(getByPlaceholderText('Enter Docker image'), {
      target: { value: 'test-image' },
    });
    await wait(() =>
      expect(setDeploymentMock).toHaveBeenCalledWith({
        dockerImage: 'test-image',
      }),
    );
  });

  it('Switches service creation', () => {
    const setDeploymentMock = jest.fn();
    const { getByLabelText } = render(
      <BasicData deployment={{}} setDeployment={setDeploymentMock} />,
    );

    const serviceCreationSwitch = getByLabelText(/Create a separate Service/);
    fireEvent.click(serviceCreationSwitch);

    expect(setDeploymentMock).toHaveBeenCalledWith({
      createService: true,
    });

    fireEvent.click(serviceCreationSwitch);

    expect(setDeploymentMock).toHaveBeenCalledWith({
      createService: false,
    });
  });
});
