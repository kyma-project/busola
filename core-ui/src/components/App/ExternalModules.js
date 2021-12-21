import React from 'react';
import * as jp from 'jsonpath';
import * as _ from 'lodash';
import * as FundamentalReact from 'fundamental-react';
import createLoadRemoteModule, {
  createRequires,
} from '@paciolan/remote-module-loader';

const dependencies = {
  react: React,
  jsonpath: jp,
  lodash: _,
  'fundamental-react': FundamentalReact,
};
const requires = createRequires(dependencies);

const loader = createLoadRemoteModule({ requires });

export async function loadExternalModule(path) {
  return (await loader('http://127.0.0.1:8099' + path)).default;
}
