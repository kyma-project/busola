import React from 'react';

import { JSONSchema } from './ObjectField';

import './SchemaViewer.scss';

export function SchemaViewer({ schema }) {
  const root = schema.openAPIV3Schema;

  return (
    <div className="schema-viewer">
      <JSONSchema root={true} {...root} />
    </div>
  );
}
