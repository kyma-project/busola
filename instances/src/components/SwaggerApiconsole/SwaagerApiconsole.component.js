import React from 'react';
import SwaggerConsole from '../SwaggerConsole/SwaggerConsole.component';
import { ApiConsolePlugin } from '../SwaggerConsole/plugins';

const SwaggerApireference = props => {
  return <SwaggerConsole plugins={[ApiConsolePlugin]} {...props} />;
};

export default SwaggerApireference;
