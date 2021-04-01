export const SERVICE_BINDINGS_PANEL = {
  LIST: {
    TITLE: 'Service Bindings Usages',
    ERRORS: {
      RESOURCES_NOT_FOUND:
        "This Function doesn't have any Service Bindings Usages yet.",
      NOT_MATCHING_SEARCH_QUERY:
        "Couldn't find Service Bindings Usages matching this query.",
    },
  },
  CREATE_MODAL: {
    OPEN_BUTTON: {
      TEXT: 'Create Service Binding Usage',
      NOT_ENTRIES_POPUP_MESSAGE:
        'There are no Applications available to bind in this Namespace. Create an Application first.',
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
    SUCCESS_MESSAGE: 'Succesfully deleted Service Binding Usage',
    ERROR_MESSAGE: 'Failed to delete the Service Binding Usage',
  },
  CREATE_BINDING_USAGE: {
    SUCCESS_MESSAGE: `Service Binding Usage was created.`, //TODO
    ERROR_MESSAGE: `Couldn't create the Service Binding Usage.`,
  },
};
