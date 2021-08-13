export const FUNCTIONS_WINDOW_TITLE = 'Functions';
export const FIRST_BREADCRUMB_NODE = 'Functions';

export const SERVERLESS_API_VERSION = 'serverless.kyma-project.io/v1alpha1';
export const SERVERLESS_RESOURCE_KIND = 'Function';

export const SERVERLESS_FUNCTION_REPLICAS_PRESET_LABEL =
  'serverless.kyma-project.io/function-replicas-preset';
export const SERVERLESS_FUNCTION_RESOURCES_PRESET_LABEL =
  'serverless.kyma-project.io/function-resources-preset';
export const SERVERLESS_BUILD_RESOURCES_PRESET_LABEL =
  'serverless.kyma-project.io/build-resources-preset';
export const SERVERLESS_PRESETS_LABELS = [
  SERVERLESS_FUNCTION_REPLICAS_PRESET_LABEL,
  SERVERLESS_FUNCTION_RESOURCES_PRESET_LABEL,
  SERVERLESS_BUILD_RESOURCES_PRESET_LABEL,
];

export const REFETCH_LAMBDAS_TIMEOUT = 2000;

export const BUTTONS = {
  CANCEL: 'Cancel',
  DELETE: 'Delete',
};

export const ERRORS = {
  SERVER: 'Server error. Contact your cluster admin.',
  RESOURCES_NOT_FOUND: "This lambda doesn't have any related resources yet.",
  NOT_MATCHING_SEARCH_QUERY: "Couldn't find resources matching this query.",
  NOT_MATCHING_FILTERS: "Couldn't find resources matching these filters.",
};

export const LAMBDA_PHASES = {
  INITIALIZING: {
    TYPE: 'INITIALIZING',
    TITLE: 'Initializing',
  },
  BUILDING: {
    TYPE: 'BUILDING',
    TITLE: 'Building',
  },
  DEPLOYING: {
    TYPE: 'DEPLOYING',
    TITLE: 'Deploying',
  },
  RUNNING: {
    TYPE: 'RUNNING',
    TITLE: 'Running',
  },
  NEW_REVISION_ERROR: {
    TYPE: 'NEW_REVISION_ERROR',
    TITLE: 'New Revision Error',
    MESSAGE: `A new revision couldn't be created due to an error.`,
  },
  FAILED: {
    TYPE: 'FAILED',
    TITLE: 'Failed',
    MESSAGE: `Function couldn't be processed.`,
  },
  ERROR_SUFFIX: 'Error: {error}',
};

export const PRETTY_RUNTIME_NODEJS12_NAME = 'Node.js 12';
export const PRETTY_RUNTIME_NODEJS14_NAME = 'Node.js 14';
export const PRETTY_RUNTIME_PYTHON38_NAME = 'Python 3.8 - Deprecated';
export const PRETTY_RUNTIME_PYTHON39_NAME = 'Python 3.9';

export const LAMBDA_ERROR_PHASES = [
  LAMBDA_PHASES.FAILED.TYPE,
  LAMBDA_PHASES.NEW_REVISION_ERROR.TYPE,
];

export const TOOLBAR = {
  TITLE: 'Functions',
  DESCRIPTION:
    'Extend your applications with Functions that you can trigger with incoming events and expose outside the cluster with API Rules.',
};

export const LAMBDAS_LIST = {
  TAB_TITLE: 'Functions',
  ERRORS: {
    RESOURCES_NOT_FOUND: 'There are no Functions in this Namespace yet.',
    NOT_MATCHING_SEARCH_QUERY: "Couldn't find Functions matching this query.",
  },
  CREATE_MODAL: {
    TITLE: 'Create Function',
    OPEN_BUTTON: {
      TEXT: 'Create Function',
    },
    CONFIRM_BUTTON: {
      TEXT: 'Create',
    },
    ERRORS: {
      INVALID: 'At least one field is empty or incorrectly formatted.',
      NO_REPOSITORY_FOUND:
        'There are no Repositories available. Create a new Repository first.',
    },
    INPUTS: {
      NAME: {
        ERRORS: {
          EMPTY: 'Function name is required.',
          INVALID: `Name must contain lower case alphanumeric characters, can contain '-'  (like 'my-name1').`,
          TOO_LONG: 'Function name cannot be longer than 63 characters.',
        },
      },
      RUNTIME: {
        LABEL: 'Runtime',
        INLINE_HELP: `Runtime on which your Function will run`,
      },
      SOURCE_TYPE: {
        LABEL: 'Source Type',
        INLINE_HELP: `Type of your Function's code source: Inline editor (code and dependencies are provided as plain text) or Git repository (code and dependencies are fetched from a Git repository)`,
        OPTIONS: [
          {
            VALUE: 'Inline editor',
            KEY: '',
          },
          {
            VALUE: 'Git repository',
            KEY: 'git',
          },
        ],
      },
      REPOSITORY: {
        LABEL: 'Repository',
        INLINE_HELP: `Repository which you want to use`,
      },
      REFERENCE: {
        LABEL: 'Reference',
        INLINE_HELP: `Reference to the Function's source. Select a branch name or commit revision.`,
        PLACEHOLDER: 'Enter a branch name or commit revision (Required)',
        ERRORS: {
          EMPTY: 'Reference is required.',
        },
      },
      BASE_DIR: {
        LABEL: 'Base Directory',
        INLINE_HELP: `Directory with Function's code and dependencies`,
        PLACEHOLDER: 'Enter a base directory (Required)',
        ERRORS: {
          EMPTY: 'Base Directory is required.',
        },
      },
    },
  },
};

export const FUNCTION_SOURCE_TYPE = {
  INLINE: 'Inline editor',
  GIT: 'Git repository',
};

export const REPOSITORIES_LIST = {
  TAB_TITLE: 'Repositories',
  ERRORS: {
    RESOURCES_NOT_FOUND: 'There are no Repositories in this Namespace yet.',
    NOT_MATCHING_SEARCH_QUERY:
      "Couldn't find Repositories matching this query.",
  },
  CREATE_MODAL: {
    TITLE: 'Connect Repository',
    OPEN_BUTTON: {
      TEXT: 'Connect Repository',
    },
    CONFIRM_BUTTON: {
      TEXT: 'Connect',
    },
  },
  UPDATE_MODAL: {
    TITLE: 'Update Repository {repositoryName}',
    CONFIRM_BUTTON: {
      TEXT: 'Update',
    },
  },
  MODAL_ERROR: 'At least one field is empty or incorrectly formatted.',
  MODAL_INPUTS: {
    NAME: {
      ERRORS: {
        EMPTY: 'Repository name is required.',
        INVALID: `Invalid Repository URL. The URL must start with the "http(s)", "git", or "ssh" prefix and end with the ".git" suffix.`,
        DUPLICATED:
          'There is already a Repository with the same name in this Namespace.',
        TOO_LONG: 'Repository name cannot be longer than 63 characters.',
      },
    },
    URL: {
      LABEL: 'URL',
      INLINE_HELP: `URL must be a valid Git repository address that starts with the "http(s)", "git", or "ssh" prefix and ends with the ".git" suffix.`,
      PLACEHOLDER: 'Enter the URL address of your Git repository (Required)',
      ERRORS: {
        INVALID: `Invalid Repository URL. The URL must start with the "http(s)", "git", or "ssh" prefix and end with the ".git" suffix.`,
        EMPTY: 'Enter repository URL.',
      },
    },
    AUTH_TYPE: {
      LABEL: 'Authorization',
      INLINE_HELP: `Basic: token or password / SSH key: authentication key / Public: no authentication`,
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
      LABEL: 'Secret name',
      INLINE_HELP: `Name must contain lower case alphanumeric characters, can contain '-'  (like 'my-name1').`,
      PLACEHOLDER: 'Enter a Secret name with credentials (Required)',
      ERRORS: {
        INVALID: `Name must contain lower case alphanumeric characters, can contain '-'  (like 'my-name1').`,
        EMPTY: 'Secret name is required.',
        TOO_LONG: 'Repository name cannot be longer than 63 characters.',
      },
    },
  },
};

export const REPOSITORY_AUTH = {
  PUBLIC: 'Public',
  BASIC: 'Basic',
  KEY: 'SSH key',
};

export const LAMBDA_DETAILS = {
  STATUS: {
    TITLE: 'Status',
    ERROR: {
      LINK: 'See error logs.',
      MODAL: {
        TITLE: 'Error logs from Function "{lambdaName}"',
      },
    },
  },
  LABELS: {
    TITLE: 'Labels',
    POPUP_MESSAGE: 'Edit Labels',
    EDIT_MODAL: {
      TITLE: 'Edit Labels',
      CONFIRM_BUTTON: {
        TEXT: 'Save',
        INVALID_POPUP_MESSAGE: 'Invalid label',
      },
    },
  },
  SOURCE_TYPE: {
    TEXT: 'Source Type',
  },
  RUNTIME: {
    TEXT: 'Runtime',
  },
  REPOSITORY: {
    TEXT: 'Repository',
  },
  TABS: {
    CODE: {
      TITLE: 'Code',
    },
    CONFIGURATION: {
      TITLE: 'Configuration',
    },
    RESOURCE_MANAGEMENT: {
      TITLE: 'Resources',
    },
  },
};

export const LOGS_AND_METRICS = {
  LOGS: {
    SPLIT_VIEW: {
      TITLE: 'Logs',
    },
    MODAL: {
      TITLE: 'Logs from Function "{lambdaName}"',
    },
  },
};
export const SERVICE_URL = `/api/v1/namespaces/{namespace}/services/{name}`;

export const MODALS = {
  CREATE_BINDING: {
    CREATE_BUTTON_POPUP_MESSAGE: 'At least one event must be marked.',
  },
};

export const RESOURCES_MANAGEMENT_PANEL = {
  TITLE: 'Resources and replicas',
  EDIT_MODAL: {
    OPEN_BUTTON: {
      TEXT: {
        EDIT: 'Edit Configuration',
        SAVE: 'Save',
      },
    },
    CONFIRM_BUTTON: {
      TEXT: 'Save',
      POPUP_MESSAGE: 'At least one field is invalid.',
    },
  },
  ERROR_MESSAGES: {
    CPU: {
      DEFAULT:
        'This value must be expressed as a fixed-point number or in milicpu. For example, use 100m, 0.1, or 1.',
      TOO_LOW: 'This value is too low. The minimum value is {minValue}.',
      REQUEST_TOO_HIGH:
        'This value must be equal to or lower than the equivalent value for Limits.',
      LIMITS_TOO_LOW:
        'This value must be equal to or greater than the equivalent value for Requests.',
    },
    MEMORY: {
      DEFAULT:
        'This value must be a fixed-point number with one of these suffixes: Gi, G, Mi, M, Ki, or K. For example, use 50Mi, 1000.5Ki, or 0.1G.',
      TOO_LOW: 'This value is too low. The minimum value is {minValue}.',
      REQUEST_TOO_HIGH:
        'This value must be equal to or lower than the equivalent value for Limits.',
      LIMITS_TOO_LOW:
        'This value must be equal to or greater than the equivalent value for Requests.',
    },
    MIN_REPLICAS_TOO_HIGH:
      'Minimum number of replicas has to be equal to or lower than maximum.',
    MIN_REPLICAS_POSITIVE: 'Minimum replicas must be a positive integer.',
    MAX_REPLICAS_TOO_LOW:
      'Maximum number of replicas has to be equal or greater than minimum.',
    MAX_REPLICAS_POSITIVE: 'Maximum replicas must be a positive integer.',
  },
  REPLICAS: {
    TITLE: 'Scaling Options',
    PRESET: {
      TITLE: 'Preset',
      DESCRIPTION:
        'Preset is a predefined set of values that you can customize.',
    },
    MIN_NUMBER: {
      TITLE: 'Minimum replicas',
      DESCRIPTION: 'Minimum number of running replicas.',
    },
    MAX_NUMBER: {
      TITLE: 'Maximum replicas',
      DESCRIPTION:
        'Maximum number of running replicas. Set it to 0 to disable the function.',
    },
  },
  RESOURCES: {
    TYPES: {
      FUNCTION: {
        TITLE: 'Runtime Profile',
        DESCRIPTION: `Choose one of the predefined values for Function's resources or set your own values ​​by selecting the "Custom" option.`,
      },
      BUILD_JOB: {
        TITLE: 'Build Job Profile',
        DESCRIPTION: `Choose one of the predefined values for build Job's resources or set your own values ​​by selecting the "Custom" option.`,
      },
    },
    REQUESTS: {
      TITLE: 'Requests',
      DESCRIPTION: 'Minimum amount of compute resources required.',
    },
    LIMITS: {
      TITLE: 'Limits',
      DESCRIPTION: 'Maximum amount of compute resources allowed.',
    },
    MEMORY: {
      TITLE: 'Memory',
    },
    CPU: {
      TITLE: 'CPU',
    },
  },
};

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

export const CODE_AND_DEPENDENCIES_PANEL = {
  TABS: {
    CODE: 'Source',
    DEPENDENCIES: 'Dependencies',
  },
  SAVE_BUTTON: {
    TEXT: 'Save',
    POPUP_MESSAGE: {
      EMPTY_SOURCE: 'Source cannot be empty.',
      INVALID_DEPS: 'Dependencies must be specified in a valid JSON format.',
      NO_CHANGES: 'No changes made.',
    },
  },
  DIFF_TOGGLE: 'Diff',
};

export const REPOSITORY_CONFIG_PANEL = {
  TITLE: 'Repository configuration',
  EDIT_BUTTON: {
    TEXT: 'Edit Configuration',
  },
  SAVE_BUTTON: {
    TEXT: 'Save',
  },
  ERRORS: {
    INVALID: 'At least one field is empty.',
    NO_CHANGES: 'No changes made.',
  },

  INPUTS: {
    REFERENCE: {
      LABEL: 'Reference',
      INLINE_HELP: `Reference to the Function's source. Select a branch name or commit revision.`,
      PLACEHOLDER: 'Enter a branch name or commit revision (Required)',
      ERRORS: {
        EMPTY: 'Reference is required.',
      },
    },
    BASE_DIR: {
      LABEL: 'Base Directory',
      INLINE_HELP: `Directory with Function's code and dependencies`,
      PLACEHOLDER: 'Enter a base directory (Required)',
      ERRORS: {
        EMPTY: 'Base Directory is required.',
      },
    },
  },
};

export const ENVIRONMENT_VARIABLES_PANEL = {
  LIST: {
    TITLE: 'Environment Variables',
    ERRORS: {
      RESOURCES_NOT_FOUND:
        "This Function doesn't have any environment variables yet.",
      NOT_MATCHING_SEARCH_QUERY:
        "Couldn't find environment variables matching this query.",
    },
  },
  INJECTED_LIST: {
    TITLE: 'Injected Variables via Service Bindings',
  },
  CREATE_MODAL: {
    TITLE: {
      CUSTOM: 'Create Custom Variable',
      SECRET: 'Create Variable From Secret',
      CONFIG_MAP: 'Create Variable From Config Map',
    },
    OPEN_BUTTON: {
      CUSTOM: 'Custom Variable',
      SECRET: 'Secret Variable',
      CONFIG_MAP: 'Config Map Variable',
    },
    CONFIRM_BUTTON: {
      TEXT: 'Create',
    },
  },
  EDIT_MODAL: {
    TITLE: {
      CUSTOM: 'Edit Custom Variable',
      SECRET: 'Edit Variable From Secret',
      CONFIG_MAP: 'Edit Variable From Config Map',
    },
    CONFIRM_BUTTON: {
      TEXT: 'Save',
      POPUP_MESSAGES: {
        NO_ENVS_DEFINED: 'You must define at least one variable.',
        COLLECTIONS_EQUAL: 'Changes in variables are required.',
        ERROR:
          'At least one variable has an incorrect name format, is restricted, duplicated, or empty.',
      },
    },
    ADD_ENV_BUTTON: {
      TEXT: 'Add Environment Variable',
    },
  },
  ERRORS: {
    EMPTY: 'Variable is empty.',
    DUPLICATED: 'Duplicated variable name.',
    INVALID: `Variable name must contain alphanumeric characters, can contain '_', no blank spaces.`,
    RESTRICTED:
      'This variable name is restricted and cannot be used. Try a different one.',
    INVALID_SECRET: `Select the secret name and key`,
    INVALID_CONFIG: `Select the config name and key`,
  },
  WARNINGS: {
    TEXT: 'Warning',
    VARIABLE_CAN_OVERRIDE_SBU:
      'This variable can override or be overridden by a variable injected by one of the created Service Bindings.',
    SBU_CAN_BE_OVERRIDE: {
      BY_CUSTOM_ENV:
        'This variable can override or be overridden by one of the custom variables.',
      BY_SBU:
        'This variable can override or be overridden by a variable injected by one of the Service Bindings.',
      BY_CUSTOM_ENV_AND_SBU:
        'This variable can be overridden by one of the custom variables or a variable injected by one of the Service Bindings.',
    },
  },
  PLACEHOLDERS: {
    VARIABLE_NAME: 'Variable name',
    VARIABLE_VALUE: 'Variable value',
  },
  VARIABLE_TYPE: {
    CUSTOM: {
      TEXT: 'Custom',
      TOOLTIP_MESSAGE: 'This variable was provided by the user.',
    },
    BINDING_USAGE: {
      TEXT: 'Service Binding',
      TOOLTIP_MESSAGE:
        'This variable was injected by the Service Binding referencing Service Instance "{serviceInstanceName}".',
      SHOW_VALUE_MESSAGE: 'Click to show',
      HIDE_VALUE_MESSAGE: 'Click to hide',
    },
    CONFIG_MAP: {
      TEXT: 'Config Map',
      TOOLTIP_MESSAGE:
        'This variable comes from the "{resourceName}" Config Map.',
    },
    SECRET: {
      TEXT: 'Secret',
      TOOLTIP_MESSAGE: 'This variable comes from the "{resourceName}" Secret.',
    },
  },
};

export const FORMS = {
  RESOURCE_NAME: {
    LABEL: 'Name',
    INLINE_HELP: `Name must contain lower case alphanumeric characters, can contain '-'  (like 'my-name1').`,
  },
  LABELS: {
    LABEL: 'Labels',
    INLINE_HELP: `key=value', must start and end with alphanumeric character, can contain '-', '_' or '.'`,
  },
};
