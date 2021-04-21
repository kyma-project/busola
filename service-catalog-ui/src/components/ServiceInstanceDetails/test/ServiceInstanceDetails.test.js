// import React from 'react';
// import { MockedProvider } from '@apollo/react-testing';
// import { mount } from 'enzyme';
// import {
//   serviceInstanceDeleteMutation,
//   serviceInstanceQuery,
//   createBindingMutation,
// } from 'testing/instances/queriesMocks';
// import ServiceInstanceDetails from '../ServiceInstanceDetails';
// import { Panel } from 'fundamental-react';
// import { Spinner } from 'react-shared';
// import { createMockLink, NotificationContext } from 'react-shared';
// import { componentUpdate, mockTestNamespace } from 'testing';
// import { serviceInstanceConstants } from 'helpers/constants';

// import ServiceInstanceHeader from '../ServiceInstanceHeader/ServiceInstanceHeader';
// import ServiceInstanceBindings from '../ServiceInstanceBindings/ServiceInstanceBindings.container';

// const mockNavigate = jest.fn();
// const mockAddBackdrop = jest.fn();
// const mockRemoveBackdrop = jest.fn();
// const mockDelete = jest.fn();

// // jest.mock('@kyma-project/generic-documentation', () => {
// //   return <div>GENERIC DOCUMENTATION COMPONENT</div>;
// // });

// jest.mock('@luigi-project/client', () => ({
//   getContext: () => ({
//     namespaceId: mockTestNamespace,
//   }),
//   linkManager: () => ({
//     fromContext: () => ({
//       navigate: mockNavigate,
//     }),
//   }),
//   getNodeParams: () => ({
//     selectedTab: 'addons',
//   }),
//   uxManager: () => ({
//     addBackdrop: mockAddBackdrop,
//     removeBackdrop: mockRemoveBackdrop,
//   }),
// }));

// jest.mock('react-shared', () => ({
//   ...jest.requireActual('react-shared'),
//   handleDelete: () => mockDelete(),
// }));

// const consoleWarn = jest.spyOn(global.console, 'warn').mockImplementation();
// afterAll(() => {
//   consoleWarn.mockReset();
// });

describe('Instance Details UI', () => {
  test.todo('Instance Details UI');

  //   it('Shows loading indicator only when data is not yet loaded', async () => {
  //     const { link } = createMockLink([serviceInstanceQuery]);

  //     const component = mount(
  //       <MockedProvider link={link}>
  //         <ServiceInstanceDetails
  //           match={{
  //             params: {
  //               name: 'sth-motherly-deposit',
  //             },
  //           }}
  //         />
  //       </MockedProvider>,
  //     );

  //     expect(component.find(Spinner).exists()).toBe(true);

  //     await componentUpdate(component);

  //     expect(component.find(Spinner).exists()).toBe(false);
  //   });

  //   it('Displays instance details ', async () => {
  //     const { link } = createMockLink([serviceInstanceQuery]);

  //     const component = mount(
  //       <MockedProvider link={link}>
  //         <ServiceInstanceDetails
  //           match={{
  //             params: {
  //               name: 'sth-motherly-deposit',
  //             },
  //           }}
  //         />
  //       </MockedProvider>,
  //     );

  //     await componentUpdate(component);

  //     expect(component.find(ServiceInstanceHeader).exists()).toBe(true);
  //     expect(component.find(ServiceInstanceBindings).exists()).toBe(true);

  //     const title = component.find('[aria-label="title"]').first();
  //     expect(title.text()).toMatch(/sth-motherly-deposit/);
  //   });

  //   it('Deletes instance using delete button', async () => {
  //     const { link } = createMockLink([
  //       serviceInstanceQuery,
  //       serviceInstanceDeleteMutation,
  //     ]);

  //     const component = mount(
  //       <MockedProvider link={link}>
  //         <ServiceInstanceDetails
  //           match={{
  //             params: {
  //               name: 'sth-motherly-deposit',
  //             },
  //           }}
  //         />
  //       </MockedProvider>,
  //     );

  //     await componentUpdate(component);

  //     const header = component.find(ServiceInstanceHeader);
  //     const deleteButton = header.find(Panel.Actions).find('button');
  //     expect(deleteButton.exists()).toBe(true);
  //     expect(deleteButton.text()).toBe(serviceInstanceConstants.delete);

  //     deleteButton.simulate('click');
  //     await componentUpdate(component);

  //     expect(mockDelete).toHaveBeenCalledTimes(1);
  //   });

  //   it('Creates credentials', async () => {
  //     const { link } = createMockLink([
  //       serviceInstanceQuery,
  //       createBindingMutation,
  //     ]);

  //     const component = mount(
  //       <MockedProvider link={link}>
  //         <NotificationContext.Provider
  //           value={{ isOpen: false, open: jest.fn() }}
  //         >
  //           <ServiceInstanceDetails
  //             match={{
  //               params: {
  //                 name: 'sth-motherly-deposit',
  //               },
  //             }}
  //           />
  //         </NotificationContext.Provider>
  //       </MockedProvider>,
  //     );

  //     await componentUpdate(component);

  //     const credentialsTab = component.find(
  //       '[data-e2e-id="service-binding-tab"]',
  //     );
  //     expect(credentialsTab.exists()).toBe(true);

  //     credentialsTab.simulate('click');
  //     await componentUpdate(component);

  //     const createCredentialsButton = component
  //       .find('[data-e2e-id="create-credentials"]')
  //       .find('button');

  //     expect(createCredentialsButton.exists()).toBe(true);

  //     const createBindingFn = createBindingMutation.result;
  //     createCredentialsButton.simulate('click');
  //     await componentUpdate(component);

  //     expect(createBindingFn).toHaveBeenCalledTimes(1);
  //   });
});
