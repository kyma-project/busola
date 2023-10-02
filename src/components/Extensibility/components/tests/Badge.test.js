import React from 'react';
import { shallow } from 'enzyme';
import { render } from '@testing-library/react';
import { Badge } from '../Badge';
import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';

jest.mock('../../hooks/useJsonata', () => ({
  useJsonata: () => {
    return structure => [structure];
  },
}));

describe('Badge', () => {
  it('Renders a badge with a default type', () => {
    const value = 'Unknown';
    const structure = {};

    const wrapper = shallow(<Badge value={value} structure={structure} />);
    const status = wrapper.find(StatusBadge);
    const badgeProps = status.props();
    expect(badgeProps.type).toEqual(null);
    expect(badgeProps.autoResolveType).toEqual(true);
    expect(status).toHaveLength(1);
  });

  it('Renders a badge with success type for custom highlights', () => {
    const value = 'yes';
    const structure = {
      highlights: {
        Success: ['yes', 'ok'],
      },
    };

    const wrapper = shallow(<Badge value={value} structure={structure} />);
    const status = wrapper.find(StatusBadge);
    const badgeProps = status.props();
    expect(badgeProps.type).toEqual('Success');
    expect(badgeProps.autoResolveType).toEqual(false);
    expect(status).toHaveLength(1);
  });

  it('Renders a badge with error type for custom highlights', () => {
    const value = -2;
    const structure = {
      highlights: {
        Error: 'data < 0',
      },
    };

    const wrapper = shallow(<Badge value={value} structure={structure} />);
    const status = wrapper.find(StatusBadge);
    const badgeProps = status.props();
    expect(badgeProps.type).toEqual('Error');
    expect(badgeProps.autoResolveType).toEqual(false);
    expect(status).toHaveLength(1);
  });

  it('Renders a custom empty placeholder for empty values', () => {
    const value = null;
    const structure = {
      placeholder: 'empty',
    };

    const { getByText } = render(<Badge value={value} structure={structure} />);
    expect(getByText('extensibility::empty')).toBeVisible();
  });

  it('Renders a default placeholder for empty values', () => {
    const value = null;
    const structure = {};

    const { getByText } = render(<Badge value={value} structure={structure} />);
    expect(getByText('-')).toBeVisible();
  });

  it('Renders a badge with a tooltip', () => {
    const value = 'yes';
    const structure = {
      description: 'tooltip',
    };

    const wrapper = shallow(<Badge value={value} structure={structure} />);
    const status = wrapper.find(StatusBadge);
    const tooltip = wrapper.find(Tooltip);
    const tooltipProps = tooltip.props();
    expect(tooltipProps.content).toEqual('tooltip');
    expect(status).toHaveLength(1);
    expect(tooltip).toHaveLength(1);
  });
});
