import React from 'react';

import './Preferences.scss';
import NamespaceSettings from './NamespaceSettings';
import ThemeChooser from './ThemeChooser';
import LanguageSettings from './LanguageSettings';
import ConfirmationSettings from './ConfirmationSettings';

export default function Preferences() {
  return (
    <main className="preferences">
      <NamespaceSettings />
      <ThemeChooser />
      <LanguageSettings />
      <ConfirmationSettings />
    </main>
  );
}
