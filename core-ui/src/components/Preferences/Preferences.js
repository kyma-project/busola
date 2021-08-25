import React from 'react';

import './Preferences.scss';
import NamespaceSettings from './NamespaceSettings';
import ThemeChooser from './ThemeChooser';
import LanguageSettings from './LanguageSettings';

import { PageHeader } from 'react-shared';

export default function Preferences() {
  return (
    <main className="preferences">
      <PageHeader title="Preferences" />
      <NamespaceSettings />
      <ThemeChooser />
      <LanguageSettings />
    </main>
  );
}
