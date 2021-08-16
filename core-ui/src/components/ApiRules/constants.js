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
      NOT_MATCHING_SEARCH_QUERY: "Couldn't find API Rules matching this query.",
    },
  },
  CREATE_BUTTON: {
    TEXT: 'Create API Rule',
  },
  EXPOSE_BUTTON: {
    TEXT: 'Expose {type}',
  },
  CREATE_MODAL: {
    TITLE: 'Create API Rule',
    OPEN_BUTTON: {
      TEXT: 'Expose API',
    },
  },
  EDIT_MODAL: {
    TITLE: 'Edit API Rule "{apiRuleName}"',
  },
};

export const ACCESS_STRATEGIES_PANEL = {
  LIST: {
    TITLE: 'Access Strategies',
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
