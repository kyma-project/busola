export const SERVERLESS_API_VERSION = 'serverless.kyma-project.io/v1alpha1';
export const SERVERLESS_RESOURCE_KIND = 'Function';

export const ERRORS = {
  SERVER: 'functions.errors.server',
};

export const LAMBDA_PHASES = {
  INITIALIZING: {
    TYPE: 'INITIALIZING',
    TITLE: 'functions.statuses.initializing',
  },
  BUILDING: {
    TYPE: 'BUILDING',
    TITLE: 'functions.statuses.building',
  },
  DEPLOYING: {
    TYPE: 'DEPLOYING',
    TITLE: 'functions.statuses.deploying',
  },
  RUNNING: {
    TYPE: 'RUNNING',
    TITLE: 'functions.statuses.running',
  },
  NEW_REVISION_ERROR: {
    TYPE: 'NEW_REVISION_ERROR',
    TITLE: 'functions.statuses.new-revision-error',
  },
  FAILED: {
    TYPE: 'FAILED',
    TITLE: 'functions.statuses.failed',
    MESSAGE: `functions.statuses.failed-message`,
  },
};

export const PRETTY_RUNTIME_NODEJS12_NAME = 'Node.js 12';
export const PRETTY_RUNTIME_NODEJS14_NAME = 'Node.js 14';
export const PRETTY_RUNTIME_PYTHON38_NAME = 'Python 3.8 - Deprecated';
export const PRETTY_RUNTIME_PYTHON39_NAME = 'Python 3.9';

export const LAMBDA_ERROR_PHASES = [
  LAMBDA_PHASES.FAILED.TYPE,
  LAMBDA_PHASES.NEW_REVISION_ERROR.TYPE,
];

export const LAMBDAS_LIST = {
  CREATE_MODAL: {
    INPUTS: {
      NAME: {
        ERRORS: {
          EMPTY: 'functions.create-view.errors.required-name',
          INVALID: 'common.tooltips.k8s-name-input',
          TOO_LONG: 'functions.create-view.errors.too-long',
        },
      },
      SOURCE_TYPE: {
        OPTIONS: [
          {
            VALUE: 'functions.create-view.labels.inline-editor',
            KEY: '',
          },
          {
            VALUE: 'functions.create-view.labels.git-repository',
            KEY: 'git',
          },
        ],
      },
      REFERENCE: {
        PLACEHOLDER: 'Enter a branch name or commit revision (Required)',
      },
      BASE_DIR: {
        PLACEHOLDER: 'Enter a base directory (Required)',
      },
    },
  },
};

export const FUNCTION_SOURCE_TYPE = {
  INLINE: 'Inline editor',
  GIT: 'Git repository',
};

export const REPOSITORIES_LIST = {
  MODAL_INPUTS: {
    NAME: {
      ERRORS: {
        EMPTY: 'functions.repository-list.errors.req-name',
        INVALID: 'functions.repository-list.errors.invalid-url',
        TOO_LONG: 'functions.repository-list.errors.too-long-name',
      },
    },
    URL: {
      PLACEHOLDER: 'Enter the URL address of your Git repository (Required)',
    },
    AUTH_TYPE: {
      OPTIONS: [
        {
          VALUE: 'Public',
          KEY: '',
        },
        {
          VALUE: 'Basic',
          KEY: 'basic',
        },
        {
          VALUE: 'SSH key',
          KEY: 'key',
        },
      ],
    },
    SECRET_NAME: {
      PLACEHOLDER: 'Enter a Secret name with credentials (Required)',
      ERRORS: {
        INVALID: `common.tooltips.k8s-name-input`,
        EMPTY: 'functions.repository-list.errors.req-sec-name',
        TOO_LONG: 'functions.repository-list.errors.too-long-sec-name',
      },
    },
  },
};

export const SERVICE_URL = `/api/v1/namespaces/{namespace}/services/{name}`;

//Remove after old Service catalog removal
export const SERVICE_BINDINGS_PANEL = {
  LIST: {
    TITLE: 'Service Bindings',
    ERRORS: {
      RESOURCES_NOT_FOUND:
        "This Function doesn't have any Service Bindings yet.",
      NOT_MATCHING_SEARCH_QUERY:
        "Couldn't find Service Bindings matching this query.",
    },
  },
  CREATE_MODAL: {
    OPEN_BUTTON: {
      TEXT: 'Create Service Binding',
      NOT_ENTRIES_POPUP_MESSAGE:
        'There are no Service Instances available to bind in this Namespace. Create a Service Instance first.',
    },
    TITLE: 'Create Service Binding',
    CONFIRM_BUTTON: {
      TEXT: 'Create',
      POPUP_MESSAGES: {
        NO_SERVICE_INSTANCE_SELECTED: 'You must select a Service Instance.',
        NO_SECRET_SELECTED: 'You must create or select a Secret.',
      },
    },
  },
  FORM: {
    NO_SECRETS_FOUND:
      'There are no Secrets available. Create a new Secret to bind the Service Instance.',
  },
};

export const REPOSITORY_CONFIG_PANEL = {
  INPUTS: {
    REFERENCE: {
      PLACEHOLDER: 'Enter a branch name or commit revision (Required)',
    },
    BASE_DIR: {
      PLACEHOLDER: 'Enter a base directory (Required)',
    },
  },
};
