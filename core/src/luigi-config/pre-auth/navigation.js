import { config } from "../config";

const loginNode = {
  hideSideNav: true,
  pathSegment: 'login',
  label: 'Login to Kyma',
  viewUrl: `${config.coreUIModuleUrl}/login`,
};

export const navigation = {
  nodes: [loginNode],
};