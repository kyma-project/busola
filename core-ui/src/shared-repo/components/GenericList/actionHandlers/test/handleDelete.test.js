import { handleDelete } from '../simpleDelete';

const mockModal = jest.fn();

const typePlurar = 'resources';
const id = 'some-id';
const name = 'some-name';

jest.mock('@luigi-project/client', () => ({
  uxManager: () => ({
    showConfirmationModal: mockModal,
  }),
}));

const t = key => key;

describe('simpleDelete', () => {
  it('Calls delete function and custom callback with valid parameters', async () => {
    mockModal.mockImplementation(() => new Promise(resolve => resolve()));

    const notificationManager = {
      notifyError: jest.fn(),
      notifySuccess: jest.fn(),
    };
    const deleteFunction = jest.fn();
    const customCallback = jest.fn();

    await handleDelete(
      typePlurar,
      id,
      name,
      notificationManager,
      deleteFunction,
      customCallback,
      t,
    );
    expect(mockModal).toHaveBeenCalled();
    expect(mockModal.mock.calls[0][0].body).toBe(
      'components.generic-list.acion-header.messages.confirmation',
    );

    expect(deleteFunction).toHaveBeenCalledWith(id, name);
    expect(customCallback).toHaveBeenCalled();
    expect(notificationManager.notifyError).not.toHaveBeenCalled();
  });

  it('Does not call any functions when user cancels', async () => {
    mockModal.mockImplementation(
      () => new Promise((_resolve, reject) => reject()),
    );
    const notificationManager = {
      notifyError: jest.fn(),
      notifySuccess: jest.fn(),
    };
    const deleteFunction = jest.fn();
    const customCallback = jest.fn();

    await handleDelete(
      typePlurar,
      id,
      name,
      notificationManager,
      deleteFunction,
      customCallback,
      t,
    );

    expect(deleteFunction).not.toHaveBeenCalled();
    expect(customCallback).not.toHaveBeenCalled();
    expect(notificationManager.notifyError).not.toHaveBeenCalled();
  });

  it('Does not call custom callback and shows alert on delete function error', async () => {
    mockModal.mockImplementation(() => new Promise(resolve => resolve()));
    const deleteFunction = () => {
      throw Error('DANGER');
    };
    const notificationManager = {
      notifyError: jest.fn(),
      notifySuccess: jest.fn(),
    };
    const customCallback = jest.fn();

    await handleDelete(
      typePlurar,
      id,
      name,
      notificationManager,
      deleteFunction,
      customCallback,
      t,
    );

    expect(notificationManager.notifyError).toHaveBeenCalled();
    expect(customCallback).not.toHaveBeenCalled();
  });
});
