import React, { createContext, useContext, useState, useEffect } from 'react';
import LuigiClient from '@luigi-project/client';

export const ThemeContext = createContext({});

const getInitialTheme = _ => localStorage.getItem('busola.theme') || 'default';

function applyThemeToLinkNode(name, publicUrl) {
  const link = document.querySelector('head #_theme');
  if (name === 'default' && link) {
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
  const [editorTheme, setEditorTheme] = useState(getEditorTheme(theme));

  useEffect(() => {
    if (typeof env.PUBLIC_URL === 'undefined') return;
    applyThemeToLinkNode(theme, env.PUBLIC_URL);
    localStorage.setItem('busola.theme', theme);
    LuigiClient.sendCustomMessage({ id: 'busola.theme', name: theme });
    setEditorTheme(getEditorTheme(theme));
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, editorTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
