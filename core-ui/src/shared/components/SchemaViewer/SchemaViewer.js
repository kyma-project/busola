import React from 'react';

import { ObjectField } from './ObjectField';

import './SchemaViewer.scss';

export function SchemaViewer({ schema }) {
  const root = schema.openAPIV3Schema;

  return (
    <div className="schema-viewer">
      <ObjectField {...root} />
    </div>
  );
}
