import React, { createContext, useContext, useState, useEffect } from 'react';
import LuigiClient from '@luigi-project/client';

export const ThemeContext = createContext({});

const getInitialTheme = _ =>
  localStorage.getItem('busola.theme') || 'light_dark';

function applyThemeToLinkNode(name, publicUrl) {
  const link = document.querySelector('head #_theme');
  if (name === 'light' && link) {
    link.parentNode.removeChild(link);
  }
  if (!link) {
    addLinkNode();
    return applyThemeToLinkNode(name, publicUrl);
  }
  link.href = `${publicUrl || ''}/themes/${name}.css`;
}

function addLinkNode() {
  const newLink = document.createElement('link');
  newLink.id = '_theme';
  newLink.rel = 'stylesheet';
  document.head.appendChild(newLink);
}

const getEditorTheme = theme => {
  switch (theme) {
    case 'dark':
      return 'vs-dark';
    case 'hcb':
      return 'hc-black';
    default:
      return 'vs';
  }
};
export const ThemeProvider = ({ children, env }) => {
  const [theme, setTheme] = useState(getInitialTheme());

  useEffect(() => {
    if (typeof env.PUBLIC_URL === 'undefined') return;
    applyThemeToLinkNode(theme, env.PUBLIC_URL);
    localStorage.setItem('busola.theme', theme);
    LuigiClient.sendCustomMessage({ id: 'busola.theme', name: theme });
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{ theme, editorTheme: getEditorTheme(theme), setTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
