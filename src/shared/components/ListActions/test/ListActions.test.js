import React from 'react';
import ListActions from 'shared/components/ListActions/ListActions';

import 'core-js/es/array/flat-map';
import { render } from '@testing-library/react';

describe('ListActions', () => {
  it('Renders only standalone buttons', () => {
    const entry = { id: '123' };
    const actions = [
      { name: 'action1', handler: jest.fn() },
      { name: 'action2', handler: jest.fn() },
    ];
    const { queryByText, queryByLabelText } = render(
      <ListActions actions={actions} entry={entry} />,
    );

    expect(queryByLabelText('more-actions')).toBeFalsy();

    expect(queryByText(actions[0].name)).toBeInTheDocument();
    expect(queryByText(actions[1].name)).toBeInTheDocument();

    actions.forEach(action => {
      const actionButton = queryByLabelText(action.name);
      expect(actionButton).toBeTruthy();

      actionButton.click();

      expect(action.handler).toHaveBeenCalledWith(entry);
    });
  });

  it('Renders more actions dropdown', () => {
    const actions = [
      { name: 'action1', handler: jest.fn() },
      { name: 'action2', handler: jest.fn() },
      { name: 'action3', handler: jest.fn() },
      { name: 'action4', handler: jest.fn() },
    ];
    const { queryByText, queryByLabelText } = render(
      <ListActions actions={actions} entry={{}} />,
    );

    const moreActionsButton = queryByLabelText('more-actions');
    expect(moreActionsButton).toBeInTheDocument();
    expect(queryByText(actions[0].name)).toBeInTheDocument();
    expect(queryByText(actions[3].name)).not.toBeInTheDocument();

    moreActionsButton.click();

    expect(queryByText(actions[1].name)).toBeInTheDocument();
  });

  it('Renders icon for standalone button', () => {
    const actions = [{ name: 'action', handler: jest.fn(), icon: 'edit' }];
    const { queryByText, queryByLabelText } = render(
      <ListActions actions={actions} entry={{}} />,
    );

    const actionButton = queryByLabelText(actions[0].name);
    expect(actionButton).toBeInTheDocument();
    expect(actionButton).toHaveAttribute('icon', 'edit');

    expect(queryByText(actions[0].name)).not.toBeInTheDocument();
  });

  it('Renders predefined icons', () => {
    const actions = [
      { name: 'Edit', handler: jest.fn() },
      { name: 'Delete', handler: jest.fn() },
    ];
    const { getByLabelText } = render(
      <ListActions actions={actions} entry={{}} />,
    );

    const editButton = getByLabelText('Edit');
    expect(editButton).toHaveAttribute('icon', 'edit');

    const deleteButton = getByLabelText('Delete');
    expect(deleteButton).toHaveAttribute('icon', 'delete');
  });

  it('Can override predefined icons', () => {
    const actions = [
      { name: 'Edit', handler: jest.fn(), icon: 'add' },
      { name: 'Delete', handler: jest.fn(), icon: 'minus' },
    ];
    const { getByLabelText } = render(
      <ListActions actions={actions} entry={{}} />,
    );

    const editButton = getByLabelText('Edit');
    expect(editButton).toHaveAttribute('icon', 'add');

    const deleteButton = getByLabelText('Delete');
    expect(deleteButton).toHaveAttribute('icon', 'minus');
  });
});
