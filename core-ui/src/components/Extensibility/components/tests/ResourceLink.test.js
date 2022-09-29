import React from 'react';
import { shallow } from 'enzyme';
import { ResourceLink } from '../ResourceLink';

const mockNavigate = jest.fn();
jest.mock('shared/helpers/universalLinks', () => ({
  ...jest.requireActual('shared/helpers/universalLinks'),
  navigateToResource: params => mockNavigate(params),
}));

describe('ResourceLink', () => {
  const value = { kind: 'test-kind', name: 'value-name' };
  const originalResource = {
    name: 'original-resource-name',
    namespace: 'oiginal-resource-namrespace',
  };

  it('Renders placeholder for no value', () => {
    const container = shallow(
      <ResourceLink structure={{ placeholder: 'empty!' }} />,
    );

    expect(container.text()).toBe('extensibility::empty!');
  });

  it('Fires an event on click', () => {
    const container = shallow(
      <ResourceLink
        value={value}
        structure={{
          linkText: 'link-text',
          resource: {
            name: 'data.name',
            kind: 'data.kind',
            namespace: 'root.namespace',
          },
        }}
        originalResource={originalResource}
      />,
    );

    container.simulate('click', container);

    expect(mockNavigate).toHaveBeenCalledWith({
      kind: 'test-kind',
      name: 'value-name',
      namespace: 'oiginal-resource-namrespace',
    });
  });

  it('Accepts config without namespace', () => {
    console.warn = jest.fn();

    const container = shallow(
      <ResourceLink
        value={value}
        structure={{
          linkText: "'link-text'",
          resource: {
            name: 'data.name',
            kind: 'data.kind',
          },
        }}
        originalResource={originalResource}
      />,
    );

    // no errors here
    expect(container.text()).toBe('extensibility::link-text');
  });

  it('Show error on invalid config', () => {
    const originalConsoleWarn = console.warn;
    console.warn = jest.fn();

    const container = shallow(
      <ResourceLink
        value={value}
        structure={{ resource: { namespace: 'test-ns' } }}
        originalResource={originalResource}
      />,
    );

    expect(container.text()).toBe('extensibility.configuration-error');
    expect(console.warn.mock.calls[0][0]).toBeInstanceOf(Error);
    console.warn = originalConsoleWarn;
  });
});
