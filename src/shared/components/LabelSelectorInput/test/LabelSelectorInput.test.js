import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import { LabelSelectorInput } from 'shared/components/LabelSelectorInput/LabelSelectorInput';

describe('LabelSelectorInput', () => {
  const mockChange = jest.fn();
  afterEach(() => {
    mockChange.mockReset();
  });

  it('Renders readonly labels', () => {
    const { queryByText } = render(
      <LabelSelectorInput readonlyLabels={{ a: 'a', b: 'b' }} />,
    );
    expect(queryByText('a=a')).toBeInTheDocument();
    expect(queryByText('b=b')).toBeInTheDocument();
  });

  it('Renders labels', () => {
    const { queryByText } = render(
      <LabelSelectorInput labels={{ a: 'a', b: 'b' }} />,
    );
    expect(queryByText('a=a')).toBeInTheDocument();
    expect(queryByText('b=b')).toBeInTheDocument();
  });

  it(`Doesn't fire onChange with invalid label`, () => {
    const { queryByPlaceholderText } = render(
      <LabelSelectorInput onChange={mockChange} />,
    );
    const input = queryByPlaceholderText(
      'components.label-selector-input.enter-key-value',
    );

    fireEvent.change(input, { target: { value: 'abc' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(mockChange.mock.calls.length).toBe(0);
  });

  it(`Fires onChange when valid label is entered`, () => {
    const { queryByPlaceholderText } = render(
      <LabelSelectorInput onChange={mockChange} />,
    );
    const input = queryByPlaceholderText(
      'components.label-selector-input.enter-key-value',
    );

    fireEvent.change(input, { target: { value: 'abc=def' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(mockChange.mock.calls.length).toBe(1);
    expect(mockChange.mock.calls[0]).toEqual([{ abc: 'def' }]);
  });

  it(`Allows to remove labels`, () => {
    const { getByText } = render(
      <LabelSelectorInput labels={{ a: 'a', b: 'b' }} onChange={mockChange} />,
    );

    fireEvent.click(getByText('a=a').parentElement.querySelector('button'));

    expect(mockChange.mock.calls.length).toBe(1);
    expect(mockChange.mock.calls[0]).toEqual([{ b: 'b' }]);
  });

  it(`Doesn' allow to remove readonly labels`, () => {
    const { getByText } = render(
      <LabelSelectorInput
        readonlyLabels={{ a: 'a', b: 'b' }}
        onChange={mockChange}
      />,
    );

    fireEvent.click(getByText('a=a'));

    expect(mockChange.mock.calls.length).toBe(0);
  });
});
