import React from 'react';
import { shallow } from 'enzyme';
import { Columns } from '../Columns';
import { Widget } from '../Widget';

jest.mock('components/Extensibility/ExtensibilityCreate', () => null);

describe('Columns', () => {
  it('Renders columns', () => {
    const structure = {
      children: [
        {
          name: 'columns.left',
          widget: 'Panel',
          children: [{ path: 'spec.value1' }],
        },
        {
          name: 'columns.right',
          widget: 'Panel',
          children: [{ path: 'spec.value2' }],
        },
      ],
    };

    const component = shallow(<Columns structure={structure} />);
    const widget = component.find(Widget);
    expect(widget).toHaveLength(2);
  });

  it('Renders columns', () => {
    const structure = {};

    const component = shallow(<Columns structure={structure} />);
    const widget = component.find(Widget);
    expect(widget).toHaveLength(0);
  });
});
