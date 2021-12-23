import createLoadRemoteModule, {
  createRequires,
} from '@paciolan/remote-module-loader';
import { config } from '../config';

const dependencies = {
  react: {}, // shouldn't be used in Luigi mainframe
  'fundamental-react': {}, // the same
  lodash: require('lodash'),
  jsonpath: require('jsonpath'),
};
const requires = createRequires(dependencies);

const loader = createLoadRemoteModule({ requires });

export async function loadExternalModule(path) {
  return (await loader(config.pluginsUrl + path)).default;
}
