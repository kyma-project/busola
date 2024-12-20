import { render, screen } from '@testing-library/react';
import { Columns } from '../Columns';
import { ThemeProvider } from '@ui5/webcomponents-react';

vi.mock('components/Extensibility/ExtensibilityCreate', () => {
  return {
    default: () => ({}),
  };
});
vi.mock('components/Extensibility/ExtensibilityWizard', () => {
  return {
    default: () => ({}),
  };
});

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

    render(
      <ThemeProvider>
        <Columns structure={structure} />
      </ThemeProvider>,
    );
    const widget = screen.getByTestId('extensibility-columns');
    expect(widget.childElementCount).toBe(2);
  });

  it('Renders columns', () => {
    const structure = {};

    render(
      <ThemeProvider>
        <Columns structure={structure} />
      </ThemeProvider>,
    );
    const widget = screen.getByTestId('extensibility-columns');
    expect(widget.childElementCount).toBe(0);
  });
});
