import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import BasicData from '../BasicData';
import { shallow } from 'enzyme';

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
  Tooltip: () => null,
}));

jest.mock('components/Lambdas/components', () => ({
  LabelsInput: () => null,
}));

describe('BasicData', () => {
  it('Updates name and docker image', () => {
    const setDeploymentMock = jest.fn();
    const component = shallow(
      <BasicData deployment={{}} setDeployment={setDeploymentMock} />,
    );

    const nameEvent = {
      preventDefault() {},
      target: { value: 'test-name' },
    };
    component.find('K8sNameInput').simulate('change', nameEvent);
    expect(setDeploymentMock).toHaveBeenCalledWith({ name: 'test-name' });

    const imageEvent = {
      preventDefault() {},
      target: { value: 'test-image' },
    };
    component.find('FormInput').simulate('change', imageEvent);
    expect(setDeploymentMock).toHaveBeenCalledWith({
      dockerImage: 'test-image',
    });
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
