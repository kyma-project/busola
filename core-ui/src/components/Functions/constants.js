export const SERVERLESS_API_VERSION = 'serverless.kyma-project.io/v1alpha1';
export const SERVERLESS_RESOURCE_KIND = 'Function';

export const ERRORS = {
  SERVER: 'functions.errors.server',
};

export const FUNCTION_PHASES = {
  INITIALIZING: 'INITIALIZING',
  BUILDING: 'BUILDING',
  DEPLOYING: 'DEPLOYING',
  UNHEALTHY: 'UNHEALTHY',
  RUNNING: 'RUNNING',
  NEW_REVISION_ERROR: 'NEW REVISION ERROR',
  FAILED: 'FAILED',
};

export const PRETTY_RUNTIME_NODEJS12_NAME = 'Node.js 12 - Deprecated';
export const PRETTY_RUNTIME_NODEJS14_NAME = 'Node.js 14';
export const PRETTY_RUNTIME_NODEJS16_NAME = 'Node.js 16';
export const PRETTY_RUNTIME_PYTHON39_NAME = 'Python 3.9';

export const FUNCTION_ERROR_PHASES = ['FAILED', 'NEW REVISION ERROR'];

export const FUNCTIONS_LIST = {
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
  INLINE: 'functions.create-view.labels.inline-editor',
  GIT: 'functions.create-view.labels.git-repository',
};

export const SERVICE_URL = `/api/v1/namespaces/{namespace}/services/{name}`;

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
