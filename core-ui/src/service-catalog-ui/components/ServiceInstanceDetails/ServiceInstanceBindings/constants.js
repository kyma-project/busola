export const SERVICE_BINDINGS_PANEL = {
  CREATE_MODAL: {
    OPEN_BUTTON: {
      TEXT: 'Create Service Binding Usage',
      NO_ENTRIES_POPUP_MESSAGE:
        'There are no Applications available to bind in this Namespace. Create an Application first.',
      NOT_READY_POPUP_MESSAGE:
        'The Service Instance must be in a running state.',
    },
    TITLE: 'Create Service Binding Usage',
    CONFIRM_BUTTON: {
      TEXT: 'Create',
      POPUP_MESSAGES: {
        NO_APP_SELECTED: 'You must select an Application.',
        NO_BINDING_SELECTED: 'You must create or select a Service Binding.',
      },
    },
  },
  FORM: {
    NO_BINDINGS_FOUND:
      'There are no Service Bindings available. Create a new Service Binding to bind the Application.',
  },
  DELETE_BINDING_USAGE: {
    SUCCESS_MESSAGE: 'Service Binding Usage deleted',
    ERROR_MESSAGE: 'Failed to delete the Service Binding Usage',
  },
  CREATE_BINDING_USAGE: {
    SUCCESS_MESSAGE: `Service Binding Usage was created.`,
  },
  NOT_BINDABLE: 'Service Instance not bindable. Binding panel not available.',
};
