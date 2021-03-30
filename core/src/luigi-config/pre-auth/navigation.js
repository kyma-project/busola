import { config } from '../config';

const loginNode = {
  hideSideNav: true,
  pathSegment: 'login',
  label: 'Login to Kyma',
  viewUrl: `${config.coreUIModuleUrl}/login`,
};

const redirectNode = {
  hideFromNav: true,
  pathSegment: '*',
  label: '',
  onNodeActivation: console.log,
}

export const navigation = {
  nodes: [loginNode, redirectNode],
};
