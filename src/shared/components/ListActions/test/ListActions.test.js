import ListActions from 'shared/components/ListActions/ListActions';
import '@ui5/webcomponents-icons/dist/AllIcons.js';

import 'core-js/es/array/flat-map';
import { act, queryByAttribute, render, waitFor } from '@testing-library/react';

describe('ListActions', () => {
  it('Renders only standalone buttons', async () => {
    const entry = { id: '123' };
    const actions = [
      { name: 'action1', handler: vi.fn() },
      { name: 'action2', handler: vi.fn() },
    ];
    const { container, queryByText } = render(
      <ListActions actions={actions} entry={entry} />,
    );

    await waitFor(async () => {
      await act(async () => {
        expect(
          queryByAttribute('accessible-name', container, 'more-actions'),
        ).toBeFalsy();

        expect(queryByText(actions[0].name)).toBeInTheDocument();
        expect(queryByText(actions[1].name)).toBeInTheDocument();

        actions.forEach(action => {
          const actionButton = queryByAttribute(
            'accessible-name',
            container,
            action.name,
          );
          expect(actionButton).toBeTruthy();

          actionButton.click();

          expect(action.handler).toHaveBeenCalledWith(entry);
        });
      });
    });
  });

  it('Renders more actions dropdown', async () => {
    const actions = [
      { name: 'action1', handler: vi.fn() },
      { name: 'action2', handler: vi.fn() },
      { name: 'action3', handler: vi.fn() },
      { name: 'action4', handler: vi.fn() },
    ];
    const { container, queryByText } = render(
      <ListActions actions={actions} entry={{}} />,
    );

    await waitFor(async () => {
      await act(async () => {
        const moreActionsButton = queryByAttribute(
          'accessible-name',
          container,
          'more-actions',
        );
        expect(moreActionsButton).toBeInTheDocument();
        expect(queryByText(actions[0].name)).toBeInTheDocument();
        expect(queryByText(actions[3].name)).not.toBeInTheDocument();

        moreActionsButton.click();

        expect(queryByText(actions[1].name)).toBeInTheDocument();
      });
    });
  });

  it('Renders icon for standalone button', () => {
    const actions = [{ name: 'action', handler: vi.fn(), icon: 'edit' }];
    const { container, queryByText } = render(
      <ListActions actions={actions} entry={{}} />,
    );

    const actionButton = queryByAttribute(
      'accessible-name',
      container,
      actions[0].name,
    );
    expect(actionButton).toBeInTheDocument();
    expect(actionButton).toHaveAttribute('icon', 'edit');

    expect(queryByText(actions[0].name)).not.toBeInTheDocument();
  });

  it('Renders predefined icons', () => {
    const actions = [
      { name: 'Edit', handler: vi.fn() },
      { name: 'Delete', handler: vi.fn() },
    ];
    const { container } = render(<ListActions actions={actions} entry={{}} />);

    const editButton = queryByAttribute('accessible-name', container, 'Edit');
    expect(editButton).toHaveAttribute('icon', 'edit');

    const deleteButton = queryByAttribute(
      'accessible-name',
      container,
      'Delete',
    );
    expect(deleteButton).toHaveAttribute('icon', 'delete');
  });

  it('Can override predefined icons', () => {
    const actions = [
      { name: 'Edit', handler: vi.fn(), icon: 'add' },
      { name: 'Delete', handler: vi.fn(), icon: 'delete' },
    ];
    const { container } = render(<ListActions actions={actions} entry={{}} />);

    const editButton = queryByAttribute('accessible-name', container, 'Edit');
    expect(editButton).toHaveAttribute('icon', 'add');

    const deleteButton = queryByAttribute(
      'accessible-name',
      container,
      'Delete',
    );
    expect(deleteButton).toHaveAttribute('icon', 'delete');
  });
});
