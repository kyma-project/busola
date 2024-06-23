import { render, fireEvent, waitFor, act } from '@testing-library/react';
import { Pagination } from 'shared/components/GenericList/Pagination/Pagination';
import { ThemeProvider } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/AllIcons.js';

describe('Pagination', () => {
  it('Renders valid count of pages', () => {
    const { container, queryByText } = render(
      <ThemeProvider>
        <Pagination
          itemsTotal={25}
          itemsPerPage={20}
          currentPage={1}
          onChangePage={jest.fn()}
          setLocalPageSize={jest.fn()}
        />
      </ThemeProvider>,
    );

    expect(container.querySelector('ui5-input').value).toBe('1');
    expect(queryByText('2')).toBeInTheDocument();
    expect(queryByText('3')).not.toBeInTheDocument();
  });

  it('Renders valid count of pages - custom page size', () => {
    const { container, queryByText, queryAllByText } = render(
      <ThemeProvider>
        <Pagination
          itemsTotal={90}
          currentPage={5}
          itemsPerPage={10}
          onChangePage={jest.fn()}
          setLocalPageSize={jest.fn()}
        />
      </ThemeProvider>,
    );

    expect(queryByText('1')).toBeInTheDocument();
    expect(queryByText('2')).not.toBeInTheDocument();
    expect(queryByText('3')).toBeInTheDocument();
    expect(queryByText('4')).toBeInTheDocument();
    expect(container.querySelector('ui5-input').value).toBe('5');
    expect(queryByText('6')).toBeInTheDocument();
    expect(queryByText('7')).toBeInTheDocument();
    expect(queryByText('8')).not.toBeInTheDocument();
    expect(queryByText('9')).toBeInTheDocument();

    const placeholders = queryAllByText('...');
    expect(placeholders.length).toBe(2);
  });

  it('Fire events', async () => {
    const callback = jest.fn();
    const { getByText, getByLabelText } = render(
      <ThemeProvider>
        <Pagination
          itemsTotal={200}
          currentPage={5}
          itemsPerPage={20}
          onChangePage={callback}
          setLocalPageSize={jest.fn()}
        />
      </ThemeProvider>,
    );

    await waitFor(async () => {
      await act(async () => {
        fireEvent.click(getByText('6'));
        expect(callback).toHaveBeenCalledWith(6);

        fireEvent.click(getByLabelText('Next page'));
        expect(callback).toHaveBeenCalledWith(6);

        fireEvent.click(getByLabelText('Previous page'));
        expect(callback).toHaveBeenCalledWith(4);
      });
    });
  });

  it('Disables correct links', () => {
    const { container, getByText, getByLabelText, rerender } = render(
      <ThemeProvider>
        <Pagination
          itemsTotal={60}
          itemsPerPage={20}
          currentPage={1}
          onChangePage={jest.fn()}
          setLocalPageSize={jest.fn()}
        />
      </ThemeProvider>,
    );
    expect(getByLabelText('Previous page')).toBeDisabled();
    expect(container.querySelector('ui5-input')).not.toBeDisabled();
    expect(getByText('2')).not.toBeDisabled();
    expect(getByText('3')).not.toBeDisabled();
    expect(getByLabelText('Next page')).not.toBeDisabled();

    rerender(
      <ThemeProvider>
        <Pagination
          itemsTotal={60}
          itemsPerPage={20}
          currentPage={3}
          onChangePage={jest.fn()}
          setLocalPageSize={jest.fn()}
        />
      </ThemeProvider>,
    );
    expect(getByLabelText('Previous page')).not.toBeDisabled();
    expect(getByLabelText('Next page')).toBeDisabled();

    rerender(
      <ThemeProvider>
        <Pagination
          itemsTotal={60}
          itemsPerPage={20}
          currentPage={2}
          onChangePage={jest.fn()}
          setLocalPageSize={jest.fn()}
        />
      </ThemeProvider>,
    );
    expect(getByLabelText('Previous page')).not.toBeDisabled();
    expect(getByLabelText('Next page')).not.toBeDisabled();
  });
});
