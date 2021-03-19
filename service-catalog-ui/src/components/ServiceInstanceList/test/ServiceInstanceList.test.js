import React from 'react';
import { MockedProvider } from '@apollo/react-testing';
import { mount } from 'enzyme';
import {
  serviceInstanceDeleteMutation,
  allServiceInstancesQuery,
  serviceInstancesSubscription,
} from 'testing/instances/queriesMocks';
import ServiceInstanceTable from '../ServiceInstanceTable/ServiceInstanceTable.component';

import ServiceInstancesList from '../ServiceInstanceList';
import { Link } from '../ServiceInstanceTable/styled.js';
import { Spinner, createMockLink } from 'react-shared';
import { componentUpdate, mockTestNamespace } from 'testing';
import { act } from 'react-dom/test-utils';
import { FormInput, Identifier } from 'fundamental-react';
import {
  serviceInstance1,
  serviceInstance2,
} from 'testing/instances/instanceMocks';
import FilterDropdown from '../ServiceInstanceToolbar/FilterDropdown.component';

jest.mock('react-shared', () => ({
  ...jest.requireActual('react-shared'),
  handleDelete: (_, __, name, callback) => callback(name),
}));

const mockNavigate = jest.fn();
const mockAddBackdrop = jest.fn();
const mockRemoveBackdrop = jest.fn();

const servicesTabIndex = 0;
const addonsTabIndex = 1;

function mountWithModalBg(component) {
  return mount(
    <div className="modal-demo-bg">
      <span />
      {component}
    </div>,
    { attachTo: document.body },
  );
}

jest.mock('@luigi-project/client', () => ({
  getContext: () => ({
    namespaceId: mockTestNamespace,
  }),
  linkManager: () => ({
    fromContext: () => ({
      navigate: mockNavigate,
      withParams: () => ({
        navigate: mockNavigate,
      }),
    }),
    withParams: () => ({
      navigate: mockNavigate,
    }),
  }),
  getNodeParams: () => ({
    selectedTab: 'addons',
  }),
  uxManager: () => ({
    addBackdrop: mockAddBackdrop,
    removeBackdrop: mockRemoveBackdrop,
  }),
}));

const consoleWarn = jest.spyOn(global.console, 'warn').mockImplementation();
const planSpecCode = `{
  "imagePullPolicy": "IfNotPresent"
}`;

describe('InstancesList UI', () => {
  beforeEach(() => {
    consoleWarn.mockReset();
  });

  it('Shows loading indicator only when data is not yet loaded', async () => {
    const { link } = createMockLink([]);

    const component = mount(
      <MockedProvider link={link}>
        <ServiceInstancesList />
      </MockedProvider>,
    );

    expect(component.find(Spinner)).toHaveLength(1);

    await componentUpdate(component);

    expect(component.find(Spinner)).toHaveLength(0);

    expectKnownConsoleWarnings();
  });

  it('Displays instances with their corresponding names in the table', async () => {
    const { link } = createMockLink([allServiceInstancesQuery]);
    const component = mount(
      <MockedProvider link={link}>
        <ServiceInstancesList />
      </MockedProvider>,
    );

    await componentUpdate(component);
    await componentUpdate(component);

    const table = component.find(ServiceInstanceTable).at(addonsTabIndex);
    expect(table.exists()).toBe(true);

    const displayedInstanceLinks = table
      .find('[data-e2e-id="instance-name"]')
      .find(Link);
    expect(displayedInstanceLinks).toHaveLength(2);

    const firstInstanceAnchor = displayedInstanceLinks.at(0).find('a');
    const secondInstanceAnchor = displayedInstanceLinks.at(1).find('a');

    expect(firstInstanceAnchor.exists()).toBe(true);
    expect(secondInstanceAnchor.exists()).toBe(true);
    expect(firstInstanceAnchor.text()).toEqual('sth-motherly-deposit');
    expect(secondInstanceAnchor.text()).toEqual('testing-curly-tax');
    expectKnownConsoleWarnings();
  });

  it('Navigates to Service Catalog when clicked on "Add instance" button', async () => {
    const { link } = createMockLink([allServiceInstancesQuery]);
    const component = mount(
      <MockedProvider link={link}>
        <ServiceInstancesList />
      </MockedProvider>,
    );

    await componentUpdate(component);

    const addInstanceButton = component
      .find('[data-e2e-id="add-instance"]')
      .at(addonsTabIndex)
      .find('button');
    expect(addInstanceButton.exists()).toBe(true);

    addInstanceButton.simulate('click');

    expect(mockNavigate).toHaveBeenCalledWith('catalog');
    expectKnownConsoleWarnings();
  });

  it('Navigates to Instance details when clicked on Instance link', async () => {
    const { link } = createMockLink([allServiceInstancesQuery]);
    const component = mount(
      <MockedProvider link={link}>
        <ServiceInstancesList />
      </MockedProvider>,
    );

    await componentUpdate(component);

    const instanceLink = component
      .find('[data-e2e-id="instance-name-testing-curly-tax"]')
      .find('a');
    expect(instanceLink.exists()).toBe(true);

    instanceLink.simulate('click');

    expect(mockNavigate).toHaveBeenCalledWith(
      'instances/details/testing-curly-tax',
    );
    expectKnownConsoleWarnings();
  });

  it(`Test deleting instances via subscription`, async () => {
    const { link, sendEvent } = createMockLink([allServiceInstancesQuery]);
    const component = mount(
      <MockedProvider link={link}>
        <ServiceInstancesList />
      </MockedProvider>,
    );
    sendEvent(serviceInstancesSubscription('DELETE'));
    await componentUpdate(component);
    await componentUpdate(component);

    const table = component.find(ServiceInstanceTable).at(servicesTabIndex);
    expect(table.exists()).toBe(true);
    expect(table.prop('data')).toHaveLength(1);
  });

  it(`Test adding instances via subscription`, async () => {
    const { link, sendEvent } = createMockLink([allServiceInstancesQuery]);
    const component = mount(
      <MockedProvider link={link}>
        <ServiceInstancesList />
      </MockedProvider>,
    );
    sendEvent(serviceInstancesSubscription('ADD'));
    await componentUpdate(component);
    await componentUpdate(component);

    const table = component.find(ServiceInstanceTable).at(addonsTabIndex);
    expect(table.exists()).toBe(true);
    expect(table.prop('data')).toHaveLength(3);
  });

  it(`Validate if modal delete button fires deleteMutation`, async () => {
    const { link } = createMockLink([
      allServiceInstancesQuery,
      serviceInstanceDeleteMutation,
    ]);

    const deleteButtonSelector = '[aria-label="Delete Instance"]';
    const component = mountWithModalBg(
      <MockedProvider link={link}>
        <ServiceInstancesList />
      </MockedProvider>,
    );
    await componentUpdate(component);

    const table = component.find(ServiceInstanceTable).at(addonsTabIndex);
    expect(table.exists()).toBe(true);
    expect(table.prop('data')).toHaveLength(2);

    const deleteButton = component
      .find('[role="tabpanel"]')
      .at(addonsTabIndex)
      .find(deleteButtonSelector)
      .at(0);
    expect(deleteButton.exists()).toBe(true);

    await act(async () => {
      deleteButton.simulate('click');
    });
    await componentUpdate(component);

    expect(serviceInstanceDeleteMutation.result).toHaveBeenCalled();
    expectKnownConsoleWarnings();
  });

  it('Open modal for plan with non-empty spec', async () => {
    const { link } = createMockLink([allServiceInstancesQuery]);
    const component = mount(
      <MockedProvider link={link}>
        <ServiceInstancesList />
      </MockedProvider>,
    );

    await componentUpdate(component);
    await componentUpdate(component);

    let row = component
      .find('[role="tabpanel"]')
      .at(addonsTabIndex)
      .find('tbody tr')
      .at(0);
    const planLink = row.find('[data-e2e-id="service-plan"]').last();

    expect(planLink.exists()).toBe(true);
    expect(planLink.text()).toContain(
      serviceInstance1.clusterServicePlan.displayName,
    );

    let planContent = row.find('code[data-e2e-id="service-plan-content"]');
    expect(planContent.exists()).toBe(false);

    planLink.simulate('click');
    await componentUpdate(component);
    row = component
      .find('[role="tabpanel"]')
      .at(addonsTabIndex)
      .find('tbody tr')
      .at(0);

    planContent = row.find('code[data-e2e-id="service-plan-content"]');
    expect(planContent.exists()).toBe(true);
    expect(planContent.text()).toBe(planSpecCode);
    expectKnownConsoleWarnings();
  }, 10000);

  it('No modal for plan with empty spec', async () => {
    const { link } = createMockLink([allServiceInstancesQuery]);
    const component = mount(
      <MockedProvider link={link}>
        <ServiceInstancesList />
      </MockedProvider>,
    );

    await componentUpdate(component);
    await componentUpdate(component);
    const row = component
      .find('[role="tabpanel"]')
      .at(addonsTabIndex)
      .find('tbody tr')
      .at(1);

    const planLink = row.find('[data-e2e-id="service-plan"]');
    expect(planLink.exists()).toBe(true);
    expect(planLink.text()).toEqual(
      serviceInstance2.clusterServicePlan.displayName,
    );

    let planContent = row.find('code[data-e2e-id="service-plan-content"]');
    expect(planContent.exists()).toBe(false);
    planLink.simulate('click');
    await componentUpdate(component);

    planContent = component.find('code[data-e2e-id="service-plan-content"]');
    expect(planContent.exists()).toBe(false);
    expectKnownConsoleWarnings();
  });
});

describe('Search instances by name', () => {
  const { link } = createMockLink([allServiceInstancesQuery]);
  const component = mount(
    <MockedProvider link={link}>
      <ServiceInstancesList />
    </MockedProvider>,
  );

  it('Shows all instances initially', async () => {
    await componentUpdate(component);

    const addOnsTab = component.find('[role="tab"]').at(addonsTabIndex);
    expect(addOnsTab.find(Identifier).text()).toEqual('2');

    const servicesTab = component.find('[role="tab"]').at(servicesTabIndex);
    expect(servicesTab.find(Identifier).text()).toEqual('1');

    expectKnownConsoleWarnings();
  });

  it('Search addon', async () => {
    await componentUpdate(component);

    const search = component.find(FormInput).find('input');
    expect(search.exists()).toBe(true);
    search.simulate('change', { target: { value: 'motherly' } });

    await componentUpdate(component);
    const addOnsTab = component.find('[role="tab"]').at(addonsTabIndex);
    expect(addOnsTab.find(Identifier).text()).toEqual('1');
    addOnsTab
      .find('div')
      .first()
      .simulate('click');
    await componentUpdate(component);

    const servicesTab = component.find('[role="tab"]').at(servicesTabIndex);
    expect(servicesTab.find(Identifier).text()).toEqual('0');

    servicesTab
      .find('div')
      .first()
      .simulate('click');
    await componentUpdate(component);
    expect(
      component
        .find(ServiceInstanceTable)
        .at(servicesTabIndex)
        .prop('data'),
    ).toEqual([]);

    expectKnownConsoleWarnings();
  });

  it('Search service', async () => {
    await componentUpdate(component);

    const search = component.find(FormInput).find('input');
    expect(search.exists()).toBe(true);
    search.simulate('change', { target: { value: 'fishing' } });

    await componentUpdate(component);
    const addOnsTab = component.find('[role="tab"]').at(addonsTabIndex);
    expect(addOnsTab.find(Identifier).text()).toEqual('0');
    addOnsTab
      .find('div')
      .first()
      .simulate('click');
    await componentUpdate(component);
    expect(
      component
        .find(ServiceInstanceTable)
        .at(addonsTabIndex)
        .prop('data'),
    ).toEqual([]);

    const servicesTab = component.find('[role="tab"]').at(servicesTabIndex);
    expect(servicesTab.find(Identifier).text()).toEqual('1');

    expectKnownConsoleWarnings();
  });
});

describe('filter instances by labels', () => {
  const { link } = createMockLink([allServiceInstancesQuery]);
  const component = mount(
    <MockedProvider link={link}>
      <ServiceInstancesList />
    </MockedProvider>,
  );

  it('Filter dropdown is filled with labels', async () => {
    await componentUpdate(component);
    const filter = component.find(FilterDropdown);
    expect(filter.prop('availableLabels')).toEqual({
      label1: 1,
      label2: 2,
      label3: 0,
    });

    const filterButton = filter.find('button[data-e2e-id="toggle-filter"]');
    filterButton.simulate('click');
    await componentUpdate(component);
    const labelsSelectors = component
      .find(FilterDropdown)
      .find(FormInput)
      .find('input');
    expect(labelsSelectors).toHaveLength(3);

    expectKnownConsoleWarnings();
  });

  it('Select filter', async () => {
    const firstLabelSelector = component
      .find(FilterDropdown)
      .find(FormInput)
      .find('input')
      .at(0);

    firstLabelSelector.simulate('change', {
      target: { checked: true, id: 'label1' },
    });
    await componentUpdate(component);
    expect(component.find(FilterDropdown).prop('activeLabelFilters')).toEqual([
      'label1',
    ]);

    const addOnsTab = component.find('[role="tab"]').at(addonsTabIndex);
    expect(addOnsTab.find(Identifier).text()).toEqual('1');

    addOnsTab
      .find('div')
      .first()
      .simulate('click');
    await componentUpdate(component);

    const servicesTab = component.find('[role="tab"]').at(servicesTabIndex);
    expect(servicesTab.find(Identifier).text()).toEqual('0');

    servicesTab
      .find('div')
      .first()
      .simulate('click');
    await componentUpdate(component);
    expect(
      component
        .find(ServiceInstanceTable)
        .at(servicesTabIndex)
        .prop('data'),
    ).toEqual([]);

    expectKnownConsoleWarnings();
  });
});

function expectKnownConsoleWarnings() {
  expect(consoleWarn.mock.calls).toMatchSnapshot();
}
