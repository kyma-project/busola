import React from 'react';
import SwaggerConsole from '../SwaggerConsole/SwaggerConsole.component';
import { ApiReferencePlugin } from '../SwaggerConsole/plugins';

const SwaggerApireference = props => {
  return <SwaggerConsole plugins={[ApiReferencePlugin]} {...props} />;
};

export default SwaggerApireference;
