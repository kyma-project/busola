import { mount, shallow } from 'enzyme';
import { act, render } from '@testing-library/react';
import { Badge } from '../Badge';
import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';
import { PopoverBadge } from 'shared/components/PopoverBadge/PopoverBadge';
import { ThemeProvider } from '@ui5/webcomponents-react';

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
        success: ['yes', 'ok'],
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
        critical: 'data < 0',
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

  it('Renders a badge with a popover', () => {
    const value = 'yes';
    const structure = {
      description: 'popover',
    };

    let wrapper;
    act(() => {
      wrapper = mount(
        <ThemeProvider>
          <Badge value={value} structure={structure} />
        </ThemeProvider>,
      );
    });
    const status = wrapper.find(StatusBadge);
    const popoverBadge = status.find(PopoverBadge);
    const popoverProps = popoverBadge.props();

    expect(popoverProps.tooltipContent).toEqual('popover');
    expect(status).toHaveLength(1);
    expect(popoverBadge).toHaveLength(1);
  });
});
