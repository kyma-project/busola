export const EXCLUDED_SERVICES_LABELS = ['serving.knative.dev/revision'];

export const TOOLBAR = {
  TITLE: 'api-rules.title',
  DESCRIPTION: 'api-rules.messages.description',
};

export const PANEL = {
  LIST: {
    TITLE: 'api-rules.title',
    ERRORS: {
      RESOURCES_NOT_FOUND:
        "This {resourceType} doesn't have any API Rules yet.",
      NOT_MATCHING_SEARCH_QUERY: 'api-rules.messages.not-matching-results',
    },
  },
  CREATE_BUTTON: {
    TEXT: 'api-rules.buttons.create',
  },
  EXPOSE_BUTTON: {
    TEXT: 'api-rules.buttons.expose',
  },
  CREATE_MODAL: {
    TITLE: 'api-rules.buttons.create',
  },
  EDIT_MODAL: {
    TITLE: 'api-rules.buttons.edit',
  },
};

export const ACCESS_STRATEGIES_PANEL = {
  LIST: {
    TITLE: 'api-rules.access-strategies.title',
    ERRORS: {
      NOT_MATCHING_SEARCH_QUERY:
        "Couldn't find Access Strategies matching this query.",
    },
  },
};

export const API_RULES_URL = `/apis/gateway.kyma-project.io/v1alpha1/namespaces/{namespace}/apirules`;
export const API_RULE_URL = `/apis/gateway.kyma-project.io/v1alpha1/namespaces/{namespace}/apirules/{name}`;
export const SERVICES_URL = `/api/v1/namespaces/{namespace}/services`;
export const SERVICE_URL = `/api/v1/namespaces/{namespace}/services/{name}`;
