import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Pagination } from 'shared/components/GenericList/Pagination/Pagination';

describe('Pagination', () => {
  it('Renders valid count of pages', () => {
    const { queryByText } = render(
      <Pagination
        itemsTotal={25}
        itemsPerPage={20}
        currentPage={1}
        onChangePage={jest.fn()}
      />,
    );

    expect(queryByText('1')).toBeInTheDocument();
    expect(queryByText('2')).toBeInTheDocument();
    expect(queryByText('3')).not.toBeInTheDocument();
  });

  it('Renders valid count of pages - custom page size', () => {
    const { queryByText } = render(
      <Pagination
        itemsTotal={25}
        currentPage={0}
        itemsPerPage={10}
        onChangePage={jest.fn()}
      />,
    );

    expect(queryByText('1')).toBeInTheDocument();
    expect(queryByText('2')).toBeInTheDocument();
    expect(queryByText('3')).toBeInTheDocument();
    expect(queryByText('4')).not.toBeInTheDocument();
  });

  it('Fire events', () => {
    const callback = jest.fn();
    const { getByText, getByLabelText } = render(
      <Pagination
        itemsTotal={200}
        currentPage={5}
        itemsPerPage={20}
        onChangePage={callback}
      />,
    );
    fireEvent.click(getByText('6'));
    expect(callback).toHaveBeenCalledWith(6);

    fireEvent.click(getByLabelText('Next page'));
    expect(callback).toHaveBeenCalledWith(6);

    fireEvent.click(getByLabelText('Previous page'));
    expect(callback).toHaveBeenCalledWith(4);
  });

  it('Disables correct links', () => {
    const { getByText, getByLabelText, rerender } = render(
      <Pagination
        itemsTotal={60}
        itemsPerPage={20}
        currentPage={1}
        onChangePage={jest.fn()}
      />,
    );
    expect(getByLabelText('Previous page')).toBeDisabled();
    expect(getByText('1')).toBeDisabled();
    expect(getByText('2')).not.toBeDisabled();
    expect(getByText('3')).not.toBeDisabled();
    expect(getByLabelText('Next page')).not.toBeDisabled();

    rerender(
      <Pagination
        itemsTotal={60}
        itemsPerPage={20}
        currentPage={3}
        onChangePage={jest.fn()}
      />,
    );
    expect(getByLabelText('Previous page')).not.toBeDisabled();
    expect(getByLabelText('Next page')).toBeDisabled();

    rerender(
      <Pagination
        itemsTotal={60}
        itemsPerPage={20}
        currentPage={2}
        onChangePage={jest.fn()}
      />,
    );
    expect(getByLabelText('Previous page')).not.toBeDisabled();
    expect(getByLabelText('Next page')).not.toBeDisabled();
  });
});
