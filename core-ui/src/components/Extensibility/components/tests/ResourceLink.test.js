import React from 'react';
import { shallow } from 'enzyme';
import { ResourceLink } from '../ResourceLink';

const mockNavigate = jest.fn();
jest.mock('shared/helpers/universalLinks', () => ({
  ...jest.requireActual('shared/helpers/universalLinks'),
  navigateToResource: params => mockNavigate(params),
}));

jest.mock('../../hooks/useJsonata', () => ({
  useJsonata: () => {
    return query => {
      const jsonataError = query === 'error' ? 'Error!' : null;
      return [query, jsonataError];
    };
  },
}));

describe('ResourceLink', () => {
  const value = 'link-to-resource';
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
    const res = {
      name: 'data.name',
      kind: 'data.kind',
      namespace: 'root.namespace',
    };
    const container = shallow(
      <ResourceLink
        value={value}
        structure={{
          source: 'data.name',
          resource: res,
        }}
        originalResource={originalResource}
      />,
    );

    container.simulate('click', container);
    expect(mockNavigate).toHaveBeenCalledWith(JSON.parse(JSON.stringify(res)));
  });

  it('Accepts config without namespace', () => {
    const container = shallow(
      <ResourceLink
        value={value}
        structure={{
          source: 'link-text',
          resource: {
            name: 'data.name',
            kind: 'data.kind',
          },
        }}
        originalResource={originalResource}
      />,
    );

    // no errors here
    expect(container.text()).toBe(`extensibility::${value}`);
  });

  it('Show error on invalid config', () => {
    const container = shallow(
      <ResourceLink
        value={value}
        structure={{ resource: { namespace: 'error' } }}
        originalResource={originalResource}
      />,
    );

    expect(container.text()).toBe('extensibility.configuration-error');
  });
});
