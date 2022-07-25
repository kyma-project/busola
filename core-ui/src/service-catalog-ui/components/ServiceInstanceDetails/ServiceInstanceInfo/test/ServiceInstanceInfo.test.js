import { mount } from 'enzyme';
import ServiceInstanceInfo from '../ServiceInstanceInfo';
import React from 'react';
import { instanceAllAttributes } from './mocks';
import { Modal } from 'shared/components/Modal/Modal';
import { serviceInstanceConstants } from 'helpers/constants';

const mockNavigate = jest.fn();
const mockAddBackdrop = jest.fn();
const mockRemoveBackdrop = jest.fn();

jest.mock('@luigi-project/client', () => ({
  linkManager: () => ({
    fromContext: () => ({
      navigate: mockNavigate,
    }),
  }),
  uxManager: () => ({
    addBackdrop: mockAddBackdrop,
    removeBackdrop: mockRemoveBackdrop,
  }),
}));

const consoleWarn = jest.spyOn(global.console, 'warn').mockImplementation();
afterAll(() => {
  consoleWarn.mockReset();
});

describe('ServiceInstanceInfo', () => {
  describe('Render info with all attributes', () => {
    const component = mount(
      <ServiceInstanceInfo serviceInstance={instanceAllAttributes} />,
    );

    it('Has service class field with link', () => {
      const field = component.find('[data-e2e-id="instance-service-class"]');
      expect(field.exists()).toBe(true);
      expect(field.text()).toEqual(
        instanceAllAttributes.clusterServiceClass.displayName,
      );

      const link = field.find('button');
      link.simulate('click');

      expect(mockNavigate).toHaveBeenCalledWith(
        'catalog/details/a2257daa-0e26-4c61-a68d-8a7453c1b767',
      );
    });

    it('Has documentation field with link', () => {
      const field = component.find(
        '[data-e2e-id="instance-service-documentation-link"]',
      );
      expect(field.exists()).toBe(true);
      expect(field.text()).toBe(serviceInstanceConstants.link);
    });

    it('Has support field with link', () => {
      const field = component.find(
        '[data-e2e-id="instance-service-support-link"]',
      );
      expect(field.exists()).toBe(true);
      expect(field.text()).toBe(serviceInstanceConstants.link);
    });

    it('Has labels field with link', () => {
      const field = component.find('[data-e2e-id="instance-labels"]');
      expect(field.exists()).toBe(true);

      expect(
        field
          .children()
          .map(c => c.text())
          .sort(),
      ).toEqual(instanceAllAttributes.labels.sort());
    });

    it('Has plan field with parameters', async () => {
      const field = component.find('[data-e2e-id="instance-service-plan"]');
      expect(field.exists()).toBe(true);
      expect(field.text()).toEqual(
        instanceAllAttributes.clusterServicePlan.displayName,
      );
    });
  });

  it('Render info without labels', () => {
    const instance = instanceAllAttributes;
    instance.labels = [];
    const component = mount(<ServiceInstanceInfo serviceInstance={instance} />);
  });

  it('Render info without support', () => {
    const instance = instanceAllAttributes;
    instance.clusterServiceClass.supportUrl = null;
    const component = mount(<ServiceInstanceInfo serviceInstance={instance} />);
    expect(
      component.find('[data-e2e-id="instance-service-support-link"]').exists(),
    ).toBe(false);
  });

  it('Render info without documentation link', () => {
    const instance = instanceAllAttributes;
    instance.clusterServiceClass.documentationUrl = null;
    const component = mount(<ServiceInstanceInfo serviceInstance={instance} />);
    expect(
      component
        .find('[data-e2e-id="instance-service-documentation-link"]')
        .exists(),
    ).toBe(false);
  });

  it('Render info without plan parameters', () => {
    const instance = instanceAllAttributes;
    instance.planSpec = {};
    const component = mount(<ServiceInstanceInfo serviceInstance={instance} />);
    const field = component.find('[data-e2e-id="instance-service-plan"]');
    expect(field.find(Modal).exists()).toBe(false);
    expect(field.text()).toEqual(instance.clusterServicePlan.displayName);
  });
});
