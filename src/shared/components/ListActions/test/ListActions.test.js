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
    const { queryByLabelText, queryAllByRole } = render(
      <ListActions actions={actions} entry={entry} />,
    );

    expect(queryByLabelText('more-actions')).toBeFalsy();
    expect(queryAllByRole('button')).toHaveLength(2);

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
    expect(actionButton.querySelector('i')).toHaveClass('sap-icon--edit');

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
    expect(editButton.querySelector('i')).toHaveClass('sap-icon--edit');

    const deleteButton = getByLabelText('Delete');
    expect(deleteButton.querySelector('i')).toHaveClass('sap-icon--delete');
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
    expect(editButton.querySelector('i')).not.toHaveClass('sap-icon--edit');
    expect(editButton.querySelector('i')).toHaveClass('sap-icon--add');

    const deleteButton = getByLabelText('Delete');
    expect(deleteButton.querySelector('i')).not.toHaveClass('sap-icon--delete');
    expect(deleteButton.querySelector('i')).toHaveClass('sap-icon--minus');
  });
});
