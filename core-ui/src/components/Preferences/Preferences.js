import React from 'react';

import './Preferences.scss';
import NamespaceSettings from './NamespaceSettings';

import { PageHeader } from 'react-shared';

export default function Preferences() {
  return (
    <main className="preferences">
      <PageHeader title="Preferences" />
      <NamespaceSettings />
    </main>
  );
}
